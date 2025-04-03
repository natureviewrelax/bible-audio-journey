
import { supabase } from "@/integrations/supabase/client";
import { BaseAudioService } from "./BaseAudioService";

export class VerseAudioService {
  static async getChapterAudio(bookName: string, chapter: number, preferredAuthorId?: string): Promise<Map<number, {url: string, authorId: string | null}>> {
    const audioMap = new Map<number, {url: string, authorId: string | null}>();
    
    try {
      // Create a base query that we can reuse
      const baseQuery = {
        book: bookName,
        chapter: chapter
      };
      
      // If there's a preferred author, try to get their recordings first
      let records;
      if (preferredAuthorId) {
        const { data: preferredData, error: preferredError } = await supabase
          .from('verse_audio')
          .select('audio_path, author_id, verse')
          .match({...baseQuery, author_id: preferredAuthorId});
        
        if (!preferredError && preferredData && preferredData.length > 0) {
          records = preferredData;
        }
      }
      
      // If no preferred author records found, get all available recordings
      if (!records) {
        const { data: allData, error: allError } = await supabase
          .from('verse_audio')
          .select('audio_path, author_id, verse')
          .match(baseQuery);
        
        if (allError) {
          console.error("Error fetching chapter audio:", allError);
          return audioMap;
        }
        
        records = allData;
      }
      
      // Process the records to get public URLs
      if (records && records.length > 0) {
        for (const audioRecord of records) {
          const publicUrl = BaseAudioService.getPublicUrl(audioRecord.audio_path);

          audioMap.set(audioRecord.verse, {
            url: publicUrl,
            authorId: audioRecord.author_id
          });
        }
      }
      
      return audioMap;
    } catch (error) {
      console.error("Error in getChapterAudio:", error);
      return audioMap;
    }
  }

  static async getCustomAudio(bookName: string, chapter: number, verse: number, preferredAuthorId?: string): Promise<{ url: string | null; authorId: string | null }> {
    try {
      // Create base query parameters
      const baseQuery = {
        book: bookName,
        chapter: chapter,
        verse: verse
      };
      
      let audioRecord = null;
      
      // Try to get the preferred author's recording first if specified
      if (preferredAuthorId) {
        const { data: authorData, error: authorError } = await supabase
          .from('verse_audio')
          .select('audio_path, author_id')
          .match({...baseQuery, author_id: preferredAuthorId})
          .maybeSingle();
        
        if (!authorError && authorData) {
          audioRecord = authorData;
        }
      }
      
      // If no preferred author recording found, get any available recording
      if (!audioRecord) {
        const { data, error } = await supabase
          .from('verse_audio')
          .select('audio_path, author_id')
          .match(baseQuery)
          .maybeSingle();
        
        if (error || !data) {
          return { url: null, authorId: null };
        }
        
        audioRecord = data;
      }
      
      // Get the public URL for the audio file
      const publicUrl = BaseAudioService.getPublicUrl(audioRecord.audio_path);

      return { 
        url: publicUrl, 
        authorId: audioRecord.author_id 
      };
    } catch (error) {
      console.error("Error in getCustomAudio:", error);
      return { url: null, authorId: null };
    }
  }

  static async updateVerseAudioAuthor(bookName: string, chapter: number, verse: number, authorId: string | null): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('verse_audio')
        .update({ author_id: authorId })
        .match({
          book: bookName,
          chapter: chapter,
          verse: verse
        });

      if (error) {
        console.error("Error updating verse audio author:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in updateVerseAudioAuthor:", error);
      return false;
    }
  }
}
