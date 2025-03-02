
import { supabase } from "@/integrations/supabase/client";
import { AUDIO_FILE_MAPPING, BIBLE_AUDIO_BASE_URL } from "@/constants/bibleData";

export class AudioService {
  static getBookAudioUrl(bookName: string): string {
    const audioFileName = AUDIO_FILE_MAPPING[bookName];
    if (!audioFileName) {
      console.error(`Audio file mapping not found for book: ${bookName}`);
      return "";
    }
    return `${BIBLE_AUDIO_BASE_URL}/${audioFileName}.mp3`;
  }

  static async getCustomAudio(bookName: string, chapter: number, verse: number): Promise<string | null> {
    const { data, error } = await supabase
      .from('verse_audio')
      .select('audio_path')
      .eq('book', bookName)
      .eq('chapter', chapter)
      .eq('verse', verse)
      .single();

    if (error || !data) {
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('bible_audio')
      .getPublicUrl(data.audio_path);

    return publicUrl;
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
