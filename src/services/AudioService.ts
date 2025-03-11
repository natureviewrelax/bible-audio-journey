
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

  static async getCustomAudio(bookName: string, chapter: number, verse: number, preferredAuthorId?: string): Promise<{ url: string | null; authorId: string | null }> {
    let query = supabase
      .from('verse_audio')
      .select('audio_path, author_id')
      .eq('book', bookName)
      .eq('chapter', chapter)
      .eq('verse', verse);
    
    // If a preferred author is specified, try to get that author's audio first
    if (preferredAuthorId) {
      const { data: authorData, error: authorError } = await query
        .eq('author_id', preferredAuthorId)
        .maybeSingle();
      
      if (authorData) {
        const { data: { publicUrl } } = supabase.storage
          .from('bible_audio')
          .getPublicUrl(authorData.audio_path);

        return { url: publicUrl, authorId: authorData.author_id };
      }
    }
    
    // If no preferred author or that author doesn't have audio for this verse,
    // fall back to any available audio
    const { data, error } = await query.maybeSingle();

    if (error || !data) {
      return { url: null, authorId: null };
    }

    const { data: { publicUrl } } = supabase.storage
      .from('bible_audio')
      .getPublicUrl(data.audio_path);

    return { url: publicUrl, authorId: data.author_id };
  }

  static async getAuthorForAudio(authorId: string): Promise<AudioAuthor | null> {
    if (!authorId) return null;
    
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
  }

  static async updateVerseAudioAuthor(bookName: string, chapter: number, verse: number, authorId: string | null): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('verse_audio')
        .update({ author_id: authorId })
        .eq('book', bookName)
        .eq('chapter', chapter)
        .eq('verse', verse);

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
      // Fetch audio settings from the database
      const { data, error } = await supabase
        .from('audio_settings')
        .select('*')
        .single();
      
      if (error) {
        console.error("Error fetching audio settings:", error);
        // Default settings if no settings found
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
      // Get the current user ID first
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;
      
      // Then update the settings with the userId
      const { error } = await supabase
        .from('audio_settings')
        .upsert({ 
          id: 1, // Single record for settings
          use_default_audio: settings.useDefaultAudio,
          default_audio_source: settings.defaultAudioSource,
          updated_at: new Date().toISOString(),
          updated_by: userId // Now it's a string (or null), not a Promise
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
