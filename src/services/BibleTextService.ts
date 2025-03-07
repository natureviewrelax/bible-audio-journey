
export class BibleTextService {
  private static bibleData: any = null;
  private static dataPromise: Promise<any> | null = null;

  static async fetchBibleData(): Promise<any> {
    // If data already loaded, return immediately
    if (this.bibleData) {
      return this.bibleData;
    }

    // If there's already a request in progress, return that promise
    if (this.dataPromise) {
      return this.dataPromise;
    }

    // Start a new request
    this.dataPromise = new Promise(async (resolve, reject) => {
      try {
        const response = await fetch('KJF.json');
        if (!response.ok) {
          throw new Error('Failed to fetch Bible data');
        }
        this.bibleData = await response.json();
        resolve(this.bibleData);
      } catch (error) {
        console.error("Error fetching Bible data:", error);
        this.dataPromise = null; // Reset promise so we can try again
        reject(error);
      }
    });

    return this.dataPromise;
  }
}
