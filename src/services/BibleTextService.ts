
export class BibleTextService {
  private static bibleData: any = null;

  static async fetchBibleData(): Promise<any> {
    if (this.bibleData) {
      return this.bibleData;
    }

    try {
      const response = await fetch('SF_20250903_POR_ACF_(PORTUGUESE CORRIGIDA FIEL 1995.json');
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
