
import { BibleBook, BibleVerse, BibleChapter } from "@/types/bible";

// Using direct data from Thiago Bodruk's Bible JSON
const BIBLE_BOOKS = [
  { name: "Gênesis", chapters: 50 },
  { name: "Êxodo", chapters: 40 },
  { name: "Levítico", chapters: 27 },
  { name: "Números", chapters: 36 },
  { name: "Deuteronômio", chapters: 34 },
  { name: "Josué", chapters: 24 },
  { name: "Juízes", chapters: 21 },
  { name: "Rute", chapters: 4 },
  { name: "1 Samuel", chapters: 31 },
  { name: "2 Samuel", chapters: 24 },
  { name: "1 Reis", chapters: 22 },
  { name: "2 Reis", chapters: 25 },
  { name: "1 Crônicas", chapters: 29 },
  { name: "2 Crônicas", chapters: 36 },
  { name: "Esdras", chapters: 10 },
  { name: "Neemias", chapters: 13 },
  { name: "Ester", chapters: 10 },
  { name: "Jó", chapters: 42 },
  { name: "Salmos", chapters: 150 },
  { name: "Provérbios", chapters: 31 },
  { name: "Eclesiastes", chapters: 12 },
  { name: "Cânticos", chapters: 8 },
  { name: "Isaías", chapters: 66 },
  { name: "Jeremias", chapters: 52 },
  { name: "Lamentações", chapters: 5 },
  { name: "Ezequiel", chapters: 48 },
  { name: "Daniel", chapters: 12 },
  { name: "Oséias", chapters: 14 },
  { name: "Joel", chapters: 3 },
  { name: "Amós", chapters: 9 },
  { name: "Obadias", chapters: 1 },
  { name: "Jonas", chapters: 4 },
  { name: "Miquéias", chapters: 7 },
  { name: "Naum", chapters: 3 },
  { name: "Habacuque", chapters: 3 },
  { name: "Sofonias", chapters: 3 },
  { name: "Ageu", chapters: 2 },
  { name: "Zacarias", chapters: 14 },
  { name: "Malaquias", chapters: 4 },
  { name: "Mateus", chapters: 28 },
  { name: "Marcos", chapters: 16 },
  { name: "Lucas", chapters: 24 },
  { name: "João", chapters: 21 },
  { name: "Atos", chapters: 28 },
  { name: "Romanos", chapters: 16 },
  { name: "1 Coríntios", chapters: 16 },
  { name: "2 Coríntios", chapters: 13 },
  { name: "Gálatas", chapters: 6 },
  { name: "Efésios", chapters: 6 },
  { name: "Filipenses", chapters: 4 },
  { name: "Colossenses", chapters: 4 },
  { name: "1 Tessalonicenses", chapters: 5 },
  { name: "2 Tessalonicenses", chapters: 3 },
  { name: "1 Timóteo", chapters: 6 },
  { name: "2 Timóteo", chapters: 4 },
  { name: "Tito", chapters: 3 },
  { name: "Filemom", chapters: 1 },
  { name: "Hebreus", chapters: 13 },
  { name: "Tiago", chapters: 5 },
  { name: "1 Pedro", chapters: 5 },
  { name: "2 Pedro", chapters: 3 },
  { name: "1 João", chapters: 5 },
  { name: "2 João", chapters: 1 },
  { name: "3 João", chapters: 1 },
  { name: "Judas", chapters: 1 },
  { name: "Apocalipse", chapters: 22 }
];

export class BibleService {
  private static async fetchBibleData(book: string): Promise<any> {
    try {
      // Replace this URL with the actual path to your JSON files
      const response = await fetch(`https://raw.githubusercontent.com/thiagobodruk/biblia/master/json/ara.json`);
      if (!response.ok) {
        throw new Error('Failed to fetch Bible data');
      }
      const data = await response.json();
      return data.find((b: any) => b.name === book);
    } catch (error) {
      console.error("Error fetching Bible data:", error);
      return null;
    }
  }

  static async getBooks(): Promise<BibleBook[]> {
    return BIBLE_BOOKS;
  }

  static async getChapter(book: string, chapter: number): Promise<BibleVerse[]> {
    try {
      const bookData = await this.fetchBibleData(book);
      if (!bookData || !bookData.chapters || !bookData.chapters[chapter - 1]) {
        return [];
      }

      return bookData.chapters[chapter - 1].map((verse: string, index: number) => ({
        book,
        chapter,
        verse: index + 1,
        text: verse,
      }));
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

      // We'll need to implement a more efficient search strategy for production
      for (const book of BIBLE_BOOKS) {
        const bookData = await this.fetchBibleData(book.name);
        if (!bookData || !bookData.chapters) continue;

        bookData.chapters.forEach((chapter: string[], chapterIndex: number) => {
          chapter.forEach((verse: string, verseIndex: number) => {
            if (verse.toLowerCase().includes(searchQuery)) {
              results.push({
                book: book.name,
                chapter: chapterIndex + 1,
                verse: verseIndex + 1,
                text: verse,
              });
            }
          });
        });

        // Limit results to prevent performance issues
        if (results.length >= 100) break;
      }

      return results;
    } catch (error) {
      console.error("Error searching verses:", error);
      return [];
    }
  }
}
