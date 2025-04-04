
import { BibleBook } from "@/types/bible";
import { NavMenu } from "./navigation/NavMenu";
import { UserInfo } from "./navigation/UserInfo";
import { BibleNavControls } from "./navigation/BibleNavControls";

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
  const handleChapterSelection = (book: string, chapter: number) => {
    if (book !== currentBook) {
      onBookChange(book);
    }
    onChapterChange(chapter);
  };

  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-3">
        <UserInfo />
        <NavMenu 
          darkTheme={darkTheme}
          toggleTheme={toggleTheme}
          toggleConfig={toggleConfig}
          toggleAdminSettings={toggleAdminSettings}
          showAdminSettings={showAdminSettings}
        />
      </div>

      <BibleNavControls 
        currentBook={currentBook}
        currentChapter={currentChapter}
        onChapterChange={onChapterChange}
        currentVerse={currentVerse}
        onVerseChange={onVerseChange}
        versesCount={versesCount}
        books={books}
      />
    </div>
  );
};
