
import { BibleBook, BibleVerse } from "@/types/bible";
import { BIBLE_BOOKS } from "@/constants/bibleData";
import { AudioService } from "./AudioService";
import { BibleTextService } from "./BibleTextService";
import { AuthorService } from "./AuthorService";
import { SettingsService } from "./SettingsService";

// Cache for Bible data
let bibleDataCache: any = null;
let bookAuthorsCache = new Map<string, Map<string, string>>();

export class BibleService {
  static async getBooks(): Promise<BibleBook[]> {
    return BIBLE_BOOKS;
  }

  static async getChapter(bookName: string, chapter: number): Promise<BibleVerse[]> {
    try {
      console.log(`Fetching chapter ${chapter} from book ${bookName}`);
      
      // Use cached Bible data if available
      if (!bibleDataCache) {
        bibleDataCache = await BibleTextService.fetchBibleData();
      }
      
      const book = bibleDataCache.find((b: any) => b.name === bookName);
      if (!book || !book.chapters || !book.chapters[chapter - 1]) {
        console.error(`Chapter not found: ${bookName} ${chapter}`);
        return [];
      }

      const defaultAudioUrl = AudioService.getBookAudioUrl(bookName);
      const settings = SettingsService.getSettings();
      const preferredAuthorId = settings?.selectedAuthorId;
      
      // Get all audio data for this chapter in a single query
      const chapterAudio = await AudioService.getChapterAudio(bookName, chapter, preferredAuthorId);
      
      // Get unique author IDs from the audio data
      const authorIds = new Set<string>();
      chapterAudio.forEach(audioData => {
        if (audioData.authorId) {
          authorIds.add(audioData.authorId);
        }
      });
      
      // Use cached authors data if available, or fetch and cache it
      let authorMap = bookAuthorsCache.get(`${bookName}-${chapter}`);
      if (!authorMap) {
        authorMap = new Map<string, string>();
        for (const authorId of authorIds) {
          const author = await AuthorService.getAuthor(authorId);
          if (author) {
            authorMap.set(authorId, `${author.firstName} ${author.lastName}`);
          }
        }
        bookAuthorsCache.set(`${bookName}-${chapter}`, authorMap);
      }

      // Map verses with audio data
      const verses = book.chapters[chapter - 1].map((verse: string, index: number) => {
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

      console.log(`Loaded ${verses.length} verses from ${bookName} ${chapter}`);
      return verses;
    } catch (error) {
      console.error("Error fetching chapter:", error);
      return [];
    }
  }

  // Clear cache method for manual cache invalidation
  static clearCache() {
    bibleDataCache = null;
    bookAuthorsCache.clear();
  }

  static async searchVerses(query: string): Promise<BibleVerse[]> {
    if (!query.trim()) {
      return [];
    }

    try {
      console.log(`Searching for: "${query}"`);
      const results: BibleVerse[] = [];
      const searchQuery = query.toLowerCase();
      
      // Use cached Bible data if available
      if (!bibleDataCache) {
        bibleDataCache = await BibleTextService.fetchBibleData();
      }
      
      const settings = SettingsService.getSettings();
      const preferredAuthorId = settings?.selectedAuthorId;

      for (const book of bibleDataCache) {
        if (!book.chapters) continue;
        const defaultAudioUrl = AudioService.getBookAudioUrl(book.name);

        for (let chapterIndex = 0; chapterIndex < book.chapters.length; chapterIndex++) {
          const chapter = book.chapters[chapterIndex];
          for (let verseIndex = 0; verseIndex < chapter.length; verseIndex++) {
            const verse = chapter[verseIndex];
            if (verse.toLowerCase().includes(searchQuery)) {
              const verseNumber = verseIndex + 1;
              const { url: customAudio, authorId } = await AudioService.getCustomAudio(
                book.name, 
                chapterIndex + 1, 
                verseNumber,
                preferredAuthorId
              );
              
              let authorName;
              if (authorId) {
                const cachedAuthorMap = bookAuthorsCache.get(`${book.name}-${chapterIndex + 1}`);
                if (cachedAuthorMap && cachedAuthorMap.has(authorId)) {
                  authorName = cachedAuthorMap.get(authorId);
                } else {
                  const author = await AuthorService.getAuthor(authorId);
                  if (author) {
                    authorName = `${author.firstName} ${author.lastName}`;
                  }
                }
              }

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
