
import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import { BibleVerse } from "@/types/bible";
import { useEffect, useState } from "react";
import { AudioService } from "@/services/AudioService";
import { SettingsService } from "@/services/SettingsService";

interface Props {
  verse: BibleVerse;
  onEnded: () => void;
  isVisible?: boolean;
}

export const VerseAudioPlayer = ({ verse, onEnded, isVisible = true }: Props) => {
  const [useDefaultAudio, setUseDefaultAudio] = useState<boolean>(true);
  const [audioSource, setAudioSource] = useState<string>("");
  
  useEffect(() => {
    const loadAudioSettings = async () => {
      try {
        console.log("Iniciando carregamento das configurações de áudio");
        const settings = await AudioService.getAudioSettings();
        setUseDefaultAudio(settings.useDefaultAudio);
        
        // Determine the audio source with priority:
        // 1. Custom uploaded audio for this verse
        // 2. Default audio source (if useDefaultAudio is true)
        let newAudioSource = "";
        
        if (verse.audio) {
          console.log("Usando áudio personalizado");
          newAudioSource = verse.audio;
        } else if (settings.useDefaultAudio && verse.defaultAudioUrl) {
          console.log("Usando áudio padrão");
          newAudioSource = verse.defaultAudioUrl;
        }
        
        if (!newAudioSource) {
          console.log("Nenhuma fonte de áudio disponível");
        } else {
          console.log("Fonte de áudio definida:", newAudioSource);
        }
        
        setAudioSource(newAudioSource);
      } catch (error) {
        console.error("Erro ao carregar configurações de áudio:", error);
        setAudioSource("");
      }
    };
    
    loadAudioSettings();
  }, [verse]);
  
  useEffect(() => {
    console.log("AudioPlayer - Current verse:", {
      book: verse.book,
      chapter: verse.chapter,
      verse: verse.verse,
      audio: verse.audio,
      defaultAudioUrl: verse.defaultAudioUrl,
      authorId: verse.authorId,
      authorName: verse.authorName,
      usingAudio: verse.audio ? "Upload" : (useDefaultAudio ? "Default" : "None")
    });
    console.log("AudioPlayer - Using audio source:", audioSource);
  }, [verse, audioSource, useDefaultAudio]);

  const handlePlay = () => {
    console.log("Audio started playing:", {
      source: audioSource,
      type: verse.audio ? "Upload" : "Default"
    });
  };

  const handleEnded = () => {
    console.log("Audio finished playing");
    onEnded();
  };

  const handleError = (e: any) => {
    console.error("Audio player error:", e);
    console.error("Failed audio source:", audioSource);
  };

  const handleLoadStart = () => {
    console.log("Audio loading started:", {
      source: audioSource,
      type: verse.audio ? "Upload" : "Default"
    });
  };

  if (!isVisible) {
    return null;
  }

  if (!audioSource) {
    return <div className="w-full text-sm text-muted-foreground">Áudio não disponível</div>;
  }

  return (
    <div className="w-full">
      <AudioPlayer
        src={audioSource}
        onPlay={handlePlay}
        onEnded={handleEnded}
        onError={handleError}
        onLoadStart={handleLoadStart}
        autoPlayAfterSrcChange={false}
        showJumpControls={false}
        layout="horizontal-reverse"
        className={verse.audio ? "bg-primary/5" : ""}
      />
    </div>
  );
};
