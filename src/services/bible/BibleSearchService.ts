
import { BibleVerse } from "@/types/bible";
import { BibleCacheService } from "./BibleCacheService";
import { BibleTextService } from "../BibleTextService";
import { AudioService } from "../AudioService";
import { AuthorService } from "../AuthorService";
import { SettingsService } from "../SettingsService";

export class BibleSearchService {
  static async searchVerses(query: string): Promise<BibleVerse[]> {
    // Return empty array for empty queries
    if (!query.trim()) {
      return [];
    }

    try {
      console.log(`Searching for: "${query}"`);
      const results: BibleVerse[] = [];
      const searchQuery = query.toLowerCase();
      
      // Always fetch fresh Bible data without using cache
      console.log("Fetching fresh Bible data for search");
      const bibleData = await BibleTextService.fetchBibleData();
      
      // Get user's preferred author settings
      const settings = SettingsService.getSettings();
      const preferredAuthorId = settings?.selectedAuthorId;

      // Search through all books
      for (const book of bibleData) {
        if (!book.chapters) continue;
        const defaultAudioUrl = AudioService.getBookAudioUrl(book.name);

        // Search through chapters and verses
        for (let chapterIndex = 0; chapterIndex < book.chapters.length; chapterIndex++) {
          const chapter = book.chapters[chapterIndex];
          for (let verseIndex = 0; verseIndex < chapter.length; verseIndex++) {
            const verse = chapter[verseIndex];
            
            // Check if verse contains the query
            if (verse.toLowerCase().includes(searchQuery)) {
              const verseNumber = verseIndex + 1;
              
              // Get custom audio for this verse if available
              const { url: customAudio, authorId } = await AudioService.getCustomAudio(
                book.name, 
                chapterIndex + 1, 
                verseNumber,
                preferredAuthorId
              );
              
              // Get author name if available
              let authorName;
              if (authorId) {
                const cachedAuthorMap = BibleCacheService.getAuthorCache(`${book.name}-${chapterIndex + 1}`);
                if (cachedAuthorMap && cachedAuthorMap.has(authorId)) {
                  authorName = cachedAuthorMap.get(authorId);
                } else {
                  const author = await AuthorService.getAuthor(authorId);
                  if (author) {
                    authorName = `${author.firstName} ${author.lastName}`;
                  }
                }
              }

              // Add verse to results
              results.push({
                book: book.name,
                chapter: chapterIndex + 1,
                verse: verseNumber,
                text: verse,
                defaultAudioUrl,
                audio: customAudio || undefined,
                authorId,
                authorName,
              });
            }
          }
        }

        // Limit results to prevent performance issues
        if (results.length >= 100) break;
      }

      console.log(`Found ${results.length} verses matching "${query}"`);
      return results;
    } catch (error) {
      console.error("Error searching verses:", error);
      return [];
    }
  }
}
