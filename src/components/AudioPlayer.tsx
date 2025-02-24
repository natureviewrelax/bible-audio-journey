
import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import { BibleVerse } from "@/types/bible";

interface Props {
  verse: BibleVerse;
  onEnded: () => void;
}

export const VerseAudioPlayer = ({ verse, onEnded }: Props) => {
  return (
    <div className="w-full max-w-3xl mx-auto mt-4">
      <AudioPlayer
        src={verse.audio || ""}
        onEnded={onEnded}
        autoPlayAfterSrcChange={false}
        showJumpControls={false}
        layout="horizontal"
      />
    </div>
  );
};
