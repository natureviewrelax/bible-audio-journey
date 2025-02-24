
import { BibleBook, BibleVerse } from "@/types/bible";

const BIBLE_DATA_URL = "https://www.abibliadigital.com.br/api/verses/acf/"; // We'll use this API for demonstration

export class BibleService {
  static async getBooks(): Promise<BibleBook[]> {
    // Temporary mock data - replace with actual API call
    return [
      { name: "Gênesis", chapters: 50 },
      { name: "Êxodo", chapters: 40 },
      // Add more books...
    ];
  }

  static async getChapter(book: string, chapter: number): Promise<BibleVerse[]> {
    try {
      const response = await fetch(`${BIBLE_DATA_URL}${book}/${chapter}`);
      const data = await response.json();
      return data.verses.map((verse: any) => ({
        book,
        chapter,
        verse: verse.number,
        text: verse.text,
      }));
    } catch (error) {
      console.error("Error fetching chapter:", error);
      return [];
    }
  }

  static async searchVerses(query: string): Promise<BibleVerse[]> {
    // Implement verse search functionality
    // This would typically connect to a search API
    return [];
  }
}
