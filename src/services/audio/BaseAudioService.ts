
import { AUDIO_FILE_MAPPING, BIBLE_AUDIO_BASE_URL } from "@/constants/bibleData";
import { supabase } from "@/integrations/supabase/client";

export class BaseAudioService {
  static getBookAudioUrl(bookName: string): string {
    try {
      const audioFileName = AUDIO_FILE_MAPPING[bookName];
      if (!audioFileName) {
        console.error(`Audio file mapping not found for book: ${bookName}`);
        return "";
      }
      return `${BIBLE_AUDIO_BASE_URL}/${audioFileName}.mp3`;
    } catch (error) {
      console.error("Error getting book audio URL:", error);
      return "";
    }
  }

  // Helper method to get public URL from storage path
  static getPublicUrl(storagePath: string): string {
    try {
      const { data: { publicUrl } } = supabase.storage
        .from('bible_audio')
        .getPublicUrl(storagePath);
      
      return publicUrl;
    } catch (error) {
      console.error("Error getting public URL:", error);
      return "";
    }
  }
}
