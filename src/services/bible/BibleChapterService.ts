
import { BibleVerse } from "@/types/bible";
import { BibleCacheService } from "./BibleCacheService";
import { BibleTextService } from "../BibleTextService";
import { AudioService } from "../AudioService";
import { AuthorService } from "../AuthorService";
import { SettingsService } from "../SettingsService";

export class BibleChapterService {
  static async getChapter(bookName: string, chapter: number): Promise<BibleVerse[]> {
    try {
      console.log(`Fetching chapter ${chapter} from book ${bookName}`);
      
      // Always fetch fresh Bible data
      console.log("Fetching fresh Bible data");
      let bibleData;
      try {
        bibleData = await BibleTextService.fetchBibleData();
        if (!bibleData || !Array.isArray(bibleData)) {
          console.error("Failed to fetch Bible data or invalid format");
          return [];
        }
      } catch (error) {
        console.error("Error fetching Bible data:", error);
        return [];
      }
      
      // Find the requested book
      console.log("Finding book:", bookName);
      const book = bibleData.find((b: any) => b.name === bookName);
      if (!book) {
        console.error(`Book not found: ${bookName}`);
        return [];
      }
      
      // Check if the chapter exists
      if (!book.chapters || !book.chapters[chapter - 1]) {
        console.error(`Chapter not found: ${bookName} ${chapter}`);
        return [];
      }

      const chapterData = book.chapters[chapter - 1];
      console.log(`Found chapter data for ${bookName} ${chapter} with ${chapterData.length} verses`);

      // Get default audio URL and user preferences
      const defaultAudioUrl = AudioService.getBookAudioUrl(bookName);
      const settings = SettingsService.getSettings();
      const preferredAuthorId = settings?.selectedAuthorId;
      
      try {
        // Get audio data for this chapter
        console.log(`Carregando áudio para ${bookName} capítulo ${chapter} (tentativa 1)`);
        const chapterAudio = await AudioService.getChapterAudio(bookName, chapter, preferredAuthorId);
        
        // Collect unique author IDs
        const authorIds = new Set<string>();
        chapterAudio.forEach(audioData => {
          if (audioData.authorId) {
            authorIds.add(audioData.authorId);
          }
        });
        
        // Get author names from cache or fetch them
        let authorMap = BibleCacheService.getAuthorCache(`${bookName}-${chapter}`);
        if (!authorMap) {
          authorMap = new Map<string, string>();
          for (const authorId of authorIds) {
            try {
              const author = await AuthorService.getAuthor(authorId);
              if (author) {
                authorMap.set(authorId, `${author.firstName} ${author.lastName}`);
              }
            } catch (err) {
              console.error(`Error fetching author ${authorId}:`, err);
            }
          }
          BibleCacheService.setAuthorCache(`${bookName}-${chapter}`, authorMap);
        }

        // Map the verses with their audio data
        const verses = chapterData.map((verse: string, index: number) => {
          const verseNumber = index + 1;
          const audioData = chapterAudio.get(verseNumber);
          
          return {
            book: bookName,
            chapter,
            verse: verseNumber,
            text: verse,
            defaultAudioUrl,
            audio: audioData?.url,
            authorId: audioData?.authorId || undefined,
            authorName: audioData?.authorId ? authorMap.get(audioData.authorId) : undefined,
          };
        });

        console.log(`Successfully loaded ${verses.length} verses from ${bookName} ${chapter}`);
        return verses;
      } catch (audioError) {
        console.error("Error loading audio data:", audioError);
        
        // Just return verses with text even if audio fails
        const verses = chapterData.map((verse: string, index: number) => {
          return {
            book: bookName,
            chapter,
            verse: index + 1,
            text: verse,
            defaultAudioUrl,
          };
        });
        
        console.log(`Loaded ${verses.length} verses from ${bookName} ${chapter} without audio`);
        return verses;
      }
    } catch (error) {
      console.error("Error fetching chapter:", error);
      return [];  // Return empty array instead of throwing to prevent cascading errors
    }
  }
}
