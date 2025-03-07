
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { BibleVerse, AudioAuthor } from "@/types/bible";
import { AudioService } from "@/services/AudioService";
import { AuthorSelector } from "@/components/audio/AuthorSelector";
import { AudioFileUploader } from "@/components/audio/AudioFileUploader";
import { useAudioAuthor } from "@/hooks/use-audio-author";

interface Props {
  verse: BibleVerse;
  onAudioUploaded: (audioUrl: string, authorId?: string, authorName?: string) => void;
}

export const AudioUploader = ({ verse, onAudioUploaded }: Props) => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const { 
    authors, 
    selectedAuthorId, 
    handleAuthorChange 
  } = useAudioAuthor({ initialAuthorId: verse.authorId });

  const handleAuthorSelection = async (value: string) => {
    // Update the selected author
    handleAuthorChange(value);

    // If there's already an audio for this verse, update its author
    if (verse.audio) {
      try {
        const success = await AudioService.updateVerseAudioAuthor(
          verse.book, 
          verse.chapter, 
          verse.verse, 
          value || null
        );

        if (success) {
          // Find the author name
          let authorName;
          if (value) {
            const author = authors.find(a => a.id === value);
            if (author) {
              authorName = `${author.firstName} ${author.lastName}`;
            }
          }

          // Update in parent component
          onAudioUploaded(verse.audio, value, authorName);

          toast({
            title: "Autor atualizado",
            description: `Autor do áudio atualizado para ${verse.book} ${verse.chapter}:${verse.verse}`,
          });
        } else {
          toast({
            title: "Erro ao atualizar",
            description: "Não foi possível atualizar o autor do áudio.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error updating audio author:", error);
        toast({
          title: "Erro ao atualizar",
          description: "Ocorreu um erro ao atualizar o autor do áudio.",
          variant: "destructive",
        });
      }
    }
  };

  const handleFileUploaded = (audioUrl: string) => {
    let authorName;
    if (selectedAuthorId) {
      const author = authors.find(a => a.id === selectedAuthorId);
      if (author) {
        authorName = `${author.firstName} ${author.lastName}`;
      }
    }
    
    onAudioUploaded(audioUrl, selectedAuthorId, authorName);
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Author selection comes first */}
      <div className="flex items-center gap-2">
        <label className="text-sm text-muted-foreground">Autor:</label>
        <AuthorSelector
          authors={authors}
          selectedAuthorId={selectedAuthorId}
          onAuthorChange={handleAuthorSelection}
          disabled={isUploading}
        />
      </div>
      
      {/* Upload button comes after author selection */}
      <AudioFileUploader
        verse={verse}
        selectedAuthorId={selectedAuthorId}
        onAudioUploaded={handleFileUploaded}
        disabled={isUploading || authors.length === 0}
      />
    </div>
  );
};
