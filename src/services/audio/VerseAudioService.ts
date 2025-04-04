
import { supabase } from "@/integrations/supabase/client";
import { BaseAudioService } from "./BaseAudioService";

export class VerseAudioService {
  private static audioCache = new Map<string, Map<number, {url: string, authorId: string | null}>>();
  private static cacheTimeout = 10 * 60 * 1000; // 10 minutos em milissegundos
  private static lastCacheUpdate = new Map<string, number>();
  private static errorCache = new Map<string, {timestamp: number, retryCount: number}>();
  private static errorCacheTimeout = 30 * 1000; // 30 segundos para tentar novamente após erro

  private static getCacheKey(bookName: string, chapter: number): string {
    return `${bookName}-${chapter}`;
  }

  private static isCacheValid(cacheKey: string): boolean {
    const lastUpdate = this.lastCacheUpdate.get(cacheKey);
    if (!lastUpdate) return false;
    return Date.now() - lastUpdate < this.cacheTimeout;
  }

  private static canRetryAfterError(cacheKey: string): boolean {
    const errorInfo = this.errorCache.get(cacheKey);
    if (!errorInfo) return true;
    
    const timeSinceLastError = Date.now() - errorInfo.timestamp;
    return timeSinceLastError >= this.errorCacheTimeout;
  }

  private static updateErrorCache(cacheKey: string) {
    const errorInfo = this.errorCache.get(cacheKey) || { timestamp: 0, retryCount: 0 };
    this.errorCache.set(cacheKey, {
      timestamp: Date.now(),
      retryCount: errorInfo.retryCount + 1
    });
  }

