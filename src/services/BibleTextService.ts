
export class BibleTextService {
  static async fetchBibleData(): Promise<any> {
    try {
      console.log("Fetching Bible data from JSON file");
      
      // Add cache buster to prevent browser caching
      const cacheBuster = `?_=${Date.now()}`;
      const response = await fetch('/SF_20251803_PORTUGUESEJFAC_1848.json' + cacheBuster);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch Bible data: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`Bible data loaded successfully with ${data.length} books`);
      
      return data;
    } catch (error) {
      console.error("Error fetching Bible data:", error);
      // Rethrow to allow calling code to handle the error
      throw new Error(`Failed to load Bible data: ${error.message}`);
    }
  }
}
