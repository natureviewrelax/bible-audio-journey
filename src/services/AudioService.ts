
import { api } from "@/integrations/api/client";
import { AudioAuthor } from "@/types/bible";

export class AudioService {
  static async getCustomAudio(bookName: string, chapter: number, verse: number, preferredAuthorId?: string): Promise<{ url: string | null; authorId: string | null }> {
    let query = api
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
        const { data: { publicUrl } } = api.storage
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

    const { data: { publicUrl } } = api.storage
      .from('bible_audio')
      .getPublicUrl(data.audio_path);

    return { url: publicUrl, authorId: data.author_id };
  }

  static async getAuthorForAudio(authorId: string): Promise<AudioAuthor | null> {
    if (!authorId) return null;
    
    const { data, error } = await api
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
      const { error } = await api
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
}
