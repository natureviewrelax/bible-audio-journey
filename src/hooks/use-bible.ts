
import { useState, useEffect } from "react";
import { BibleService } from "@/services/BibleService";
import { BibleBook, BibleVerse } from "@/types/bible";
import { useToast } from "@/hooks/use-toast";

export function useBible() {
  const [books, setBooks] = useState<BibleBook[]>([]);
  const [currentBook, setCurrentBook] = useState("Gênesis");
  const [currentChapter, setCurrentChapter] = useState(1);
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Load books effect
  useEffect(() => {
    const loadBooks = async () => {
      try {
        console.log("Loading Bible books");
        setLoading(true);
        const booksData = await BibleService.getBooks();
        console.log(`Loaded ${booksData.length} books`);
        setBooks(booksData);
        setLoading(false);
      } catch (err) {
        console.error("Error loading books:", err);
        setError("Erro ao carregar livros da Bíblia.");
        setLoading(false);
        toast({ 
          title: "Erro", 
          description: "Não foi possível carregar os livros da Bíblia.", 
          variant: "destructive" 
        });
      }
    };
    loadBooks();
  }, [toast]);

  // Load chapter effect - only run when books are loaded
  useEffect(() => {
    if (books.length === 0) return; // Don't try to load chapter if books aren't loaded yet
    
    const loadChapter = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log(`Loading chapter ${currentChapter} from book ${currentBook}`);
        const versesData = await BibleService.getChapter(currentBook, currentChapter);
        console.log(`Loaded ${versesData.length} verses`);
        
        if (versesData.length === 0) {
          setError(`Não foi possível carregar os versículos de ${currentBook} ${currentChapter}.`);
          toast({ 
            title: "Capítulo não encontrado", 
            description: `Não foi possível carregar ${currentBook} ${currentChapter}.`, 
            variant: "destructive" 
          });
        } else {
          setVerses(versesData);
          setCurrentVerseIndex(0);
        }
      } catch (err) {
        console.error("Error loading chapter:", err);
        setError(`Erro ao carregar ${currentBook} ${currentChapter}.`);
        toast({ 
          title: "Erro", 
          description: `Não foi possível carregar ${currentBook} ${currentChapter}.`, 
          variant: "destructive" 
        });
      } finally {
        setLoading(false);
      }
    };
    loadChapter();
  }, [currentBook, currentChapter, books.length, toast]);

  const handleSearch = async (query: string) => {
    if (query.trim()) {
      setLoading(true);
      try {
        const results = await BibleService.searchVerses(query);
        setVerses(results);
        setCurrentVerseIndex(0);
      } catch (err) {
        console.error("Error searching verses:", err);
        toast({ 
          title: "Erro na busca", 
          description: "Não foi possível realizar a busca.", 
          variant: "destructive" 
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleChapterSelection = (book: string, chapter: number) => {
    setCurrentBook(book);
    setCurrentChapter(chapter);
  };

  const handleVerseEnd = () => {
    if (currentVerseIndex < verses.length - 1) {
      setCurrentVerseIndex(currentVerseIndex + 1);
    }
  };

  const handleVerseChange = (verseNumber: number) => {
    const index = verseNumber - 1;
    if (index >= 0 && index < verses.length) {
      setCurrentVerseIndex(index);
    }
  };

  const handleRetry = () => {
    // Since the clearCache method was removed, we don't call it anymore
    // Just force reload of current data directly
    setLoading(true);
    setError(null);
    
    // First reload books
    BibleService.getBooks().then(booksData => {
      setBooks(booksData);
      // Then reload current chapter
      return BibleService.getChapter(currentBook, currentChapter);
    }).then(versesData => {
      if (versesData.length > 0) {
        setVerses(versesData);
        setCurrentVerseIndex(0);
        toast({
          title: "Conteúdo recarregado",
          description: "Os versículos foram carregados com sucesso.",
        });
      } else {
        setError(`Não foi possível carregar os versículos de ${currentBook} ${currentChapter}.`);
      }
    }).catch(err => {
      console.error("Error reloading content:", err);
      setError("Erro ao recarregar o conteúdo.");
    }).finally(() => {
      setLoading(false);
    });
  };

  return {
    books,
    currentBook,
    setCurrentBook,
    currentChapter,
    setCurrentChapter,
    currentVerseIndex,
    setCurrentVerseIndex,
    verses,
    setVerses,
    loading,
    error,
    handleSearch,
    handleChapterSelection,
    handleVerseEnd,
    handleVerseChange,
    handleRetry
  };
}
