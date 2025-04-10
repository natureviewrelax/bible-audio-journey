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

const Index = () => {
  const [books, setBooks] = useState<BibleBook[]>([]);
  const [currentBook, setCurrentBook] = useState("Gênesis");
  const [currentChapter, setCurrentChapter] = useState(1);
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [showAdminSettings, setShowAdminSettings] = useState(false);
  const [displayMode, setDisplayMode] = useState<"box" | "inline">("inline");
  const [showAudio, setShowAudio] = useState<boolean>(true);
  const [showConfig, setShowConfig] = useState<boolean>(false);
  const [darkTheme, setDarkTheme] = useState<boolean>(false);
  const [selectedAuthorId, setSelectedAuthorId] = useState<string | undefined>(undefined);
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
      const booksData = await BibleService.getBooks();
      setBooks(booksData);
    };
    loadBooks();
  }, []);

  useEffect(() => {
    const loadChapter = async () => {
      const versesData = await BibleService.getChapter(currentBook, currentChapter);
      setVerses(versesData);
      setCurrentVerseIndex(0);
    };
    loadChapter();
  }, [currentBook, currentChapter]);

  useEffect(() => {
    if (darkTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkTheme]);

  const handleSearch = async (query: string) => {
    if (query.trim()) {
      const results = await BibleService.searchVerses(query);
      setVerses(results);
      setCurrentVerseIndex(0);
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
          </div>
        </div>
      </div>
    </div>
    
  );

};

export default Index;