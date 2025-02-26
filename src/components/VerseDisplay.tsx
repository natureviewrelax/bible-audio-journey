
import { BibleVerse } from "@/types/bible";
import { AudioUploader } from "./AudioUploader";
import { VerseAudioPlayer } from "./AudioPlayer";

interface Props {
  verse: BibleVerse;
  isPlaying: boolean;
  onAudioUploaded?: (audioUrl: string) => void;
  onEnded?: () => void;
}

export const VerseDisplay = ({ verse, isPlaying, onAudioUploaded, onEnded }: Props) => {
  return (
    <div className={`p-6 rounded-lg bg-card shadow-sm transition-all duration-300 ${isPlaying ? 'ring-2 ring-primary' : ''}`}>
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <div className="text-sm text-muted-foreground mb-2">
              {verse.book} {verse.chapter}:{verse.verse}
              {verse.audio && <span className="ml-2 text-primary">(Áudio personalizado)</span>}
            </div>
            <p className="text-xl font-serif leading-relaxed">{verse.text}</p>
          </div>
          {onAudioUploaded && (
            <AudioUploader
              verse={verse}
              onAudioUploaded={onAudioUploaded}
            />
          )}
        </div>
        
        {isPlaying && (
          <VerseAudioPlayer
            verse={verse}
            onEnded={onEnded || (() => {})}
          />
        )}
      </div>
    </div>
  );
};
