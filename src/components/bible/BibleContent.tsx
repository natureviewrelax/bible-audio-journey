
import { Loader2 } from "lucide-react";
import { BibleVerseContent } from "@/components/BibleVerseContent";
import { BibleVerse } from "@/types/bible";

interface BibleContentProps {
  loading: boolean;
  error: string | null;
  verses: BibleVerse[];
  currentVerseIndex: number;
  handleVerseEnd: () => void;
  handleRetry: () => void;
  handleAudioUploaded: (audioUrl: string, authorId?: string, authorName?: string) => void;
  showAdminSettings: boolean;
  displayMode: "box" | "inline";
  showAudio: boolean;
  currentBook: string;
  currentChapter: number;
}

export const BibleContent = ({
  loading,
  error,
  verses,
  currentVerseIndex,
  handleVerseEnd,
  handleRetry,
  handleAudioUploaded,
  showAdminSettings,
  displayMode,
  showAudio,
  currentBook,
  currentChapter
}: BibleContentProps) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3">Carregando versículos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-destructive mb-4">{error}</p>
        <button 
          onClick={handleRetry}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
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
  );
};
