
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, BookOpen, MoreHorizontal, Moon, Sun, Settings, LogIn, LogOut, UserPlus, User } from "lucide-react";
import { BibleBook } from "@/types/bible";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
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

  return (
    <div className="flex flex-col space-y-4 p-4 sticky top-0 bg-background z-50 shadow-sm border-b">
      <div className="flex justify-between items-center">
        <label htmlFor="verse" className="text-sm font-medium text-gray-700">
          Navegação
        </label>
        <div className="flex items-center gap-2">
          {user && (
            <div className="text-sm text-muted-foreground mr-2 hidden md:block">
              <span className="font-medium">{user.email}</span>
              {userRole && (
                <span className="ml-2 bg-primary/10 text-primary px-2 py-0.5 rounded text-xs">
                  {userRole}
                </span>
              )}
            </div>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="mr-2">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-2">
              <DropdownMenuItem onClick={toggleTheme} className="flex items-center cursor-pointer">
                {darkTheme ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
                <span>{darkTheme ? 'Tema Claro' : 'Tema Escuro'}</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={toggleConfig} className="flex items-center cursor-pointer">
                <Settings className="h-4 w-4 mr-2" />
                <span>Configurações</span>
              </DropdownMenuItem>
              
              {userRole === 'admin' && toggleAdminSettings && (
                <DropdownMenuItem onClick={toggleAdminSettings} className="flex items-center cursor-pointer">
                  <Settings className="h-4 w-4 mr-2" />
                  <span>{showAdminSettings ? 'Ocultar Configurações Admin' : 'Configurações Admin'}</span>
                </DropdownMenuItem>
              )}
              
              {!user ? (
                <> 
                 <DropdownMenuItem asChild>
                <Link to="/" className="flex items-center cursor-pointer">
                  <UserPlus className="h-4 w-4 mr-2" />
                  <span>Home</span>
                </Link>
              </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/login" className="flex items-center cursor-pointer">
                      <LogIn className="h-4 w-4 mr-2" />
                      <span>Entrar</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/signup" className="flex items-center cursor-pointer">
                      <UserPlus className="h-4 w-4 mr-2" />
                      <span>Cadastrar</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                  <Link to="/sobre" className="flex items-center cursor-pointer">
                    <UserPlus className="h-4 w-4 mr-2" />
                    <span>Sobre</span>
                  </Link>
                </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center cursor-pointer">
                      <User className="h-4 w-4 mr-2" />
                      <span>Perfil</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => signOut()} className="flex items-center cursor-pointer">
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          onClick={() => setIsModalOpen(true)}
          className="flex-1 justify-start"
        >
          <BookOpen className="h-4 w-4 mr-2" />
          {currentBook} {currentChapter}
        </Button>

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

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onChapterChange(currentChapter - 1)}
            disabled={currentChapter <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onChapterChange(currentChapter + 1)}
            disabled={currentChapter >= (currentBookData?.chapters || 1)}
          >
            <ChevronRight className="h-4 w-4" />
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
