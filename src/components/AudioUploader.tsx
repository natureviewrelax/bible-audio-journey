
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BibleVerse } from "@/types/bible";

interface Props {
  verse: BibleVerse;
  onAudioUploaded: (audioUrl: string) => void;
}

export const AudioUploader = ({ verse, onAudioUploaded }: Props) => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('audio/')) {
      toast({
        title: "Erro no upload",
        description: "Por favor, selecione um arquivo de áudio válido.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Here we'll add the actual upload logic later
      // For now, we'll just simulate an upload
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create an object URL for testing
      const audioUrl = URL.createObjectURL(file);
      onAudioUploaded(audioUrl);
      
      toast({
        title: "Áudio adicionado",
        description: `Áudio adicionado para ${verse.book} ${verse.chapter}:${verse.verse}`,
      });
    } catch (error) {
      toast({
        title: "Erro no upload",
        description: "Ocorreu um erro ao fazer upload do arquivo.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="file"
        accept="audio/*"
        className="hidden"
        id={`audio-upload-${verse.book}-${verse.chapter}-${verse.verse}`}
        onChange={handleFileSelect}
        disabled={isUploading}
      />
      <Button
        variant="outline"
        size="sm"
        disabled={isUploading}
        onClick={() => document.getElementById(`audio-upload-${verse.book}-${verse.chapter}-${verse.verse}`)?.click()}
      >
        <Upload className="h-4 w-4 mr-2" />
        {isUploading ? "Enviando..." : "Adicionar Áudio"}
      </Button>
    </div>
  );
};
