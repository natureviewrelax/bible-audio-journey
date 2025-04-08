
import React from 'react';
import { Edit, Trash2 } from "lucide-react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Video } from "@/services/VideoService";
import { VideoEditDialog } from "./VideoEditDialog";
import { UserRole } from "@/components/AuthProvider";

interface VideoListProps {
  videos: Video[];
  userRole: UserRole;
  onEdit: (video: Video) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isSubmitting: boolean;
}

export const VideoList: React.FC<VideoListProps> = ({ 
  videos, 
  userRole, 
  onEdit, 
  onDelete, 
  isSubmitting 
}) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Miniatura</TableHead>
            <TableHead>Título</TableHead>
            <TableHead className="hidden md:table-cell">Descrição</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {videos.length > 0 ? (
            videos.map((video) => (
              <TableRow key={video.id}>
                <TableCell className="w-24">
                  <img 
                    src={`https://img.youtube.com/vi/${video.youtube_id}/default.jpg`} 
                    alt={video.title}
                    className="w-20 aspect-video object-cover rounded"
                  />
                </TableCell>
                <TableCell className="font-medium">{video.title}</TableCell>
                <TableCell className="hidden md:table-cell">
                  <p className="truncate max-w-xs">{video.description}</p>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="icon"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <VideoEditDialog 
                        video={video}
                        onSave={onEdit}
                        isSubmitting={isSubmitting}
                      />
                    </Dialog>

                    {userRole === 'admin' && (
                      <Button 
                        variant="destructive" 
                        size="icon" 
                        onClick={() => onDelete(video.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-6">
                Nenhum vídeo encontrado. Adicione seu primeiro vídeo.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
