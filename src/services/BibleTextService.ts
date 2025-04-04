
export class BibleTextService {
  private static bibleData: any = null;

  static async fetchBibleData(): Promise<any> {
    if (this.bibleData) {
      console.log("Returning cached Bible data");
      return this.bibleData;
    }

    try {
      console.log("Fetching Bible data from JSON file");
      const response = await fetch('/SF_20251803_PORTUGUESEJFAC_1848.json');
      if (!response.ok) {
        throw new Error(`Failed to fetch Bible data: ${response.status} ${response.statusText}`);
      }
      this.bibleData = await response.json();
      console.log("Bible data loaded successfully with books:", this.bibleData.length);
      return this.bibleData;
    } catch (error) {
      console.error("Error fetching Bible data:", error);
      throw error;
    }
  }
}
