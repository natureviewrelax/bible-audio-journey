
import { supabase } from "@/integrations/supabase/client";
import { AUDIO_FILE_MAPPING, BIBLE_AUDIO_BASE_URL } from "@/constants/bibleData";
import { AudioAuthor } from "@/types/bible";

export class AudioService {
  static getBookAudioUrl(bookName: string): string {
    const audioFileName = AUDIO_FILE_MAPPING[bookName];
    if (!audioFileName) {
      console.error(`Audio file mapping not found for book: ${bookName}`);
      return "";
    }
    return `${BIBLE_AUDIO_BASE_URL}/${audioFileName}.mp3`;
  }

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
          const { data: { publicUrl } } = supabase.storage
            .from('bible_audio')
            .getPublicUrl(audioRecord.audio_path);

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
      const { data: { publicUrl } } = supabase.storage
        .from('bible_audio')
        .getPublicUrl(audioRecord.audio_path);

      return { 
        url: publicUrl, 
        authorId: audioRecord.author_id 
      };
    } catch (error) {
      console.error("Error in getCustomAudio:", error);
      return { url: null, authorId: null };
    }
  }

  static async getAuthorForAudio(authorId: string): Promise<AudioAuthor | null> {
    if (!authorId) return null;
    
    try {
      const { data, error } = await supabase
        .from('audio_authors')
        .select('*')
        .eq('id', authorId)
        .single();

      if (error || !data) {
        console.error("Error fetching author:", error);
        return null;
      }

      return {
        id: data.id,
        firstName: data.first_name,
        lastName: data.last_name,
        ministryRole: data.ministry_role,
        biography: data.biography,
        email: data.email,
        phone: data.phone,
        website: data.website,
        facebook: data.facebook,
        youtube: data.youtube,
        instagram: data.instagram
      };
    } catch (error) {
      console.error("Error in getAuthor:", error);
      return null;
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

  static async getAudioSettings(): Promise<{useDefaultAudio: boolean, defaultAudioSource: string}> {
    try {
      const { data, error } = await supabase
        .from('audio_settings')
        .select('*')
        .single();
      
      if (error) {
        console.error("Error fetching audio settings:", error);
        return { 
          useDefaultAudio: true, 
          defaultAudioSource: BIBLE_AUDIO_BASE_URL 
        };
      }
      
      return {
        useDefaultAudio: data.use_default_audio,
        defaultAudioSource: data.default_audio_source
      };
    } catch (error) {
      console.error("Error in getAudioSettings:", error);
      return { 
        useDefaultAudio: true, 
        defaultAudioSource: BIBLE_AUDIO_BASE_URL 
      };
    }
  }

  static async updateAudioSettings(settings: {useDefaultAudio: boolean, defaultAudioSource: string}): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;
      
      const { error } = await supabase
        .from('audio_settings')
        .upsert({ 
          id: 1,
          use_default_audio: settings.useDefaultAudio,
          default_audio_source: settings.defaultAudioSource,
          updated_at: new Date().toISOString(),
          updated_by: userId
        });
      
      if (error) {
        console.error("Error updating audio settings:", error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error in updateAudioSettings:", error);
      return false;
    }
  }
}
