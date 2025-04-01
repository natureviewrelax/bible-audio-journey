
import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import { AuthGuard } from "@/components/AuthGuard";
import { Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { VideoService, Video } from "@/services/VideoService";
import { VideoForm } from "@/components/video/VideoForm";
import { VideoList } from "@/components/video/VideoList";
import { UserRoleBanner } from "@/components/video/UserRoleBanner";

export default function VideosAdmin() {
  const { user, userRole } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchVideos();
  }, []);

  async function fetchVideos() {
    setIsLoading(true);
    try {
      const { data, error } = await VideoService.fetchVideos();
      
      if (error) throw error;
      
      setVideos(data || []);
    } catch (error) {
      console.error('Error fetching videos:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar vídeos",
        description: "Não foi possível carregar a lista de vídeos."
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleUpdateVideo(video: Video) {
    if (!video || !video.id || !video.youtube_id || !video.title || !video.description) {
      toast({
        variant: "destructive",
        title: "Informações incompletas",
        description: "Preencha todos os campos para atualizar o vídeo."
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (!userRole) {
        throw new Error("É necessário estar autenticado para realizar esta ação.");
      }
      
      const { data, error } = await VideoService.updateVideo(video, userRole);
      
      if (error) throw error;
      
      if (data) {
        setVideos(videos.map(v => 
          v.id === video.id ? data : v
        ));
      }
      
      toast({
        title: "Vídeo atualizado",
        description: "O vídeo foi atualizado com sucesso."
      });
    } catch (error: any) {
      console.error('Error updating video:', error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar vídeo",
        description: error.message || "Não foi possível atualizar o vídeo."
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteVideo(id: string) {
    if (!confirm("Tem certeza que deseja excluir este vídeo?")) {
      return;
    }

    try {
      if (!userRole) {
        throw new Error("É necessário estar autenticado para realizar esta ação.");
      }
      
      const { success, error } = await VideoService.deleteVideo(id, userRole);
      
      if (error) throw error;
      
      if (success) {
        setVideos(videos.filter(video => video.id !== id));
        
        toast({
          title: "Vídeo excluído",
          description: "O vídeo foi excluído com sucesso."
        });
      }
    } catch (error: any) {
      console.error('Error deleting video:', error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir vídeo",
        description: error.message || "Não foi possível excluir o vídeo."
      });
    }
  }

  function handleVideoAdded(newVideos: Video[]) {
    setVideos([...newVideos, ...videos]);
  }

  return (
    <AuthGuard allowedRoles={['admin', 'editor']}>
      <div className="container mx-auto p-4 bg-gray-50 min-h-screen">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <Link 
              to="/videos"
              className="inline-flex items-center justify-center px-6 py-3 text-lg font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors"
            >
              Ver página de vídeos
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-center text-gray-800">Administração de Vídeos</h1>
        </div>

        {/* Display user role information */}
        <UserRoleBanner user={user} userRole={userRole} />
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2 text-lg">Carregando vídeos...</span>
          </div>
        ) : (
          <>
            <VideoForm 
              onVideoAdded={handleVideoAdded} 
              userRole={userRole} 
            />
            
            <VideoList 
              videos={videos}
              userRole={userRole}
              onEdit={handleUpdateVideo}
              onDelete={handleDeleteVideo}
              isSubmitting={isSubmitting}
            />
          </>
        )}
      </div>
    </AuthGuard>
  );
}
