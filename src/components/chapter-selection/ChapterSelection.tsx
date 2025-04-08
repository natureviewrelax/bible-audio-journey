
import { Button } from "@/components/ui/button";

interface ChapterSelectionProps {
  bookName: string;
  chapters: number[];
  onChapterSelect: (chapter: number) => void;
  onBackToBooks: () => void;
}

export const ChapterSelection = ({ 
  bookName, 
  chapters, 
  onChapterSelect, 
  onBackToBooks 
}: ChapterSelectionProps) => {
  return (
    <>
      <div className="my-4">
        <Button variant="outline" size="sm" onClick={onBackToBooks}>
          Voltar para Livros
        </Button>
      </div>
      <div className="grid grid-cols-5 gap-2 max-h-[60vh] overflow-y-auto">
        {chapters.map((chapter) => (
          <Button
            key={chapter}
            variant="outline"
            size="sm"
            onClick={() => onChapterSelect(chapter)}
          >
            {chapter}
          </Button>
        ))}
      </div>
    </>
  );
};
