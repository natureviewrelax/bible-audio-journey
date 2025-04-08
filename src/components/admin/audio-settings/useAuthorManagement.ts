
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { AudioAuthor } from "@/types/bible";
import { AuthorService } from "@/services/AuthorService";

export function useAuthorManagement(initialAuthors: AudioAuthor[] = []) {
  const [authors, setAuthors] = useState<AudioAuthor[]>(initialAuthors);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentAuthor, setCurrentAuthor] = useState<AudioAuthor | null>(null);
  const { toast } = useToast();

  const loadAuthors = async () => {
    setIsLoading(true);
    try {
      const authorsList = await AuthorService.getAuthors();
      setAuthors(authorsList);
    } catch (error) {
      console.error("Error loading authors:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de autores.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (author?: AudioAuthor) => {
    if (author) {
      // Edit mode
      setIsEditing(true);
      setCurrentAuthor(author);
    } else {
      // Create mode
      setIsEditing(false);
      setCurrentAuthor(null);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setCurrentAuthor(null);
  };

  const handleSaveAuthor = async (authorData: Omit<AudioAuthor, "id">) => {
    if (!authorData.firstName || !authorData.lastName) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor preencha o Nome e Sobrenome.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      if (isEditing && currentAuthor) {
        // Update existing author
        const success = await AuthorService.updateAuthor(currentAuthor.id, authorData);
        if (success) {
          toast({
            title: "Sucesso",
            description: "Autor atualizado com sucesso."
          });
          loadAuthors();
          handleCloseDialog();
        } else {
          toast({
            title: "Erro",
            description: "Não foi possível atualizar o autor.",
            variant: "destructive"
          });
        }
      } else {
        // Create new author
        const newAuthor = await AuthorService.createAuthor(authorData);
        if (newAuthor) {
          toast({
            title: "Sucesso",
            description: "Autor criado com sucesso."
          });
          loadAuthors();
          handleCloseDialog();
        } else {
          toast({
            title: "Erro",
            description: "Não foi possível criar o autor.",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error("Error saving author:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar o autor.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAuthor = async (authorId: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este autor?")) {
      return;
    }

    setIsLoading(true);
    try {
      const success = await AuthorService.deleteAuthor(authorId);
      if (success) {
        toast({
          title: "Sucesso",
          description: "Autor excluído com sucesso."
        });
        loadAuthors();
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível excluir o autor.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error deleting author:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao excluir o autor.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    authors,
    isLoading,
    isDialogOpen,
    isEditing,
    currentAuthor,
    loadAuthors,
    handleOpenDialog,
    handleCloseDialog,
    handleSaveAuthor,
    handleDeleteAuthor
  };
}
