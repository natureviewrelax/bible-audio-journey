
import { BibleBook, BibleVerse } from "@/types/bible";
import { BibleBookService } from "./bible/BibleBookService";
import { BibleChapterService } from "./bible/BibleChapterService";
import { BibleSearchService } from "./bible/BibleSearchService";
import { BibleCacheService } from "./bible/BibleCacheService";

export class BibleService {
  static async getBooks(): Promise<BibleBook[]> {
    return BibleBookService.getBooks();
  }

  static async getChapter(bookName: string, chapter: number): Promise<BibleVerse[]> {
    return BibleChapterService.getChapter(bookName, chapter);
  }

  static async searchVerses(query: string): Promise<BibleVerse[]> {
    return BibleSearchService.searchVerses(query);
  }

  // Clear cache method for manual cache invalidation
  static clearCache() {
    BibleCacheService.clearCache();
  }
}
