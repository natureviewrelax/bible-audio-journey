
import { BibleVerse } from "@/types/bible";
import { BibleCacheService } from "./BibleCacheService";
import { BibleTextService } from "../BibleTextService";
import { AudioService } from "../AudioService";
import { AuthorService } from "../AuthorService";
import { SettingsService } from "../SettingsService";

export class BibleChapterService {
  static async getChapter(bookName: string, chapter: number): Promise<BibleVerse[]> {
    try {
      console.log(`Fetching chapter ${chapter} from book ${bookName}`);
      
      let bibleDataCache = BibleCacheService.getBibleCache();
      if (!bibleDataCache) {
        bibleDataCache = await BibleTextService.fetchBibleData();
        BibleCacheService.setBibleCache(bibleDataCache);
      }
      
      const book = bibleDataCache.find((b: any) => b.name === bookName);
      if (!book || !book.chapters || !book.chapters[chapter - 1]) {
        console.error(`Chapter not found: ${bookName} ${chapter}`);
        return [];
      }

      const defaultAudioUrl = AudioService.getBookAudioUrl(bookName);
      const settings = SettingsService.getSettings();
      const preferredAuthorId = settings?.selectedAuthorId;
      
      const chapterAudio = await AudioService.getChapterAudio(bookName, chapter, preferredAuthorId);
      
      const authorIds = new Set<string>();
      chapterAudio.forEach(audioData => {
        if (audioData.authorId) {
          authorIds.add(audioData.authorId);
        }
      });
      
      let authorMap = BibleCacheService.getAuthorCache(`${bookName}-${chapter}`);
      if (!authorMap) {
        authorMap = new Map<string, string>();
        for (const authorId of authorIds) {
          const author = await AuthorService.getAuthor(authorId);
          if (author) {
            authorMap.set(authorId, `${author.firstName} ${author.lastName}`);
          }
        }
        BibleCacheService.setAuthorCache(`${bookName}-${chapter}`, authorMap);
      }

      const verses = book.chapters[chapter - 1].map((verse: string, index: number) => {
        const verseNumber = index + 1;
        const audioData = chapterAudio.get(verseNumber);
        
        return {
          book: bookName,
          chapter,
          verse: verseNumber,
          text: verse,
          defaultAudioUrl,
          audio: audioData?.url,
          authorId: audioData?.authorId || undefined,
          authorName: audioData?.authorId ? authorMap.get(audioData.authorId) : undefined,
        };
      });

      console.log(`Loaded ${verses.length} verses from ${bookName} ${chapter}`);
      return verses;
    } catch (error) {
      console.error("Error fetching chapter:", error);
      return [];
    }
  }
}
