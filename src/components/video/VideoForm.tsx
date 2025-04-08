
import React, { useState } from 'react';
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { VideoService } from "@/services/VideoService";
import { UserRole } from "@/components/AuthProvider";

type VideoFormData = {
  youtube_id: string;
  title: string;
  description: string;
};

interface VideoFormProps {
  onVideoAdded: (videos: any[]) => void;
  userRole: UserRole;
}

export const VideoForm: React.FC<VideoFormProps> = ({ onVideoAdded, userRole }) => {
  const [newVideo, setNewVideo] = useState<VideoFormData>({
    youtube_id: '',
    title: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleAddVideo(e: React.FormEvent) {
    e.preventDefault();
    
    if (!newVideo.youtube_id || !newVideo.title || !newVideo.description) {
      toast({
        variant: "destructive",
        title: "Informações incompletas",
        description: "Preencha todos os campos para adicionar um vídeo."
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (!userRole) {
        throw new Error("É necessário estar autenticado para realizar esta ação.");
      }

      const { data, error } = await VideoService.addVideo(newVideo, userRole);
      
      if (error) throw error;

      if (data) {
        onVideoAdded(data);
        
        setNewVideo({
          youtube_id: '',
          title: '',
          description: ''
        });
      }
      
      toast({
        title: "Vídeo adicionado",
        description: "O vídeo foi adicionado com sucesso."
      });
    } catch (error: any) {
      console.error('Error adding video:', error);
      toast({
        variant: "destructive",
        title: "Erro ao adicionar vídeo",
        description: error.message || "Não foi possível adicionar o vídeo."
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-md mb-8">
      <h2 className="text-xl font-bold mb-4">Adicionar Novo Vídeo</h2>
      <form onSubmit={handleAddVideo} className="space-y-4">
        <div>
          <label htmlFor="youtube_id" className="block text-sm font-medium mb-1">
            ID do YouTube
          </label>
          <Input 
            id="youtube_id"
            value={newVideo.youtube_id}
            onChange={(e) => setNewVideo({...newVideo, youtube_id: e.target.value})}
            placeholder="Ex: dQw4w9WgXcQ"
            className="w-full"
          />
        </div>
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            Título
          </label>
          <Input 
            id="title"
            value={newVideo.title}
            onChange={(e) => setNewVideo({...newVideo, title: e.target.value})}
            placeholder="Título do vídeo"
            className="w-full"
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">
            Descrição
          </label>
          <Textarea 
            id="description"
            value={newVideo.description}
            onChange={(e) => setNewVideo({...newVideo, description: e.target.value})}
            placeholder="Descrição do vídeo"
            className="w-full"
          />
        </div>
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="flex items-center"
        >
          {isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}
          Adicionar Vídeo
        </Button>
      </form>
    </div>
  );
};
