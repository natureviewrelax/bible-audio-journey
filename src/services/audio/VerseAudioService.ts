
import { supabase } from "@/integrations/supabase/client";
import { BaseAudioService } from "./BaseAudioService";

export class VerseAudioService {
  // Simplificar para um cache básico por versículo individual
  private static verseAudioCache = new Map<string, { url: string | null; authorId: string | null; timestamp: number }>();
  private static cacheTimeout = 5 * 60 * 1000; // 5 minutos em milissegundos

  private static getVerseCacheKey(bookName: string, chapter: number, verse: number): string {
    return `${bookName}-${chapter}-${verse}`;
  }

  // Método otimizado para buscar áudio de um versículo específico
  static async getCustomAudio(bookName: string, chapter: number, verse: number, preferredAuthorId?: string): Promise<{ url: string | null; authorId: string | null }> {
    const cacheKey = this.getVerseCacheKey(bookName, chapter, verse);
    const cachedData = this.verseAudioCache.get(cacheKey);

    // Verificar cache
    if (cachedData && Date.now() - cachedData.timestamp < this.cacheTimeout) {
      console.log(`Usando áudio em cache para ${bookName} ${chapter}:${verse}`);
      return { url: cachedData.url, authorId: cachedData.authorId };
    }

    try {
      console.log(`Carregando áudio para ${bookName} ${chapter}:${verse}`);
      
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
        
        if (error) {
          console.error(`Erro ao buscar áudio para ${bookName} ${chapter}:${verse}`, error);
          const noResult = { url: null, authorId: null };
          this.verseAudioCache.set(cacheKey, { ...noResult, timestamp: Date.now() });
          return noResult;
        }
        
        if (!data) {
          console.log(`Nenhum áudio encontrado para ${bookName} ${chapter}:${verse}`);
          const noResult = { url: null, authorId: null };
          this.verseAudioCache.set(cacheKey, { ...noResult, timestamp: Date.now() });
          return noResult;
        }
        
        audioRecord = data;
      }
      
      // Obtém a URL pública para o arquivo de áudio
      if (!audioRecord.audio_path) {
        console.warn(`Caminho de áudio inválido para ${bookName} ${chapter}:${verse}`);
        const noResult = { url: null, authorId: null };
        this.verseAudioCache.set(cacheKey, { ...noResult, timestamp: Date.now() });
        return noResult;
      }

      const publicUrl = BaseAudioService.getPublicUrl(audioRecord.audio_path);
      const result = { 
        url: publicUrl, 
        authorId: audioRecord.author_id 
      };

      // Atualiza o cache
      this.verseAudioCache.set(cacheKey, { ...result, timestamp: Date.now() });
      console.log(`Áudio carregado com sucesso para ${bookName} ${chapter}:${verse}`);
      return result;
    } catch (error) {
      console.error(`Erro ao carregar áudio para ${bookName} ${chapter}:${verse}`, error);
      const noResult = { url: null, authorId: null };
      this.verseAudioCache.set(cacheKey, { ...noResult, timestamp: Date.now() });
      return noResult;
    }
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
        console.error("Erro ao atualizar autor do áudio:", error);
        return false;
      }

      // Limpar cache para este versículo
      const cacheKey = this.getVerseCacheKey(bookName, chapter, verse);
      this.verseAudioCache.delete(cacheKey);

      return true;
    } catch (error) {
      console.error("Erro ao atualizar autor do áudio:", error);
      return false;
    }
  }
}
