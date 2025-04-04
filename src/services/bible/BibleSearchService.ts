
import { BibleVerse } from "@/types/bible";
import { BibleCacheService } from "./BibleCacheService";
import { BibleTextService } from "../BibleTextService";
import { AudioService } from "../AudioService";
import { AuthorService } from "../AuthorService";
import { SettingsService } from "../SettingsService";

export class BibleSearchService {
  static async searchVerses(query: string): Promise<BibleVerse[]> {
    if (!query.trim()) {
      return [];
    }

    try {
      console.log(`Searching for: "${query}"`);
      const results: BibleVerse[] = [];
      const searchQuery = query.toLowerCase();
      
      let bibleDataCache = BibleCacheService.getBibleFullData();
      if (!bibleDataCache) {
        bibleDataCache = await BibleTextService.fetchBibleData();
        BibleCacheService.setBibleFullData(bibleDataCache);
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
