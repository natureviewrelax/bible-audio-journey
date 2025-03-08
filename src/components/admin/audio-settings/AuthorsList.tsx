
import { AudioAuthor } from "@/types/bible";
import { Button } from "@/components/ui/button";
import { RefreshCw, UserPlus, Users } from "lucide-react";
import { AuthorCard } from "./AuthorCard";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

interface AuthorsListProps {
  authors: AudioAuthor[];
  isLoading: boolean;
  onRefresh: () => void;
  onAddAuthor: () => void;
  onEditAuthor: (author: AudioAuthor) => void;
  onDeleteAuthor: (authorId: string) => void;
}

export const AuthorsList = ({
  authors,
  isLoading,
  onRefresh,
  onAddAuthor,
  onEditAuthor,
  onDeleteAuthor
}: AuthorsListProps) => {
  return (
    <Card className="m-6 mt-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Users className="h-5 w-5" />
              Gerenciamento de Autores
            </CardTitle>
            <CardDescription>
              Cadastre e gerencie autores que narram os áudios bíblicos
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            <Button onClick={onAddAuthor}>
              <UserPlus className="h-4 w-4 mr-1" />
              Novo Autor
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {authors.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {isLoading ? 'Carregando autores...' : 'Nenhum autor cadastrado'}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {authors.map((author) => (
              <AuthorCard 
                key={author.id} 
                author={author} 
                onEdit={onEditAuthor} 
                onDelete={onDeleteAuthor}
                isLoading={isLoading}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
