
import { useState, useEffect } from "react";
import { BibleService } from "@/services/BibleService";
import { BibleBook, BibleVerse } from "@/types/bible";
import { useToast } from "@/hooks/use-toast";
import { BibleChapterService } from "@/services/bible/BibleChapterService";
import { SettingsService } from "@/services/SettingsService";

export function useBible() {
  const [books, setBooks] = useState<BibleBook[]>([]);
  const [currentBook, setCurrentBook] = useState("Gênesis");
  const [currentChapter, setCurrentChapter] = useState(1);
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Carregar livros
  useEffect(() => {
    const loadBooks = async () => {
      try {
        console.log("Carregando livros da Bíblia");
        setLoading(true);
        const booksData = await BibleService.getBooks();
        console.log(`Carregados ${booksData.length} livros`);
        setBooks(booksData);
        setLoading(false);
      } catch (err) {
        console.error("Erro ao carregar livros:", err);
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

  // Carregar capítulo
  useEffect(() => {
    if (books.length === 0) return;
    
    const loadChapter = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log(`Carregando capítulo ${currentChapter} do livro ${currentBook}`);
        const versesData = await BibleService.getChapter(currentBook, currentChapter);
        console.log(`Carregados ${versesData.length} versículos`);
        
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
        console.error("Erro ao carregar capítulo:", err);
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

  // Carregar áudio do versículo atual quando mudar
  useEffect(() => {
    if (verses.length === 0 || currentVerseIndex < 0 || currentVerseIndex >= verses.length) {
      return;
    }

    const loadCurrentVerseAudio = async () => {
      // Obter configurações para preferência de autor
      const settings = SettingsService.getSettings();
      const preferredAuthorId = settings?.selectedAuthorId;
      
      try {
        const currentVerse = verses[currentVerseIndex];
        console.log(`Carregando áudio para versículo atual: ${currentVerse.book} ${currentVerse.chapter}:${currentVerse.verse}`);
        
        const updatedVerse = await BibleChapterService.loadVerseAudio(currentVerse, preferredAuthorId);
        
        // Atualizar apenas o versículo atual com seu áudio
        if (updatedVerse.audio || updatedVerse.authorId) {
          const updatedVerses = [...verses];
          updatedVerses[currentVerseIndex] = updatedVerse;
          setVerses(updatedVerses);
        }
      } catch (error) {
        console.error("Erro ao carregar áudio do versículo atual:", error);
      }
    };

    loadCurrentVerseAudio();
  }, [currentVerseIndex, verses]);

  const handleSearch = async (query: string) => {
    if (query.trim()) {
      setLoading(true);
      try {
        const results = await BibleService.searchVerses(query);
        setVerses(results);
        setCurrentVerseIndex(0);
      } catch (err) {
        console.error("Erro ao buscar versículos:", err);
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
    // Forçar recarga dos dados atuais
    setLoading(true);
    setError(null);
    
    // Primeiro recarregar livros
    BibleService.getBooks().then(booksData => {
      setBooks(booksData);
      // Em seguida, recarregar o capítulo atual
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
      console.error("Erro ao recarregar conteúdo:", err);
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
