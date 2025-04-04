
import { AudioAuthor } from "@/types/bible";

// Cache for Bible data
let bibleDataCache: any = null;
let bookAuthorsCache = new Map<string, Map<string, string>>();

export class BibleCacheService {
  static getBibleCache(): any {
    return bibleDataCache;
  }

  static setBibleCache(data: any): void {
    bibleDataCache = data;
  }

  static getAuthorCache(key: string): Map<string, string> | undefined {
    return bookAuthorsCache.get(key);
  }

  static setAuthorCache(key: string, authorMap: Map<string, string>): void {
    bookAuthorsCache.set(key, authorMap);
  }

  static clearCache(): void {
    bibleDataCache = null;
    bookAuthorsCache.clear();
  }
}
