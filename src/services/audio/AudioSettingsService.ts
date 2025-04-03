
import { supabase } from "@/integrations/supabase/client";
import { BIBLE_AUDIO_BASE_URL } from "@/constants/bibleData";

export class AudioSettingsService {
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
