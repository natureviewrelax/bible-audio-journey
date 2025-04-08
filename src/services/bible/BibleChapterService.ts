
import { BibleVerse } from "@/types/bible";
import { BibleCacheService } from "./BibleCacheService";
import { BibleTextService } from "../BibleTextService";
import { AudioService } from "../AudioService";
import { AuthorService } from "../AuthorService";
import { SettingsService } from "../SettingsService";

export class BibleChapterService {
  static async getChapter(bookName: string, chapter: number): Promise<BibleVerse[]> {
    try {
      console.log(`Carregando capítulo ${chapter} do livro ${bookName}`);
      
      // Carregar dados da Bíblia
      console.log("Carregando texto bíblico");
      let bibleData;
      try {
        bibleData = await BibleTextService.fetchBibleData();
        if (!bibleData || !Array.isArray(bibleData)) {
          console.error("Falha ao carregar dados da Bíblia ou formato inválido");
          return [];
        }
      } catch (error) {
        console.error("Erro ao carregar dados da Bíblia:", error);
        return [];
      }
      
      // Encontrar o livro solicitado
      console.log("Localizando livro:", bookName);
      const book = bibleData.find((b: any) => b.name === bookName);
      if (!book) {
        console.error(`Livro não encontrado: ${bookName}`);
        return [];
      }
      
      // Verificar se o capítulo existe
      if (!book.chapters || !book.chapters[chapter - 1]) {
        console.error(`Capítulo não encontrado: ${bookName} ${chapter}`);
        return [];
      }

      const chapterData = book.chapters[chapter - 1];
      console.log(`Encontrados ${chapterData.length} versículos para ${bookName} ${chapter}`);

      // Obter URL de áudio padrão
      const defaultAudioUrl = AudioService.getBookAudioUrl(bookName);
      const settings = SettingsService.getSettings();
      const preferredAuthorId = settings?.selectedAuthorId;
      
      // Criar array de versículos sem áudio inicialmente
      const verses = chapterData.map((verse: string, index: number) => {
        return {
          book: bookName,
          chapter,
          verse: index + 1,
          text: verse,
          defaultAudioUrl,
        };
      });
      
      console.log(`Criados ${verses.length} versículos básicos para ${bookName} ${chapter}`);
      return verses;
    } catch (error) {
      console.error("Erro ao carregar capítulo:", error);
      return [];
    }
  }

  // Novo método para carregar áudio de um versículo específico sob demanda
  static async loadVerseAudio(verse: BibleVerse, preferredAuthorId?: string): Promise<BibleVerse> {
    try {
      // Se já tiver áudio customizado, retornar como está
      if (verse.audio) {
        return verse;
      }
      
      // Buscar áudio personalizado
      const { url: audioUrl, authorId } = await AudioService.getCustomAudio(
        verse.book, 
        verse.chapter, 
        verse.verse, 
        preferredAuthorId
      );
      
      // Se não tiver áudio personalizado, retornar como está
      if (!audioUrl) {
        return verse;
      }
      
      // Buscar nome do autor se tiver ID do autor
      let authorName;
      if (authorId) {
        try {
          const author = await AuthorService.getAuthor(authorId);
          if (author) {
            authorName = `${author.firstName} ${author.lastName}`;
          }
        } catch (err) {
          console.error(`Erro ao buscar autor ${authorId}:`, err);
        }
      }
      
      // Retornar versículo com áudio e informações do autor
      return {
        ...verse,
        audio: audioUrl,
        authorId,
        authorName
      };
    } catch (error) {
      console.error(`Erro ao carregar áudio para versículo ${verse.book} ${verse.chapter}:${verse.verse}:`, error);
      return verse;
    }
  }
}
