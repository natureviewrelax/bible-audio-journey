import { useEffect, useState, useRef } from "react";
import { BibleService } from "@/services/BibleService";
import { BibleBook, BibleVerse } from "@/types/bible";
import { Navigation } from "@/components/Navigation";
import { VerseDisplay } from "@/components/VerseDisplay";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, LogIn, LogOut, UserPlus, Settings, BookOpen, ListMusic, Sun, Moon } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";

const Index = () => {
  const [books, setBooks] = useState<BibleBook[]>([]);
  const [currentBook, setCurrentBook] = useState("Gênesis");
  const [currentChapter, setCurrentChapter] = useState(1);
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [showAdminSettings, setShowAdminSettings] = useState(false);
  const [displayMode, setDisplayMode] = useState<"box" | "inline">("inline");
  const [showAudio, setShowAudio] = useState<boolean>(true);
  const [showConfig, setShowConfig] = useState<boolean>(false);
  const [darkTheme, setDarkTheme] = useState<boolean>(false);
  const { user, userRole, signOut } = useAuth();
  const { toast } = useToast();
  
  const activeVerseRef = useRef<HTMLDivElement>(null);

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
    if (activeVerseRef.current) {
      activeVerseRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [currentVerseIndex]);

  useEffect(() => {
    if (darkTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkTheme]);

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      const results = await BibleService.searchVerses(searchQuery);
      setVerses(results);
      setCurrentVerseIndex(0);
    }
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

  const handleAudioUploaded = (audioUrl: string) => {
    toast({
      title: "Áudio adicionado com sucesso",
      description: "O áudio foi salvo e será reproduzido para este versículo.",
    });
    
    const updatedVerses = verses.map((verse, index) => {
      if (index === currentVerseIndex) {
        return { ...verse, audio: audioUrl };
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-serif">Bíblia em Áudio</h1>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={toggleTheme}
              className="mr-2"
              aria-label={darkTheme ? "Mudar para tema claro" : "Mudar para tema escuro"}
            >
              {darkTheme ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={toggleConfig}
              className="mr-2"
              aria-label="Configurações do aplicativo"
            >
              <Settings className="h-4 w-4" />
            </Button>
            {user ? (
              <>
                <div className="text-sm text-muted-foreground mr-2">
                  <span className="font-medium">{user.email}</span>
                  {userRole && (
                    <span className="ml-2 bg-primary/10 text-primary px-2 py-0.5 rounded text-xs">
                      {userRole}
                    </span>
                  )}
                </div>
                {userRole === 'admin' && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={toggleAdminSettings}
                    className="mr-2"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    {showAdminSettings ? 'Ocultar Configurações' : 'Configurações Admin'}
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => signOut()}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </Button>
              </>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to="/login">
                    <LogIn className="h-4 w-4 mr-2" />
                    Entrar
                  </Link>
                </Button>
                <Button variant="default" size="sm" asChild>
                  <Link to="/signup">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Cadastrar
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-4 mb-6">
            <Input
              type="text"
              placeholder="Pesquisar versículos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              Pesquisar
            </Button>
          </div>

          {userRole && (
            <div className="mb-4 p-4 bg-muted rounded-md">
              <p className="text-sm">
                <strong>Seu papel:</strong> {userRole}
                {(userRole === 'admin' || userRole === 'editor') && (
                  <span className="ml-2 text-green-600 dark:text-green-400">
                    Você tem permissão para adicionar áudios.
                  </span>
                )}
              </p>
            </div>
          )}

          {showConfig && (
            <div className="p-4 bg-card rounded-md mb-6 border border-border shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium">Configurações do Aplicativo</h2>
                <Button variant="ghost" size="sm" onClick={toggleConfig}>
                  Fechar
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sun className="h-4 w-4" />
                    <span className="text-sm">Tema do Aplicativo:</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">{darkTheme ? 'Escuro' : 'Claro'}</span>
                    <Switch 
                      checked={darkTheme} 
                      onCheckedChange={toggleTheme} 
                      aria-label="Alternar tema"
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-4 w-4" />
                    <span className="text-sm">Modo de Exibição:</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant={displayMode === "box" ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setDisplayMode("box")}
                    >
                      Caixas
                    </Button>
                    <Button 
                      variant={displayMode === "inline" ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setDisplayMode("inline")}
                    >
                      Texto Contínuo
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ListMusic className="h-4 w-4" />
                    <span className="text-sm">Mostrar Áudio:</span>
                  </div>
                  <Switch 
                    checked={showAudio} 
                    onCheckedChange={setShowAudio} 
                    aria-label="Mostrar player de áudio"
                  />
                </div>
              </div>
            </div>
          )}

          <Navigation
            books={books}
            currentBook={currentBook}
            currentChapter={currentChapter}
            currentVerse={verses[currentVerseIndex]?.verse}
            versesCount={verses.length}
            onBookChange={setCurrentBook}
            onChapterChange={setCurrentChapter}
            onVerseChange={handleVerseChange}
          />

          <div className="mt-8">
            {displayMode === "inline" ? (
              <div className="p-4 bg-card rounded-md shadow-sm">
                <div className="text-sm text-muted-foreground mb-2">
                  {currentBook} {currentChapter}
                </div>
                <div className="space-y-1">
                  {verses.map((verse, index) => (
                    <VerseDisplay
                      key={`${verse.book}-${verse.chapter}-${verse.verse}`}
                      ref={index === currentVerseIndex ? activeVerseRef : null}
                      verse={verse}
                      isPlaying={index === currentVerseIndex}
                      onAudioUploaded={index === currentVerseIndex ? handleAudioUploaded : undefined}
                      onEnded={handleVerseEnd}
                      displayMode="inline"
                      showAudio={showAudio}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {verses.map((verse, index) => (
                  <VerseDisplay
                    key={`${verse.book}-${verse.chapter}-${verse.verse}`}
                    ref={index === currentVerseIndex ? activeVerseRef : null}
                    verse={verse}
                    isPlaying={index === currentVerseIndex}
                    onAudioUploaded={index === currentVerseIndex ? handleAudioUploaded : undefined}
                    onEnded={handleVerseEnd}
                    showAdminSettings={index === currentVerseIndex && showAdminSettings}
                    displayMode="box"
                    showAudio={showAudio}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
