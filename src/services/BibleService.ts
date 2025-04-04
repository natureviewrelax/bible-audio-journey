
import { BibleBook, BibleVerse } from "@/types/bible";
import { BibleBookService } from "./bible/BibleBookService";
import { BibleChapterService } from "./bible/BibleChapterService";
import { BibleSearchService } from "./bible/BibleSearchService";
import { BibleCacheService } from "./bible/BibleCacheService";

export class BibleService {
  // Get all Bible books
  static async getBooks(): Promise<BibleBook[]> {
    return BibleBookService.getBooks();
  }

  // Get a specific chapter from a book
  static async getChapter(bookName: string, chapter: number): Promise<BibleVerse[]> {
    return BibleChapterService.getChapter(bookName, chapter);
  }

  // Search for verses containing a specific query
  static async searchVerses(query: string): Promise<BibleVerse[]> {
    return BibleSearchService.searchVerses(query);
  }

  // Check if Bible data is cached
  static isCached(): boolean {
    return BibleCacheService.hasBibleData();
  }

  // Clear cache method for manual cache invalidation
  static clearCache() {
    BibleCacheService.clearCache();
  }
}
