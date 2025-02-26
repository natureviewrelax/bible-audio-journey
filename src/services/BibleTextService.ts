
export class BibleTextService {
  private static bibleData: any = null;

  static async fetchBibleData(): Promise<any> {
    if (this.bibleData) {
      return this.bibleData;
    }

    try {
      const response = await fetch('https://raw.githubusercontent.com/natureviewrelax/bible-audio-journey/refs/heads/main/public/acf.json');
      if (!response.ok) {
        throw new Error('Failed to fetch Bible data');
      }
      this.bibleData = await response.json();
      return this.bibleData;
    } catch (error) {
      console.error("Error fetching Bible data:", error);
      throw error;
    }
  }
}
