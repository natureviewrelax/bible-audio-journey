
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
      console.log("Fetching Bible books");
      const books = await BibleBookService.getBooks();
      console.log(`Successfully fetched ${books.length} Bible books`);
      return books;
    } catch (error) {
      console.error("Error fetching Bible books:", error);
      // Return empty array to prevent crashing
      return [];
    }
  }

  // Get a specific chapter from a book
  static async getChapter(bookName: string, chapter: number): Promise<BibleVerse[]> {
    try {
      console.log(`Fetching chapter ${chapter} from book ${bookName}`);
      const verses = await BibleChapterService.getChapter(bookName, chapter);
      console.log(`Successfully fetched ${verses.length} verses from ${bookName} ${chapter}`);
      return verses;
    } catch (error) {
      console.error(`Error fetching chapter ${chapter} from ${bookName}:`, error);
      // Return empty array to prevent crashing
      return [];
    }
  }

   // Search for verses containing a specific query
  static async searchVerses(query: string): Promise<BibleVerse[]> {
    try {
      console.log(`Searching for verses with query "${query}"`);
      const results = await BibleSearchService.searchVerses(query);
      console.log(`Found ${results.length} results for query "${query}"`);
      return results;
    } catch (error) {
      console.error(`Error searching for verses with query "${query}":`, error);
      // Return empty array to prevent crashing
      return [];
    }
  }
}
