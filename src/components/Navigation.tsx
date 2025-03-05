
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { BibleBook } from "@/types/bible";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { ChapterSelectionModal } from "@/components/ChapterSelectionModal";

interface Props {
  books: BibleBook[];
  currentBook: string;
  currentChapter: number;
  currentVerse?: number;
  onBookChange: (book: string) => void;
  onChapterChange: (chapter: number) => void;
  onVerseChange?: (verse: number) => void;
  versesCount?: number;
}

export const Navigation = ({
  books,
  currentBook,
  currentChapter,
  currentVerse = 1,
  onBookChange,
  onChapterChange,
  onVerseChange,
  versesCount = 1,
}: Props) => {
  const currentBookData = books.find((b) => b.name === currentBook);
  const chapters = currentBookData ? Array.from({ length: currentBookData.chapters }, (_, i) => i + 1) : [];
  const verses = Array.from({ length: versesCount }, (_, i) => i + 1);
  
  const [verseInput, setVerseInput] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  
  useEffect(() => {
    if (currentVerse) {
      setVerseInput(`${currentBook} ${currentChapter}:${currentVerse}`);
    }
  }, [currentBook, currentChapter, currentVerse]);

  const handleVerseInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVerseInput(e.target.value);
  };

  const handleVerseInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Regex para identificar padrões como "Gênesis 1:2"
    const regex = /^([\wÀ-ÿ\s]+)\s+(\d+):(\d+)$/;
    const match = verseInput.match(regex);
    
    if (match) {
      const [_, bookName, chapterNum, verseNum] = match;
      const trimmedBookName = bookName.trim();
      const bookExists = books.some(book => book.name === trimmedBookName);
      
      if (bookExists) {
        onBookChange(trimmedBookName);
        onChapterChange(parseInt(chapterNum));
        if (onVerseChange) {
          onVerseChange(parseInt(verseNum));
        }
      }
    }
  };

  const handleChapterSelection = (book: string, chapter: number) => {
    if (book !== currentBook) {
      onBookChange(book);
    }
    onChapterChange(chapter);
  };

  return (
    <div className="flex flex-col space-y-4 p-4">
      <label htmlFor="verse" className="text-sm font-medium text-gray-700">
        Navegação
      </label>
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          onClick={() => setIsModalOpen(true)}
          className="flex-1 justify-start"
        >
          <BookOpen className="h-4 w-4 mr-2" />
          {currentBook} {currentChapter}
        </Button>

        {onVerseChange && (
          <Select
            value={currentVerse.toString()}
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

      <ChapterSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentBook={currentBook}
        onSelectChapter={handleChapterSelection}
      />
    </div>
  );
};