  static async getChapterAudio(bookName: string, chapter: number, preferredAuthorId?: string): Promise<Map<number, {url: string, authorId: string | null}>> {
    const cacheKey = this.getCacheKey(bookName, chapter);
    
    // Verifica o cache primeiro
    if (this.isCacheValid(cacheKey)) {
      const cachedData = this.audioCache.get(cacheKey);
      if (cachedData) {
        console.log(`Usando dados em cache para ${bookName} capítulo ${chapter}`);
        return new Map(cachedData);
      }
    }

    // Verifica se podemos tentar novamente após um erro
    if (!this.canRetryAfterError(cacheKey)) {
      console.log(`Aguardando timeout de erro para ${bookName} capítulo ${chapter}`);
      return new Map();
    }

    const audioMap = new Map<number, {url: string, authorId: string | null}>();
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        console.log(`Carregando áudio para ${bookName} capítulo ${chapter} (tentativa ${retryCount + 1})`);
        
        const baseQuery = {
          book: bookName,
          chapter: chapter
        };
        
        let records = [];

        // Primeiro, tenta carregar os áudios do autor preferido
        if (preferredAuthorId) {
          const { data: preferredData, error: preferredError } = await supabase
            .from('verse_audio')
            .select('audio_path, author_id, verse')
            .match({...baseQuery, author_id: preferredAuthorId});
          
          if (!preferredError && preferredData?.length > 0) {
            console.log(`Encontrados ${preferredData.length} áudios do autor preferido`);
            records = preferredData;
          }
        }
        
        // Se não encontrou áudios do autor preferido, busca todos os disponíveis
        if (records.length === 0) {
          const { data: allData, error: allError } = await supabase
            .from('verse_audio')
            .select('audio_path, author_id, verse')
            .match(baseQuery)
            .order('verse', { ascending: true });
          
          if (allError) throw allError;
          
          if (allData?.length > 0) {
            console.log(`Encontrados ${allData.length} áudios no total`);
            records = allData;
          } else {
            console.log("Nenhum áudio personalizado encontrado para este capítulo");
          }
        }
        
        // Processa os registros para obter URLs públicas com validação
        for (const audioRecord of records) {
          if (!audioRecord.audio_path) {
            console.warn(`Registro de áudio inválido encontrado para verso ${audioRecord.verse}`);
            continue;
          }

          try {
            const publicUrl = BaseAudioService.getPublicUrl(audioRecord.audio_path);
            if (!publicUrl) {
              console.warn(`URL pública não gerada para o áudio ${audioRecord.audio_path}`);
              continue;
            }

            audioMap.set(audioRecord.verse, {
              url: publicUrl,
              authorId: audioRecord.author_id
            });
          } catch (urlError) {
            console.error(`Erro ao gerar URL pública para o áudio ${audioRecord.audio_path}:`, urlError);
            this.updateErrorCache(cacheKey);
          }
        }

        // Se não conseguiu processar nenhum áudio, registra o erro
        if (records.length > 0 && audioMap.size === 0) {
          console.error(`Falha ao processar todos os áudios para ${bookName} capítulo ${chapter}`);
          this.updateErrorCache(cacheKey);
        }
        
        // Atualiza o cache
        this.audioCache.set(cacheKey, new Map(audioMap));
        this.lastCacheUpdate.set(cacheKey, Date.now());
        
        return audioMap;
      } catch (error) {
        console.error(`Erro em getChapterAudio (tentativa ${retryCount + 1}):`, error);
        retryCount++;
        
        if (retryCount === maxRetries) {
          console.error(`Todas as tentativas falharam para ${bookName} capítulo ${chapter}`);
          return new Map(); // Retorna um mapa vazio após todas as tentativas
        }
        
        // Espera um tempo antes de tentar novamente (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
      }
    }
    
    return new Map(); // Fallback final
  }

  private static verseCache = new Map<string, { url: string | null; authorId: string | null; timestamp: number }>();

  private static getVerseCacheKey(bookName: string, chapter: number, verse: number): string {
    return `${bookName}-${chapter}-${verse}`;
  }

  static async getCustomAudio(bookName: string, chapter: number, verse: number, preferredAuthorId?: string): Promise<{ url: string | null; authorId: string | null }> {
    const cacheKey = this.getVerseCacheKey(bookName, chapter, verse);
    const cachedData = this.verseCache.get(cacheKey);

    // Verifica se há dados em cache válidos
    if (cachedData && Date.now() - cachedData.timestamp < this.cacheTimeout) {
      return { url: cachedData.url, authorId: cachedData.authorId };
    }

    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      try {
        const baseQuery = {
          book: bookName,
          chapter: chapter,
          verse: verse
        };
        
        let audioRecord = null;
        
        // Tenta obter a gravação do autor preferido primeiro
        if (preferredAuthorId) {
          const { data: authorData, error: authorError } = await supabase
            .from('verse_audio')
            .select('audio_path, author_id')
            .match({...baseQuery, author_id: preferredAuthorId})
            .maybeSingle();
          
          if (!authorError && authorData) {
            audioRecord = authorData;
          }
        }
        
        // Se não encontrou gravação do autor preferido, busca qualquer gravação disponível
        if (!audioRecord) {
          const { data, error } = await supabase
            .from('verse_audio')
            .select('audio_path, author_id')
            .match(baseQuery)
            .maybeSingle();
          
          if (error) throw error;
          if (!data) {
            const result = { url: null, authorId: null };
            this.verseCache.set(cacheKey, { ...result, timestamp: Date.now() });
            return result;
          }
          
          audioRecord = data;
        }
        
        // Obtém a URL pública para o arquivo de áudio
        const publicUrl = BaseAudioService.getPublicUrl(audioRecord.audio_path);
        const result = { 
          url: publicUrl, 
          authorId: audioRecord.author_id 
        };

        // Atualiza o cache
        this.verseCache.set(cacheKey, { ...result, timestamp: Date.now() });
        return result;

      } catch (error) {
        console.error(`Erro em getCustomAudio (tentativa ${retryCount + 1}):`, error);
        retryCount++;

        if (retryCount === maxRetries) {
          const result = { url: null, authorId: null };
          this.verseCache.set(cacheKey, { ...result, timestamp: Date.now() });
          return result;
        }

        // Espera um tempo antes de tentar novamente (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
      }
    }

    return { url: null, authorId: null };
  }

  static async updateVerseAudioAuthor(bookName: string, chapter: number, verse: number, authorId: string | null): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('verse_audio')
        .update({ author_id: authorId })
        .match({
          book: bookName,
          chapter: chapter,
          verse: verse
        });

      if (error) {
        console.error("Error updating verse audio author:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in updateVerseAudioAuthor:", error);
      return false;
    }
  }
}
