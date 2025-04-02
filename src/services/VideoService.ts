
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/components/AuthProvider";

export interface Video {
  id: string;
  youtube_id: string;
  title: string;
  description: string;
}

export class VideoService {
  /**
   * Fetch all videos - public access, no restrictions
   */
  static async fetchVideos(): Promise<{ data: Video[] | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('bible_videos')
        .select('id, youtube_id, title, description');
      
      if (error) {
        throw error;
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching videos:', error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Add a new video - restricted to admin and editor roles
   */
  static async addVideo(video: Omit<Video, 'id'>, userRole: UserRole): Promise<{ data: Video[] | null; error: Error | null }> {
    try {
      // Check if user has admin or editor role
      if (userRole !== 'admin' && userRole !== 'editor') {
        throw new Error("Você não tem permissão para adicionar vídeos.");
      }

      console.log("Tentando adicionar vídeo com userRole:", userRole);

      const { data, error } = await supabase
        .from('bible_videos')
        .insert([video])
        .select();
      
      if (error) {
        console.error("Erro Supabase ao adicionar vídeo:", error);
        throw error;
      }
      
      return { data: data as Video[], error: null };
    } catch (error) {
      console.error('Error adding video:', error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Update a video - restricted to admin and editor roles
   */
  static async updateVideo(video: Video, userRole: UserRole): Promise<{ data: Video | null; error: Error | null }> {
    try {
      // Check if user has admin or editor role
      if (userRole !== 'admin' && userRole !== 'editor') {
        throw new Error("Você não tem permissão para editar vídeos.");
      }
      
      console.log("Tentando atualizar vídeo com userRole:", userRole);
      
      const { data, error } = await supabase
        .from('bible_videos')
        .update({
          youtube_id: video.youtube_id,
          title: video.title,
          description: video.description
        })
        .eq('id', video.id)
        .select();
      
      if (error) {
        console.error("Erro Supabase ao atualizar vídeo:", error);
        throw error;
      }
      
      // If no rows were returned, the video might have been deleted
      if (!data || data.length === 0) {
        return { data: null, error: new Error("Vídeo não encontrado ou já foi excluído.") };
      }
      
      return { data: data[0] as Video, error: null };
    } catch (error) {
      console.error('Error updating video:', error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Delete a video - restricted to admin role only
   */
  static async deleteVideo(id: string, userRole: UserRole): Promise<{ success: boolean; error: Error | null }> {
    try {
      // Check if user has admin role
      if (userRole !== 'admin') {
        throw new Error("Apenas administradores podem excluir vídeos.");
      }
      
      console.log("Tentando excluir vídeo com userRole:", userRole);
      
      const { error } = await supabase
        .from('bible_videos')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error("Erro Supabase ao excluir vídeo:", error);
        throw error;
      }
      
      return { success: true, error: null };
    } catch (error) {
      console.error('Error deleting video:', error);
      return { success: false, error: error as Error };
    }
  }
}
