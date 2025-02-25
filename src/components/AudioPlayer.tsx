
import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import { BibleVerse } from "@/types/bible";

interface Props {
  verse: BibleVerse;
  onEnded: () => void;
}

export const VerseAudioPlayer = ({ verse, onEnded }: Props) => {
  const audioSource = verse.audio || verse.defaultAudioUrl || "";
  
  return (
    <div className="w-full max-w-3xl mx-auto mt-4">
      <AudioPlayer
        src={audioSource}
        onEnded={onEnded}
        autoPlayAfterSrcChange={false}
        showJumpControls={false}
        layout="horizontal"
        customControlsSection={[
          AudioPlayer.MAIN_CONTROLS,
          AudioPlayer.VOLUME_CONTROLS
        ]}
        customProgressBarSection={[
          AudioPlayer.PROGRESS_BAR,
          AudioPlayer.CURRENT_TIME,
          AudioPlayer.DURATION
        ]}
      />
    </div>
  );
};
