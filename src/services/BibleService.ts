
import { BibleBook, BibleVerse } from "@/types/bible";
import { BibleBookService } from "./bible/BibleBookService";
import { BibleChapterService } from "./bible/BibleChapterService";
import { BibleSearchService } from "./bible/BibleSearchService";
import { BibleTextService } from "./BibleTextService";
import { AudioService } from "./AudioService";
import { SettingsService } from "./SettingsService";

export class BibleService {
  // Get all Bible books
  static async getBooks(): Promise<BibleBook[]> {
    try {
      return await BibleBookService.getBooks();
    } catch (error) {
      console.error("Error fetching Bible books:", error);
      return [];
    }
  }

  // Get a specific chapter from a book
  static async getChapter(bookName: string, chapter: number): Promise<BibleVerse[]> {
    try {
      return await BibleChapterService.getChapter(bookName, chapter);
    } catch (error) {
      console.error(`Error fetching chapter ${chapter} from ${bookName}:`, error);
      return [];
    }
  }

   // Search for verses containing a specific query
  static async searchVerses(query: string): Promise<BibleVerse[]> {
    try {
      return await BibleSearchService.searchVerses(query);
    } catch (error) {
      console.error(`Error searching for verses with query "${query}":`, error);
      return [];
    }
  }

  // We've removed the cache-related methods that were causing issues
}
