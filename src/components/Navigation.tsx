
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BibleBook } from "@/types/bible";

interface Props {
  books: BibleBook[];
  currentBook: string;
  currentChapter: number;
  onBookChange: (book: string) => void;
  onChapterChange: (chapter: number) => void;
}

export const Navigation = ({
  books,
  currentBook,
  currentChapter,
  onBookChange,
  onChapterChange,
}: Props) => {
  const currentBookData = books.find((b) => b.name === currentBook);
  const chapters = currentBookData ? Array.from({ length: currentBookData.chapters }, (_, i) => i + 1) : [];

  return (
    <div className="flex items-center gap-4 p-4">
      <Select value={currentBook} onValueChange={onBookChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select book" />
        </SelectTrigger>
        <SelectContent>
          {books.map((book) => (
            <SelectItem key={book.name} value={book.name}>
              {book.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={currentChapter.toString()}
        onValueChange={(value) => onChapterChange(parseInt(value))}
      >
        <SelectTrigger className="w-[100px]">
          <SelectValue placeholder="Chapter" />
        </SelectTrigger>
        <SelectContent>
          {chapters.map((chapter) => (
            <SelectItem key={chapter} value={chapter.toString()}>
              {chapter}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onChapterChange(currentChapter - 1)}
          disabled={currentChapter <= 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onChapterChange(currentChapter + 1)}
          disabled={currentChapter >= (currentBookData?.chapters || 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
