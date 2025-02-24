
import { useEffect, useState } from "react";
import { BibleService } from "@/services/BibleService";
import { BibleBook, BibleVerse } from "@/types/bible";
import { Navigation } from "@/components/Navigation";
import { VerseDisplay } from "@/components/VerseDisplay";
import { VerseAudioPlayer } from "@/components/AudioPlayer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

const Index = () => {
  const [books, setBooks] = useState<BibleBook[]>([]);
  const [currentBook, setCurrentBook] = useState("Gênesis");
  const [currentChapter, setCurrentChapter] = useState(1);
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

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

  const handleAudioUploaded = (verseIndex: number, audioUrl: string) => {
    const updatedVerses = verses.map((verse, index) => {
      if (index === verseIndex) {
        return { ...verse, audio: audioUrl };
      }
      return verse;
    });
    setVerses(updatedVerses);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <h1 className="text-4xl font-serif text-center mb-8">Bíblia em Áudio</h1>
        
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

          <Navigation
            books={books}
            currentBook={currentBook}
            currentChapter={currentChapter}
            onBookChange={setCurrentBook}
            onChapterChange={setCurrentChapter}
          />

          <div className="mt-8 space-y-6">
            {verses.map((verse, index) => (
              <VerseDisplay
                key={`${verse.book}-${verse.chapter}-${verse.verse}`}
                verse={verse}
                isPlaying={index === currentVerseIndex}
                onAudioUploaded={(audioUrl) => handleAudioUploaded(index, audioUrl)}
              />
            ))}
          </div>

          {verses.length > 0 && (
            <VerseAudioPlayer
              verse={verses[currentVerseIndex]}
              onEnded={handleVerseEnd}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
