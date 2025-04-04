
import { BibleCacheService } from "./bible/BibleCacheService";

export class BibleTextService {
  static async fetchBibleData(): Promise<any> {
    // Check if data is already cached
    const cachedData = BibleCacheService.getBibleFullData();
    if (cachedData) {
      console.log("Returning cached Bible data");
      return cachedData;
    }

    try {
      console.log("Fetching Bible data from JSON file");
      const response = await fetch('/SF_20251803_PORTUGUESEJFAC_1848.json');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch Bible data: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`Bible data loaded successfully with ${data.length} books`);
      
      // Cache the data for future use
      BibleCacheService.setBibleFullData(data);
      return data;
    } catch (error) {
      console.error("Error fetching Bible data:", error);
      throw error;
    }
  }
}
