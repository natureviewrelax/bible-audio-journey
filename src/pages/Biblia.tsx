
import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { UserRoleInfo } from "@/components/UserRoleInfo";
import { useBible } from "@/hooks/use-bible";
import { useBibleSettings } from "@/hooks/use-bible-settings";
import { BibleNavigationBar } from "@/components/bible/BibleNavigationBar";
import { BibleContent } from "@/components/bible/BibleContent";
import { useToast } from "@/hooks/use-toast";

const Biblia = () => {
  const { toast } = useToast();
  const { 
    books, 
    currentBook, 
    setCurrentBook,
    currentChapter, 
    setCurrentChapter,
    currentVerseIndex,
    verses,
    setVerses,
    loading,
    error,
    handleVerseEnd,
    handleVerseChange,
    handleChapterSelection,
    handleRetry
  } = useBible();

  const {
    showAdminSettings,
    displayMode,
    showAudio,
    showConfig,
    darkTheme,
    selectedAuthorId,
    setSelectedAuthorId,
    toggleAdminSettings,
    toggleConfig,
    toggleTheme,
    setDisplayMode,
    setShowAudio
  } = useBibleSettings();

  const { userRole } = useAuth();

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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        {userRole && <UserRoleInfo userRole={userRole} />}
        
        <div className="max-w-4xl mx-auto">
          <BibleNavigationBar
            books={books}
            currentBook={currentBook}
            currentChapter={currentChapter}
            currentVerse={verses[currentVerseIndex]?.verse}
            versesCount={verses.length}
            onBookChange={setCurrentBook}
            onChapterChange={setCurrentChapter}
            onVerseChange={handleVerseChange}
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
            toggleAdminSettings={toggleAdminSettings}
            showAdminSettings={showAdminSettings}
          />
          
          <div className="mt-8">
            <BibleContent
              loading={loading}
              error={error}
              verses={verses}
              currentVerseIndex={currentVerseIndex}
              handleVerseEnd={handleVerseEnd}
              handleRetry={handleRetry}
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

export default Biblia;
