
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
}
