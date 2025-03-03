
import { useState, useEffect, forwardRef } from "react";
import { VerseAudioPlayer } from "./AudioPlayer"; 
import { BibleVerse } from "@/types/bible";
import { AudioUploader } from "./AudioUploader";
import { useAuth } from "./AuthProvider";
import { AdminAudioSettings } from "./AdminAudioSettings";

interface Props {
  verse: BibleVerse;
  isPlaying?: boolean;
  onEnded?: () => void;
  onAudioUploaded?: (audioUrl: string) => void;
  showAdminSettings?: boolean;
  displayMode?: "box" | "inline";
  showAudio?: boolean;
}

export const VerseDisplay = forwardRef<HTMLDivElement, Props>(
  ({ 
    verse, 
    isPlaying = false, 
    onEnded, 
    onAudioUploaded, 
    showAdminSettings = false,
    displayMode = "box",
    showAudio = true
  }, ref) => {
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const { userRole } = useAuth();
    
    // Verificar se o usuário tem permissão para fazer upload (admin ou editor)
    const canUploadAudio = userRole === 'admin' || userRole === 'editor';
    const isAdmin = userRole === 'admin';

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

    // For inline mode, we just show a verse number and text
    if (displayMode === "inline") {
      return (
        <div 
          ref={isPlaying ? ref : null} 
          className={`py-1 ${isPlaying ? 'bg-primary/5 rounded px-2' : ''}`}
        >
          <span className="text-sm text-muted-foreground mr-2">{verse.verse}</span>
          <span>{verse.text}</span>
          
          {/* Only show audio player when this verse is playing and audio should be visible */}
          {isPlaying && showAudio && (
            <div className="mt-2">
              <VerseAudioPlayer
                verse={verse}
                onEnded={onEnded || (() => {})}
                isVisible={showAudio}
              />
            </div>
          )}
        </div>
      );
    }

    // Regular box mode (original implementation)
    return (
      <div 
        ref={isPlaying ? ref : null} 
        className="p-4 bg-card rounded-md shadow-sm"
      >
        <div>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="text-sm text-muted-foreground mb-1">
                {verse.book} {verse.chapter}:{verse.verse}
              </div>
              <p className="text-lg">{verse.text}</p>
            </div>
          </div>

          <div className="flex flex-col items-end space-y-2 ml-4">
            <hr />
            {audioUrl && isPlaying && showAudio && (
              <VerseAudioPlayer
                verse={verse}
                onEnded={onEnded || (() => {})}
                isVisible={showAudio}
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
          
          {/* Mostrar configurações de áudio apenas para administradores e quando solicitado */}
          {isAdmin && showAdminSettings && (
            <div className="mt-6 border-t pt-4">
              <AdminAudioSettings />
            </div>
          )}
        </div>
      </div>
    );
  }
);

VerseDisplay.displayName = "VerseDisplay";
