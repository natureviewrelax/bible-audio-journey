
import { BibleBook } from "@/types/bible";
import { BIBLE_BOOKS } from "@/constants/bibleData";
import { BibleCacheService } from "./BibleCacheService";

export class BibleBookService {
  static async getBooks(): Promise<BibleBook[]> {
    try {
      // Check if we already have books in cache
      const cachedBooks = BibleCacheService.getBibleBooks();
      if (cachedBooks && cachedBooks.length > 0) {
        console.log("Using cached Bible books");
        return cachedBooks;
      }

      // If not in cache, use the constant and cache it
      console.log("Caching Bible books from constants");
      BibleCacheService.setBibleBooks(BIBLE_BOOKS);
      return BIBLE_BOOKS;
    } catch (error) {
      console.error("Error getting Bible books:", error);
      // Return the constant data as fallback even if caching fails
      return BIBLE_BOOKS;
    }
  }
}
