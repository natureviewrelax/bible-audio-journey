
import { useEffect, useState } from "react";
import { BibleService } from "@/services/BibleService";
import { BibleBook, BibleVerse } from "@/types/bible";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { UserRoleInfo } from "@/components/UserRoleInfo";
import { ConfigPanel } from "@/components/ConfigPanel";
import { BibleVerseContent } from "@/components/BibleVerseContent";
import { SettingsService, AppSettings } from "@/services/SettingsService";
import { Loader2 } from "lucide-react";

const Biblia = () => {
  const [books, setBooks] = useState<BibleBook[]>([]);
  const [currentBook, setCurrentBook] = useState("Gênesis");
  const [currentChapter, setCurrentChapter] = useState(1);
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAdminSettings, setShowAdminSettings] = useState(false);
  const [displayMode, setDisplayMode] = useState<"box" | "inline">("inline");
  const [showAudio, setShowAudio] = useState<boolean>(true);
  const [showConfig, setShowConfig] = useState<boolean>(false);
  const [darkTheme, setDarkTheme] = useState<boolean>(false);
  const [selectedAuthorId, setSelectedAuthorId] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const { user, userRole } = useAuth();
  const { toast } = useToast();

  // Load settings from local storage on initial render
  useEffect(() => {
    const savedSettings = SettingsService.getSettings();
    if (savedSettings) {
      setDarkTheme(savedSettings.darkTheme);
      setDisplayMode(savedSettings.displayMode);
      setShowAudio(savedSettings.showAudio);
      setSelectedAuthorId(savedSettings.selectedAuthorId);
    }
  }, []);

  // Save settings to local storage whenever they change
  useEffect(() => {
    SettingsService.saveSettings({
      darkTheme,
      displayMode,
      showAudio,
      selectedAuthorId
    });
  }, [darkTheme, displayMode, showAudio, selectedAuthorId]);

  useEffect(() => {
    const loadBooks = async () => {
      try {
        console.log("Loading Bible books");
        const booksData = await BibleService.getBooks();
        console.log(`Loaded ${booksData.length} books`);
        setBooks(booksData);
      } catch (err) {
        console.error("Error loading books:", err);
        setError("Erro ao carregar livros da Bíblia.");
        toast({ 
          title: "Erro", 
          description: "Não foi possível carregar os livros da Bíblia.", 
          variant: "destructive" 
        });
      }
    };
    loadBooks();
  }, [toast]);

  useEffect(() => {
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
  }, [currentBook, currentChapter, toast]);

  useEffect(() => {
    if (darkTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkTheme]);

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

  const handleAudioUploaded = (audioUrl: string, authorId?: string, authorName?: string) => {
    toast({
      title: "Áudio adicionado com sucesso",
      description: "O áudio foi salvo e será reproduzido para este versículo.",
    });
    
    const updatedVerses = verses.map((verse, index) => {
      if (index === currentVerseIndex) {
        return { 
          ...verse, 
          audio: audioUrl,
          authorId: authorId || verse.authorId,
          authorName: authorName || verse.authorName
        };
      }
      return verse;
    });
    setVerses(updatedVerses);
  };

  const toggleAdminSettings = () => {
    setShowAdminSettings(!showAdminSettings);
  };

  const toggleConfig = () => {
    setShowConfig(!showConfig);
  };

  const toggleTheme = () => {
    setDarkTheme(!darkTheme);
  };

  const handleRetry = () => {
    // Force reload of Bible data
    BibleService.clearCache();
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">

        {userRole && <UserRoleInfo userRole={userRole} />}
        
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col space-y-4 p-4 sticky top-0 bg-background/95 backdrop-blur-sm z-50 shadow-lg border-b transition-all">
            <ConfigPanel 
              showConfig={showConfig}
              toggleConfig={toggleConfig}
              darkTheme={darkTheme}
              toggleTheme={toggleTheme}
              displayMode={displayMode}
              setDisplayMode={setDisplayMode}
              showAudio={showAudio}
              setShowAudio={setShowAudio}
              selectedAuthorId={selectedAuthorId}
              setSelectedAuthorId={setSelectedAuthorId}
            />

            <Navigation
              books={books}
              currentBook={currentBook}
              currentChapter={currentChapter}
              currentVerse={verses[currentVerseIndex]?.verse}
              versesCount={verses.length}
              onBookChange={setCurrentBook}
              onChapterChange={setCurrentChapter}
              onVerseChange={handleVerseChange}
              darkTheme={darkTheme}
              toggleTheme={toggleTheme}
              toggleConfig={toggleConfig}
              toggleAdminSettings={toggleAdminSettings}
              showAdminSettings={showAdminSettings}
            />
          </div>
          
          <div className="mt-8">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-3">Carregando versículos...</span>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <p className="text-destructive mb-4">{error}</p>
                <button 
                  onClick={handleRetry}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                  Tentar novamente
                </button>
              </div>
            ) : (
              <BibleVerseContent 
                verses={verses}
                currentVerseIndex={currentVerseIndex}
                handleVerseEnd={handleVerseEnd}
                handleAudioUploaded={handleAudioUploaded}
                showAdminSettings={showAdminSettings}
                displayMode={displayMode}
                showAudio={showAudio}
                currentBook={currentBook}
                currentChapter={currentChapter}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Biblia;
