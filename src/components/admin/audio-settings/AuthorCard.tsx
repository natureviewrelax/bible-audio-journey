
import { AudioAuthor } from "@/types/bible";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from "@/components/ui/card";

interface AuthorCardProps {
  author: AudioAuthor;
  onEdit: (author: AudioAuthor) => void;
  onDelete: (authorId: string) => void;
  isLoading: boolean;
}

export const AuthorCard = ({ author, onEdit, onDelete, isLoading }: AuthorCardProps) => {
  return (
    <Card key={author.id} className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{author.firstName} {author.lastName}</CardTitle>
        {author.ministryRole && (
          <CardDescription>{author.ministryRole}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="pb-2 text-sm">
        {author.email && <p className="mb-1">Email: {author.email}</p>}
        {author.phone && <p className="mb-1">Telefone: {author.phone}</p>}
        {author.biography && (
          <p className="line-clamp-2 text-muted-foreground">
            {author.biography}
          </p>
        )}
      </CardContent>
      <CardFooter className="flex justify-end space-x-2 pt-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onEdit(author)}
        >
          <Pencil className="h-3.5 w-3.5 mr-1" />
          Editar
        </Button>
        <Button 
          variant="destructive" 
          size="sm"
          onClick={() => onDelete(author.id)}
          disabled={isLoading}
        >
          <Trash2 className="h-3.5 w-3.5 mr-1" />
          Excluir
        </Button>
      </CardFooter>
    </Card>
  );
};
