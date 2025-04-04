
import { useRef, useEffect } from "react";
import { VerseDisplay } from "@/components/VerseDisplay";
import { BibleVerse } from "@/types/bible";

interface BibleVerseContentProps {
  verses: BibleVerse[];
  currentVerseIndex: number;
  handleVerseEnd: () => void;
  handleAudioUploaded: (audioUrl: string, authorId?: string, authorName?: string) => void;
  showAdminSettings: boolean;
  displayMode: "box" | "inline";
  showAudio: boolean;
  currentBook: string;
  currentChapter: number;
}

export const BibleVerseContent = ({
  verses,
  currentVerseIndex,
  handleVerseEnd,
  handleAudioUploaded,
  showAdminSettings,
  displayMode,
  showAudio,
  currentBook,
  currentChapter
}: BibleVerseContentProps) => {
  const activeVerseRef = useRef<HTMLDivElement>(null);

  // Ensure we always scroll to the active verse when it changes
  useEffect(() => {
    scrollToActiveVerse();
  }, [currentVerseIndex]);

  useEffect(() => {
    // Debug log to check what verses data is coming in
    console.log("BibleVerseContent - Received verses:", verses?.length || 0);
  }, [verses]);

  const scrollToActiveVerse = () => {
    if (activeVerseRef.current) {
      activeVerseRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }
  };

  if (!verses || verses.length === 0) {
    return <div className="p-4 text-center">Carregando versículos...</div>;
  }

  // Render verses in inline mode
  if (displayMode === "inline") {
    return (
      <div className="p-4 bg-card rounded-md shadow-sm">
        <div className="text-sm text-muted-foreground mb-2">
          {currentBook} {currentChapter}
        </div>
        <div className="space-y-1">
          {verses.map((verse, index) => (
            <VerseDisplay
              key={`${verse.book}-${verse.chapter}-${verse.verse}-${index}`}
              ref={index === currentVerseIndex ? activeVerseRef : null}
              verse={verse}
              isPlaying={index === currentVerseIndex}
              onAudioUploaded={handleAudioUploaded}
              onEnded={handleVerseEnd}
              displayMode="inline"
              showAudio={showAudio}
            />
          ))}
        </div>
      </div>
    );
  }

  // Render verses in box mode
  return (
    <div className="space-y-6">
      {verses.map((verse, index) => (
        <VerseDisplay
          key={`${verse.book}-${verse.chapter}-${verse.verse}-${index}`}
          ref={index === currentVerseIndex ? activeVerseRef : null}
          verse={verse}
          isPlaying={index === currentVerseIndex}
          onAudioUploaded={handleAudioUploaded}
          onEnded={handleVerseEnd}
          showAdminSettings={index === currentVerseIndex && showAdminSettings}
          displayMode="box"
          showAudio={showAudio}
        />
      ))}
    </div>
  );
}
