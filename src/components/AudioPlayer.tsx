
import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import { BibleVerse } from "@/types/bible";
import { useEffect } from "react";

interface Props {
  verse: BibleVerse;
  onEnded: () => void;
  isVisible?: boolean;
}

export const VerseAudioPlayer = ({ verse, onEnded, isVisible = true }: Props) => {
  const audioSource = verse.audio || "";

  useEffect(() => {
    console.log("AudioPlayer - Current verse:", {
      book: verse.book,
      chapter: verse.chapter,
      verse: verse.verse,
      audio: verse.audio,
      authorId: verse.authorId,
      authorName: verse.authorName
    });
  }, [verse]);

  const handlePlay = () => {
    console.log("Audio started playing:", {
      source: audioSource,
      type: "Upload"
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
      type: "Upload"
    });
  };

  if (!isVisible) {
    return null;
  }

  if (!audioSource) {
    return null;
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
