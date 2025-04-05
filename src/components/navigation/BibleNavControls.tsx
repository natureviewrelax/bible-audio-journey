
import { Button } from "@/components/ui/button";
import { BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BibleBook } from "@/types/bible";
import { useState } from "react";
import { ChapterSelectionModal } from "@/components/ChapterSelectionModal";

interface BibleNavControlsProps {
  currentBook: string;
  currentChapter: number;
  onChapterChange: (chapter: number) => void;
  currentVerse?: number;
  onVerseChange?: (verse: number) => void;
  versesCount?: number;
  books: BibleBook[];
}

export const BibleNavControls = ({
  currentBook,
  currentChapter,
  onChapterChange,
  currentVerse,
  onVerseChange,
  versesCount = 1,
  books
}: BibleNavControlsProps) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const currentBookData = books.find((b) => b.name === currentBook);
  const verses = Array.from({ length: versesCount }, (_, i) => i + 1);

  const handleChapterSelection = (book: string, chapter: number) => {
    onChapterChange(chapter);
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          onClick={() => setIsModalOpen(true)}
          className="flex-1 justify-start hover:bg-accent hover:text-accent-foreground transition-colors rounded-lg shadow-sm border-primary/20 font-medium"
        >
          <BookOpen className="h-4 w-4 mr-2 text-primary" />
          {currentBook} {currentChapter}
        </Button>

        <div className="flex items-center gap-2">
        {onVerseChange && (
          <Select
            value={currentVerse?.toString()}
            onValueChange={(value) => onVerseChange(parseInt(value))}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Versículo" />
            </SelectTrigger>
            <SelectContent>
              {verses.map((verse) => (
                <SelectItem key={verse} value={verse.toString()}>
                  {verse}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

          <Button
            variant="outline"
            size="icon"
            onClick={() => onChapterChange(currentChapter - 1)}
            disabled={currentChapter <= 1}
            className="hover:bg-accent hover:text-accent-foreground transition-colors rounded-full shadow-sm border-primary/20"
          >
            <ChevronLeft className="h-5 w-5 text-primary" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onChapterChange(currentChapter + 1)}
            disabled={currentChapter >= (currentBookData?.chapters || 1)}
            className="hover:bg-accent hover:text-accent-foreground transition-colors rounded-full shadow-sm border-primary/20"
          >
            <ChevronRight className="h-5 w-5 text-primary" />
          </Button>
        </div>
      </div>

      <ChapterSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentBook={currentBook}
        onSelectChapter={handleChapterSelection}
      />
    </>
  );
};
