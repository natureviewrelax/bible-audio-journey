
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BibleBook } from "@/types/bible";
import { BIBLE_BOOKS } from "@/constants/bibleData";
import { BookOpen } from "lucide-react";

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

  const bookGroups = [
    { title: "Pentateuco", books: books.slice(0, 5) },
    { title: "Históricos", books: books.slice(5, 17) },
    { title: "Poéticos", books: books.slice(17, 22) },
    { title: "Profetas Maiores", books: books.slice(22, 27) },
    { title: "Profetas Menores", books: books.slice(27, 39) },
    { title: "Evangelhos", books: books.slice(39, 43) },
    { title: "História", books: books.slice(43, 44) },
    { title: "Epístolas de Paulo", books: books.slice(44, 57) },
    { title: "Epístolas Gerais", books: books.slice(57, 65) },
    { title: "Apocalíptico", books: books.slice(65) },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {selectedStep === "books" ? "Selecione um Livro" : `Selecione um Capítulo de ${selectedBook}`}
          </DialogTitle>
        </DialogHeader>

        {selectedStep === "books" ? (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {bookGroups.map((group) => (
              <div key={group.title} className="space-y-2">
                <h3 className="font-medium text-sm text-muted-foreground">{group.title}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {group.books.map((book) => (
                    <Button
                      key={book.name}
                      variant="outline"
                      size="sm"
                      className={selectedBook === book.name ? "border-primary" : ""}
                      onClick={() => handleBookSelect(book.name)}
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      {book.name}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="my-4">
              <Button variant="outline" size="sm" onClick={() => setSelectedStep("books")}>
                Voltar para Livros
              </Button>
            </div>
            <div className="grid grid-cols-5 gap-2 max-h-[60vh] overflow-y-auto">
              {getChaptersForBook(selectedBook).map((chapter) => (
                <Button
                  key={chapter}
                  variant="outline"
                  size="sm"
                  onClick={() => handleChapterSelect(chapter)}
                >
                  {chapter}
                </Button>
              ))}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
