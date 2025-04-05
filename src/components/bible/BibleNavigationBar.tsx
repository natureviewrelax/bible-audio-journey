
import { Navigation } from "@/components/Navigation";
import { ConfigPanel } from "@/components/ConfigPanel";
import { BibleBook } from "@/types/bible";

interface BibleNavigationBarProps {
  books: BibleBook[];
  currentBook: string;
  currentChapter: number;
  currentVerse: number;
  versesCount: number;
  onBookChange: (book: string) => void;
  onChapterChange: (chapter: number) => void;
  onVerseChange: (verse: number) => void;
  showConfig: boolean;
  toggleConfig: () => void;
  darkTheme: boolean;
  toggleTheme: () => void;
  displayMode: "box" | "inline";
  setDisplayMode: (mode: "box" | "inline") => void;
  showAudio: boolean;
  setShowAudio: (show: boolean) => void;
  selectedAuthorId?: string;
  setSelectedAuthorId: (authorId?: string) => void;
  toggleAdminSettings: () => void;
  showAdminSettings: boolean;
}

export const BibleNavigationBar = ({
  books,
  currentBook,
  currentChapter,
  currentVerse,
  versesCount,
  onBookChange,
  onChapterChange,
  onVerseChange,
  showConfig,
  toggleConfig,
  darkTheme,
  toggleTheme,
  displayMode,
  setDisplayMode,
  showAudio,
  setShowAudio,
  selectedAuthorId,
  setSelectedAuthorId,
  toggleAdminSettings,
  showAdminSettings
}: BibleNavigationBarProps) => {
  return (
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
        currentVerse={currentVerse}
        versesCount={versesCount}
        onBookChange={onBookChange}
        onChapterChange={onChapterChange}
        onVerseChange={onVerseChange}
        darkTheme={darkTheme}
        toggleTheme={toggleTheme}
        toggleConfig={toggleConfig}
        toggleAdminSettings={toggleAdminSettings}
        showAdminSettings={showAdminSettings}
      />
    </div>
  );
};
