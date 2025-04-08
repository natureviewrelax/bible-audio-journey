
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BibleBook } from "@/types/bible";
import { BookOpen } from "lucide-react";

interface BookSelectionProps {
  books: BibleBook[];
  selectedBook: string;
  onBookSelect: (book: string) => void;
}

export const BookSelection = ({ books, selectedBook, onBookSelect }: BookSelectionProps) => {
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
                onClick={() => onBookSelect(book.name)}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                {book.name}
              </Button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
