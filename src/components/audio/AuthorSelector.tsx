
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AudioAuthor } from "@/types/bible";

interface AuthorSelectorProps {
  authors: AudioAuthor[];
  selectedAuthorId?: string;
  onAuthorChange: (authorId: string) => void;
  disabled?: boolean;
  className?: string;
}

export const AuthorSelector = ({
  authors,
  selectedAuthorId,
  onAuthorChange,
  disabled = false,
  className = "w-full max-w-xs"
}: AuthorSelectorProps) => {
  return (
    <div className={className}>
      <Select 
        value={selectedAuthorId} 
        onValueChange={onAuthorChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecione um autor" />
        </SelectTrigger>
        <SelectContent>
          {authors.length === 0 ? (
            <div className="py-2 px-4 text-sm text-muted-foreground">Nenhum autor disponível</div>
          ) : (
            authors.map(author => (
              <SelectItem key={author.id} value={author.id}>
                {author.firstName} {author.lastName}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
};
