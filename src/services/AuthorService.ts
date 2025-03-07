
import { supabase } from "@/integrations/supabase/client";
import { AudioAuthor } from "@/types/bible";

export class AuthorService {
  static async getAuthors(): Promise<AudioAuthor[]> {
    try {
      const { data, error } = await supabase
        .from('audio_authors')
        .select('*')
        .order('first_name', { ascending: true });

      if (error) {
        console.error("Error fetching authors:", error);
        return [];
      }

      // Map database fields to camelCase for frontend
      return data.map(author => ({
        id: author.id,
        firstName: author.first_name,
        lastName: author.last_name,
        ministryRole: author.ministry_role,
        biography: author.biography,
        email: author.email,
        phone: author.phone,
        website: author.website,
        facebook: author.facebook,
        youtube: author.youtube,
        instagram: author.instagram
      }));
    } catch (error) {
      console.error("Error in getAuthors:", error);
      return [];
    }
  }

  static async getAuthor(id: string): Promise<AudioAuthor | null> {
    try {
      const { data, error } = await supabase
        .from('audio_authors')
        .select('*')
        .eq('id', id)
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

  static async createAuthor(author: Omit<AudioAuthor, 'id'>): Promise<AudioAuthor | null> {
    try {
      const { data, error } = await supabase
        .from('audio_authors')
        .insert({
          first_name: author.firstName,
          last_name: author.lastName,
          ministry_role: author.ministryRole,
          biography: author.biography,
          email: author.email,
          phone: author.phone,
          website: author.website,
          facebook: author.facebook,
          youtube: author.youtube,
          instagram: author.instagram
        })
        .select()
        .single();

      if (error || !data) {
        console.error("Error creating author:", error);
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
      console.error("Error in createAuthor:", error);
      return null;
    }
  }

  static async updateAuthor(id: string, author: Partial<Omit<AudioAuthor, 'id'>>): Promise<boolean> {
    try {
      const updateData: any = {};
      
      if (author.firstName) updateData.first_name = author.firstName;
      if (author.lastName) updateData.last_name = author.lastName;
      if (author.ministryRole !== undefined) updateData.ministry_role = author.ministryRole;
      if (author.biography !== undefined) updateData.biography = author.biography;
      if (author.email !== undefined) updateData.email = author.email;
      if (author.phone !== undefined) updateData.phone = author.phone;
      if (author.website !== undefined) updateData.website = author.website;
      if (author.facebook !== undefined) updateData.facebook = author.facebook;
      if (author.youtube !== undefined) updateData.youtube = author.youtube;
      if (author.instagram !== undefined) updateData.instagram = author.instagram;

      const { error } = await supabase
        .from('audio_authors')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error("Error updating author:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in updateAuthor:", error);
      return false;
    }
  }

  static async deleteAuthor(id: string): Promise<boolean> {
    try {
      // First update any verse_audio records to remove this author reference
      await supabase
        .from('verse_audio')
        .update({ author_id: null })
        .eq('author_id', id);
      
      // Then delete the author
      const { error } = await supabase
        .from('audio_authors')
        .delete()
        .eq('id', id);

      if (error) {
        console.error("Error deleting author:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in deleteAuthor:", error);
      return false;
    }
  }
}
