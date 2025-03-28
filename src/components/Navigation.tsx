
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, BookOpen, MoreHorizontal, Moon, Sun, Settings, LogIn, LogOut, UserPlus, User, Menu, VideoIcon, AtSignIcon, HomeIcon } from "lucide-react";
import { BibleBook } from "@/types/bible";
import { useState, useEffect } from "react";
import { ChapterSelectionModal } from "@/components/ChapterSelectionModal";
import { Link } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Props {
  books: BibleBook[];
  currentBook: string;
  currentChapter: number;
  currentVerse?: number;
  onBookChange: (book: string) => void;
  onChapterChange: (chapter: number) => void;
  onVerseChange?: (verse: number) => void;
  versesCount?: number;
  darkTheme: boolean;
  toggleTheme: () => void;
  toggleConfig: () => void;
  toggleAdminSettings?: () => void;
  showAdminSettings?: boolean;
}

export const Navigation = ({
  books,
  currentBook,
  currentChapter,
  currentVerse = 1,
  onBookChange,
  onChapterChange,
  onVerseChange,
  versesCount = 1,
  darkTheme,
  toggleTheme,
  toggleConfig,
  toggleAdminSettings,
  showAdminSettings
}: Props) => {
  const currentBookData = books.find((b) => b.name === currentBook);
  const chapters = currentBookData ? Array.from({ length: currentBookData.chapters }, (_, i) => i + 1) : [];
  const verses = Array.from({ length: versesCount }, (_, i) => i + 1);
  
  const [verseInput, setVerseInput] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const { user, userRole, signOut } = useAuth();
  
  useEffect(() => {
    if (currentVerse) {
      setVerseInput(`${currentBook} ${currentChapter}:${currentVerse}`);
    }
  }, [currentBook, currentChapter, currentVerse]);

  const handleVerseInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVerseInput(e.target.value);
  };

  const handleVerseInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Regex para identificar padrões como "Gênesis 1:2"
    const regex = /^([\wÀ-ÿ\s]+)\s+(\d+):(\d+)$/;
    const match = verseInput.match(regex);
    
    if (match) {
      const [_, bookName, chapterNum, verseNum] = match;
      const trimmedBookName = bookName.trim();
      const bookExists = books.some(book => book.name === trimmedBookName);
      
      if (bookExists) {
        onBookChange(trimmedBookName);
        onChapterChange(parseInt(chapterNum));
        if (onVerseChange) {
          onVerseChange(parseInt(verseNum));
        }
      }
    }
  };

  const handleChapterSelection = (book: string, chapter: number) => {
    if (book !== currentBook) {
      onBookChange(book);
    }
    onChapterChange(chapter);
  };
  {onVerseChange && (
    <Select
      value={currentVerse.toString()}
      onValueChange={(value) => onVerseChange(parseInt(value))}
    >
      <SelectTrigger className="w-[100px]">
        <SelectValue placeholder="Versículo" />
      </SelectTrigger>
      <SelectContent>
        {verses.map((verse) => (
          <SelectItem key={verse} value={verse.toString()}>
            {verse}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )}


  return (
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          {user && (
            <div className="text-sm text-muted-foreground mr-2 hidden md:block hover:text-primary transition-colors">
              <span className="font-medium">{user.email}</span>
              {userRole && (
                <span className="ml-2 bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-semibold">
                  {userRole}
                </span>
              )}
            </div>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-accent hover:text-accent-foreground transition-colors rounded-full">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 p-3 shadow-lg rounded-lg border-border/50 bg-background/95 backdrop-blur-sm">
              <DropdownMenuItem onClick={toggleTheme} className="flex items-center cursor-pointer hover:bg-accent/50 rounded-lg transition-all duration-200 px-3 py-2 mb-1 group">
                {darkTheme ? <Sun className="h-4 w-4 mr-2 text-primary group-hover:scale-110 transition-transform" /> : <Moon className="h-4 w-4 mr-2 text-primary group-hover:scale-110 transition-transform" />}
                <span className="font-medium">{darkTheme ? 'Tema Claro' : 'Tema Escuro'}</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={toggleConfig} className="flex items-center cursor-pointer hover:bg-accent/50 rounded-lg transition-all duration-200 px-3 py-2 mb-1 group">
                <Settings className="h-4 w-4 mr-2 text-primary group-hover:scale-110 transition-transform" />
                <span className="font-medium">Configurações</span>
              </DropdownMenuItem>
              
              {userRole === 'admin' && toggleAdminSettings && (
                <DropdownMenuItem onClick={toggleAdminSettings} className="flex items-center cursor-pointer hover:bg-accent/50 rounded-lg transition-all duration-200 px-3 py-2 mb-1 group">
                  <Settings className="h-4 w-4 mr-2 text-primary group-hover:scale-110 transition-transform" />
                  <span className="font-medium">{showAdminSettings ? 'Ocultar Configurações Admin' : 'Configurações Admin'}</span>
                </DropdownMenuItem>
              )}
              
              {!user ? (
                <> 
               <DropdownMenuItem asChild>
                <Link to="/" className="flex items-center cursor-pointer hover:bg-accent/50 rounded-lg transition-all duration-200 px-3 py-2 mb-1 group">
                  <HomeIcon className="h-4 w-4 mr-2 text-primary group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Home</span>
                </Link>
              </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/login" className="flex items-center cursor-pointer hover:bg-accent/50 rounded-lg transition-all duration-200 px-3 py-2 mb-1 group">
                      <LogIn className="h-4 w-4 mr-2 text-primary group-hover:scale-110 transition-transform" />
                      <span className="font-medium">Entrar</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/signup" className="flex items-center cursor-pointer hover:bg-accent/50 rounded-lg transition-all duration-200 px-3 py-2 mb-1 group">
                      <UserPlus className="h-4 w-4 mr-2 text-primary group-hover:scale-110 transition-transform" />
                      <span className="font-medium">Cadastrar</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                   <Link to="/videos" className="flex items-center cursor-pointer hover:bg-accent/50 rounded-lg transition-all duration-200 px-3 py-2 mb-1 group">
                    <VideoIcon className="h-4 w-4 mr-2 text-primary group-hover:scale-110 transition-transform" />
                    <span className="font-medium">Vídeos</span>
                   </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                   <Link to="/sobre" className="flex items-center cursor-pointer hover:bg-accent/50 rounded-lg transition-all duration-200 px-3 py-2 mb-1 group">
                    <UserPlus className="h-4 w-4 mr-2 text-primary group-hover:scale-110 transition-transform" />
                    <span className="font-medium">Sobre</span>
                   </Link>
                  </DropdownMenuItem>
                </>
              ) : (user && (
                <>
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center cursor-pointer hover:bg-accent/50 rounded-lg transition-all duration-200 px-3 py-2 mb-1 group">
                      <User className="h-4 w-4 mr-2 text-primary group-hover:scale-110 transition-transform" />
                      <span className="font-medium">Perfil</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => signOut()} className="flex items-center cursor-pointer hover:bg-accent/50 rounded-lg transition-all duration-200 px-3 py-2 mb-1 group">
                    <LogOut className="h-4 w-4 mr-2 text-primary group-hover:scale-110 transition-transform" />
                    <span className="font-medium">Sair</span>
                  </DropdownMenuItem>
                </>
              ))}
              
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          onClick={() => setIsModalOpen(true)}
          className="flex-1 justify-start hover:bg-accent hover:text-accent-foreground transition-colors rounded-lg shadow-sm border-primary/20 font-medium"
        >
          <BookOpen className="h-4 w-4 mr-2 text-primary" />
          {currentBook} {currentChapter}
        </Button>

        <div className="flex items-center gap-2">
        {onVerseChange && (
          <Select
            value={currentVerse.toString()}
            onValueChange={(value) => onVerseChange(parseInt(value))}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Versículo" />
            </SelectTrigger>
            <SelectContent>
              {verses.map((verse) => (
                <SelectItem key={verse} value={verse.toString()}>
                  {verse}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

          <Button
            variant="outline"
            size="icon"
            onClick={() => onChapterChange(currentChapter - 1)}
            disabled={currentChapter <= 1}
            className="hover:bg-accent hover:text-accent-foreground transition-colors rounded-full shadow-sm border-primary/20"
          >
            <ChevronLeft className="h-5 w-5 text-primary" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onChapterChange(currentChapter + 1)}
            disabled={currentChapter >= (currentBookData?.chapters || 1)}
            className="hover:bg-accent hover:text-accent-foreground transition-colors rounded-full shadow-sm border-primary/20"
          >
            
            <ChevronRight className="h-5 w-5 text-primary" />
          </Button>
          
        </div>
      </div>

      <ChapterSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentBook={currentBook}
        onSelectChapter={handleChapterSelection}
      />
    </div>
  );
};
