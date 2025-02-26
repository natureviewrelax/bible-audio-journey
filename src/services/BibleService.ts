
import { BibleBook, BibleVerse } from "@/types/bible";
import { BIBLE_BOOKS } from "@/constants/bibleData";
import { AudioService } from "./AudioService";
import { BibleTextService } from "./BibleTextService";

export class BibleService {
  static async getBooks(): Promise<BibleBook[]> {
    return BIBLE_BOOKS;
  }

  static async getChapter(bookName: string, chapter: number): Promise<BibleVerse[]> {
    try {
      const bibleData = await BibleTextService.fetchBibleData();
      const book = bibleData.find((b: any) => b.name === bookName);
      
      if (!book || !book.chapters || !book.chapters[chapter - 1]) {
        return [];
      }

      const defaultAudioUrl = AudioService.getBookAudioUrl(bookName);

      const verses = await Promise.all(book.chapters[chapter - 1].map(async (verse: string, index: number) => {
        const customAudio = await AudioService.getCustomAudio(bookName, chapter, index + 1);
        return {
          book: bookName,
          chapter,
          verse: index + 1,
          text: verse,
          defaultAudioUrl,
          audio: customAudio || undefined,
        };
      }));

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
              const customAudio = await AudioService.getCustomAudio(book.name, chapterIndex + 1, verseIndex + 1);
              results.push({
                book: book.name,
                chapter: chapterIndex + 1,
                verse: verseIndex + 1,
                text: verse,
                defaultAudioUrl,
                audio: customAudio || undefined,
              });
            }
          }
        }

        if (results.length >= 100) break;
      }

      return results;
    } catch (error) {
      console.error("Error searching verses:", error);
      return [];
    }
  }
}
