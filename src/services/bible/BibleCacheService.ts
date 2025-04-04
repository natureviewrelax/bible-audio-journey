
import { BibleBook, AudioAuthor } from "@/types/bible";

// Define interfaces for cache structures
interface BibleCache {
  books: BibleBook[];
  fullData: any;
}

// Cache for Bible data
let bibleCache: BibleCache | null = null;
let bookAuthorsCache = new Map<string, Map<string, string>>();

export class BibleCacheService {
  // Bible data cache methods
  static getBibleFullData(): any {
    return bibleCache?.fullData || null;
  }

  static setBibleFullData(data: any): void {
    if (!bibleCache) {
      bibleCache = { books: [], fullData: null };
    }
    bibleCache.fullData = data;
  }

  static getBibleBooks(): BibleBook[] {
    return bibleCache?.books || [];
  }

  static setBibleBooks(books: BibleBook[]): void {
    if (!bibleCache) {
      bibleCache = { books: [], fullData: null };
    }
    bibleCache.books = books;
  }

  static hasBibleData(): boolean {
    return !!bibleCache?.fullData;
  }

  // Author cache methods
  static getAuthorCache(key: string): Map<string, string> | undefined {
    return bookAuthorsCache.get(key);
  }

  static setAuthorCache(key: string, authorMap: Map<string, string>): void {
    bookAuthorsCache.set(key, authorMap);
  }

  static clearCache(): void {
    bibleCache = null;
    bookAuthorsCache.clear();
    console.log("Bible cache cleared successfully");
  }
}
