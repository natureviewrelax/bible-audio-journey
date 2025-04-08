
import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import { AuthGuard } from "@/components/AuthGuard";
import { Loader2, Trash2, Plus, Edit, Save } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import { VideoService, Video } from "@/services/VideoService";

export default function VideosAdmin() {
  const { user, userRole } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [newVideo, setNewVideo] = useState<Omit<Video, 'id'>>({
    youtube_id: '',
    title: '',
    description: ''
  });

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
        setVideos([...data, ...videos]);
        
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

  async function handleUpdateVideo(e: React.FormEvent) {
    e.preventDefault();
    
    if (!editingVideo || !editingVideo.id || !editingVideo.youtube_id || !editingVideo.title || !editingVideo.description) {
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
      
      const { data, error } = await VideoService.updateVideo(editingVideo, userRole);
      
      if (error) throw error;
      
      if (data) {
        setVideos(videos.map(video => 
          video.id === editingVideo.id ? data : video
        ));
      }
      
      setEditingVideo(null);
      
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
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <p className="font-medium">
            Logado como: {user?.email} ({userRole})
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {userRole === 'admin' ? 
              'Você tem permissão para adicionar, editar e excluir vídeos.' : 
              'Você tem permissão para adicionar e editar vídeos, mas não pode excluí-los.'}
          </p>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2 text-lg">Carregando vídeos...</span>
          </div>
        ) : (
          <>
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
                                  onClick={() => setEditingVideo({...video})}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Editar Vídeo</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleUpdateVideo} className="space-y-4">
                                  <div>
                                    <label htmlFor="edit_youtube_id" className="block text-sm font-medium mb-1">
                                      ID do YouTube
                                    </label>
                                    <Input 
                                      id="edit_youtube_id"
                                      value={editingVideo?.youtube_id || ''}
                                      onChange={(e) => setEditingVideo(prev => prev ? {...prev, youtube_id: e.target.value} : null)}
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
                                      value={editingVideo?.title || ''}
                                      onChange={(e) => setEditingVideo(prev => prev ? {...prev, title: e.target.value} : null)}
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
                                      value={editingVideo?.description || ''}
                                      onChange={(e) => setEditingVideo(prev => prev ? {...prev, description: e.target.value} : null)}
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
                            </Dialog>

                            {userRole === 'admin' && (
                              <Button 
                                variant="destructive" 
                                size="icon" 
                                onClick={() => handleDeleteVideo(video.id)}
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
          </>
        )}
      </div>
    </AuthGuard>
  );
}
