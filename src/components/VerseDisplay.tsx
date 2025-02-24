
import { BibleVerse } from "@/types/bible";

interface Props {
  verse: BibleVerse;
  isPlaying: boolean;
}

export const VerseDisplay = ({ verse, isPlaying }: Props) => {
  return (
    <div className={`p-6 rounded-lg bg-card shadow-sm transition-all duration-300 ${isPlaying ? 'ring-2 ring-gold' : ''}`}>
      <div className="text-sm text-muted-foreground mb-2">
        {verse.book} {verse.chapter}:{verse.verse}
      </div>
      <p className="text-xl font-serif leading-relaxed">{verse.text}</p>
    </div>
  );
};
