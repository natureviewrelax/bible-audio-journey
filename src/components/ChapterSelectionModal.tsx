
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BibleBook } from "@/types/bible";
import { BIBLE_BOOKS } from "@/constants/bibleData";
import { BookSelection } from "./chapter-selection/BookSelection";
import { ChapterSelection } from "./chapter-selection/ChapterSelection";

interface ChapterSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBook: string;
  onSelectChapter: (book: string, chapter: number) => void;
}

export const ChapterSelectionModal = ({
  isOpen,
  onClose,
  currentBook,
  onSelectChapter,
}: ChapterSelectionModalProps) => {
  const [selectedBook, setSelectedBook] = useState<string>(currentBook);
  const [books, setBooks] = useState<BibleBook[]>(BIBLE_BOOKS);
  const [selectedStep, setSelectedStep] = useState<"books" | "chapters">("books");
  
  useEffect(() => {
    if (isOpen) {
      setSelectedBook(currentBook);
      setSelectedStep("books");
    }
  }, [isOpen, currentBook]);

  const handleBookSelect = (book: string) => {
    setSelectedBook(book);
    setSelectedStep("chapters");
  };

  const handleChapterSelect = (chapter: number) => {
    onSelectChapter(selectedBook, chapter);
    onClose();
  };

  const getChaptersForBook = (bookName: string) => {
    const book = books.find((b) => b.name === bookName);
    return book ? Array.from({ length: book.chapters }, (_, i) => i + 1) : [];
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {selectedStep === "books" ? "Selecione um Livro" : `Selecione um Capítulo de ${selectedBook}`}
          </DialogTitle>
        </DialogHeader>

        {selectedStep === "books" ? (
          <BookSelection 
            books={books} 
            selectedBook={selectedBook} 
            onBookSelect={handleBookSelect} 
          />
        ) : (
          <ChapterSelection 
            bookName={selectedBook}
            chapters={getChaptersForBook(selectedBook)}
            onChapterSelect={handleChapterSelect}
            onBackToBooks={() => setSelectedStep("books")}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
