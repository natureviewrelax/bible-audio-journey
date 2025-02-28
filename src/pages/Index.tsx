
import { useEffect, useState, useRef } from "react";
import { BibleService } from "@/services/BibleService";
import { BibleBook, BibleVerse } from "@/types/bible";
import { Navigation } from "@/components/Navigation";
import { VerseDisplay } from "@/components/VerseDisplay";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, LogIn, LogOut, UserPlus } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [books, setBooks] = useState<BibleBook[]>([]);
  const [currentBook, setCurrentBook] = useState("Gênesis");
  const [currentChapter, setCurrentChapter] = useState(1);
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const { user, userRole, signOut } = useAuth();
  const { toast } = useToast();
  
  // Referência para o versículo atual
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

  // Efeito para rolar para o versículo ativo quando ele mudar
  useEffect(() => {
    if (activeVerseRef.current) {
      // Rolagem suave para o elemento
      activeVerseRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [currentVerseIndex]);

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
    // Ajusta para índice baseado em zero (verseNumber começa em 1)
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-serif">Bíblia em Áudio</h1>
          <div className="flex items-center gap-2">
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
                  <span className="ml-2 text-green-600">
                    Você tem permissão para adicionar áudios.
                  </span>
                )}
              </p>
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

          <div className="mt-8 space-y-6">
            {verses.map((verse, index) => (
              <VerseDisplay
                key={`${verse.book}-${verse.chapter}-${verse.verse}`}
                ref={index === currentVerseIndex ? activeVerseRef : null}
                verse={verse}
                isPlaying={index === currentVerseIndex}
                onAudioUploaded={index === currentVerseIndex ? handleAudioUploaded : undefined}
                onEnded={handleVerseEnd}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
