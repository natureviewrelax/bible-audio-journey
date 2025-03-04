
import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { BIBLE_BOOKS } from "@/constants/bibleData";
import { ChapterSelectionModal } from "@/components/ChapterSelectionModal";

interface SearchBarProps {
  onSearch: (query: string) => void;
  currentBook?: string;
  onSelectChapter?: (book: string, chapter: number) => void;
}

export const SearchBar = ({ onSearch, currentBook = "Gênesis", onSelectChapter }: SearchBarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<{name: string, chapters: number}[]>([]);
  const [selectedBook, setSelectedBook] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const query = searchQuery.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const matches = BIBLE_BOOKS.filter(book => 
        book.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(query)
      );
      setSuggestions(matches.slice(0, 5));
      setShowSuggestions(matches.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      onSearch(searchQuery);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (bookName: string) => {
    setSearchQuery(bookName);
    setSelectedBook(bookName);
    setShowSuggestions(false);
    
    if (onSelectChapter) {
      // Open the chapter selection modal instead of directly searching
      setIsModalOpen(true);
    } else {
      // Fallback to regular search if onSelectChapter is not provided
      onSearch(bookName);
    }
  };
  
  const handleChapterSelected = (book: string, chapter: number) => {
    if (onSelectChapter) {
      onSelectChapter(book, chapter);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="Pesquisar versículos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          {searchQuery && (
            <button 
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => setSearchQuery("")}
            >
              ×
            </button>
          )}
        </div>
        <Button onClick={handleSearch}>
          <Search className="h-4 w-4 mr-2" />
          Pesquisar
        </Button>
      </div>
      
      {showSuggestions && (
        <div className="absolute z-10 bg-background border border-border rounded-md shadow-lg w-full mt-1 max-h-60 overflow-y-auto">
          <ul className="py-1">
            {suggestions.map((book) => (
              <li 
                key={book.name}
                className="px-4 py-2 hover:bg-muted cursor-pointer"
                onClick={() => handleSuggestionClick(book.name)}
              >
                {book.name}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {onSelectChapter && (
        <ChapterSelectionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          currentBook={selectedBook || currentBook}
          onSelectChapter={handleChapterSelected}
        />
      )}
    </div>
  );
};
