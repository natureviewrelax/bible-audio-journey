
import { BibleBook, BibleVerse } from "@/types/bible";
import { BIBLE_BOOKS } from "@/constants/bibleData";
import { AudioService } from "./AudioService";
import { BibleTextService } from "./BibleTextService";
import { AuthorService } from "./AuthorService";

export class BibleService {
  static async getBooks(): Promise<BibleBook[]> {
    return BIBLE_BOOKS;
  }

  static async getChapter(bookName: string, chapter: number): Promise<BibleVerse[]> {
    try {
      console.log(`Fetching chapter ${chapter} from book ${bookName}`);
      const bibleData = await BibleTextService.fetchBibleData();
      const book = bibleData.find((b: any) => b.name === bookName);
      
      if (!book || !book.chapters || !book.chapters[chapter - 1]) {
        console.error(`Chapter not found: ${bookName} ${chapter}`);
        return [];
      }

      const defaultAudioUrl = AudioService.getBookAudioUrl(bookName);

      const verses = await Promise.all(book.chapters[chapter - 1].map(async (verse: string, index: number) => {
        const verseNumber = index + 1;
        const { url: customAudio, authorId } = await AudioService.getCustomAudio(bookName, chapter, verseNumber);
        
        let authorName;
        if (authorId) {
          const author = await AuthorService.getAuthor(authorId);
          if (author) {
            authorName = `${author.firstName} ${author.lastName}`;
          }
        }
        
        return {
          book: bookName,
          chapter,
          verse: verseNumber,
          text: verse,
          defaultAudioUrl,
          audio: customAudio || undefined,
          authorId,
          authorName,
        };
      }));

      console.log(`Loaded ${verses.length} verses from ${bookName} ${chapter}`);
      return verses;
    } catch (error) {
      console.error("Error fetching chapter:", error);
      return [];
    }
  }

  static async searchVerses(query: string): Promise<BibleVerse[]> {
    if (!query.trim()) {
      return [];
    }

    try {
      console.log(`Searching for: "${query}"`);
      const results: BibleVerse[] = [];
      const searchQuery = query.toLowerCase();
      const bibleData = await BibleTextService.fetchBibleData();

      for (const book of bibleData) {
        if (!book.chapters) continue;
        const defaultAudioUrl = AudioService.getBookAudioUrl(book.name);

        for (let chapterIndex = 0; chapterIndex < book.chapters.length; chapterIndex++) {
          const chapter = book.chapters[chapterIndex];
          for (let verseIndex = 0; verseIndex < chapter.length; verseIndex++) {
            const verse = chapter[verseIndex];
            if (verse.toLowerCase().includes(searchQuery)) {
              const verseNumber = verseIndex + 1;
              const { url: customAudio, authorId } = await AudioService.getCustomAudio(book.name, chapterIndex + 1, verseNumber);
              
              let authorName;
              if (authorId) {
                const author = await AuthorService.getAuthor(authorId);
                if (author) {
                  authorName = `${author.firstName} ${author.lastName}`;
                }
              }

              results.push({
                book: book.name,
                chapter: chapterIndex + 1,
                verse: verseNumber,
                text: verse,
                defaultAudioUrl,
                audio: customAudio || undefined,
                authorId,
                authorName,
              });
            }
          }
        }

        if (results.length >= 100) break;
      }

      console.log(`Found ${results.length} verses matching "${query}"`);
      return results;
    } catch (error) {
      console.error("Error searching verses:", error);
      return [];
    }
  }
}
