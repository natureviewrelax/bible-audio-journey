
import React, { useState } from 'react';
import { Loader2, Save } from "lucide-react";
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Video } from "@/services/VideoService";

interface VideoEditDialogProps {
  video: Video;
  onSave: (video: Video) => Promise<void>;
  isSubmitting: boolean;
}

export const VideoEditDialog: React.FC<VideoEditDialogProps> = ({ 
  video, 
  onSave, 
  isSubmitting 
}) => {
  const [editingVideo, setEditingVideo] = useState<Video>(video);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(editingVideo);
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Editar Vídeo</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="edit_youtube_id" className="block text-sm font-medium mb-1">
            ID do YouTube
          </label>
          <Input 
            id="edit_youtube_id"
            value={editingVideo.youtube_id}
            onChange={(e) => setEditingVideo({...editingVideo, youtube_id: e.target.value})}
            placeholder="Ex: dQw4w9WgXcQ"
            className="w-full"
          />
        </div>
        <div>
          <label htmlFor="edit_title" className="block text-sm font-medium mb-1">
            Título
          </label>
          <Input 
            id="edit_title"
            value={editingVideo.title}
            onChange={(e) => setEditingVideo({...editingVideo, title: e.target.value})}
            placeholder="Título do vídeo"
            className="w-full"
          />
        </div>
        <div>
          <label htmlFor="edit_description" className="block text-sm font-medium mb-1">
            Descrição
          </label>
          <Textarea 
            id="edit_description"
            value={editingVideo.description}
            onChange={(e) => setEditingVideo({...editingVideo, description: e.target.value})}
            placeholder="Descrição do vídeo"
            className="w-full"
          />
        </div>
        <DialogFooter>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="flex items-center"
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Salvar Alterações
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};
