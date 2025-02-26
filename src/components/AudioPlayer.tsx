
import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import { BibleVerse } from "@/types/bible";
import { useEffect } from "react";

interface Props {
  verse: BibleVerse;
  onEnded: () => void;
}

export const VerseAudioPlayer = ({ verse, onEnded }: Props) => {
  // Priorize o áudio do upload (verse.audio) sobre o defaultAudioUrl
  const audioSource = verse.audio || verse.defaultAudioUrl || "";
  
  useEffect(() => {
    console.log("AudioPlayer - Current verse:", {
      book: verse.book,
      chapter: verse.chapter,
      verse: verse.verse,
      audio: verse.audio,
      defaultAudioUrl: verse.defaultAudioUrl,
      usingAudio: verse.audio ? "Upload" : "Default"
    });
    console.log("AudioPlayer - Using audio source:", audioSource);
  }, [verse, audioSource]);

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
        layout="horizontal"
        className={verse.audio ? "bg-primary/5" : ""}
      />
    </div>
  );
};
