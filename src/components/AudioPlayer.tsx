
import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import { BibleVerse } from "@/types/bible";

interface Props {
  verse: BibleVerse;
  onEnded: () => void;
}

export const VerseAudioPlayer = ({ verse, onEnded }: Props) => {
  const audioSource = verse.audio || verse.defaultAudioUrl || "";
  console.log("Audio source:", audioSource); // Para debug
  
  return (
    <div className="w-full">
      <AudioPlayer
        src={audioSource}
        onEnded={onEnded}
        autoPlayAfterSrcChange={false}
        showJumpControls={false}
        layout="horizontal"
      />
    </div>
  );
};
