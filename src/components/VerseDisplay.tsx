
import { useState, useEffect } from "react";
import { AudioPlayer } from "./AudioPlayer";
import { BibleVerse } from "@/types/bible";
import { AudioUploader } from "./AudioUploader";
import { useAuth } from "./AuthProvider";

interface Props {
  verse: BibleVerse;
  isPlaying?: boolean;
  onEnded?: () => void;
  onAudioUploaded?: (audioUrl: string) => void;
}

export const VerseDisplay = ({ verse, isPlaying = false, onEnded, onAudioUploaded }: Props) => {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const { userRole } = useAuth();
  
  // Verificar se o usuário tem permissão para fazer upload (admin ou editor)
  const canUploadAudio = userRole === 'admin' || userRole === 'editor';

  useEffect(() => {
    // Use custom audio if available, otherwise fall back to default
    setAudioUrl(verse.audio || verse.defaultAudioUrl || null);
  }, [verse]);

  const handleAudioUploaded = (url: string) => {
    setAudioUrl(url);
    if (onAudioUploaded) {
      onAudioUploaded(url);
    }
  };

  return (
    <div className="p-4 bg-card rounded-md shadow-sm">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="text-sm text-muted-foreground mb-1">
            {verse.book} {verse.chapter}:{verse.verse}
          </div>
          <p className="text-lg">{verse.text}</p>
        </div>
        
        <div className="flex flex-col items-end space-y-2 ml-4">
          {audioUrl && (
            <AudioPlayer
              src={audioUrl}
              isPlaying={isPlaying}
              onEnded={onEnded}
            />
          )}
          
          {/* Mostrar o uploader apenas para admin ou editor */}
          {canUploadAudio && onAudioUploaded && (
            <AudioUploader
              verse={verse}
              onAudioUploaded={handleAudioUploaded}
            />
          )}
        </div>
      </div>
    </div>
  );
};
