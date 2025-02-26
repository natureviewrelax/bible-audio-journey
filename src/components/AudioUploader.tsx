
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
    console.log("File select event triggered");
    const file = event.target.files?.[0];
    
    if (!file) {
      console.log("No file selected");
      return;
    }

    console.log("File selected:", {
      name: file.name,
      type: file.type,
      size: file.size
    });

    // Validate file type
    if (!file.type.startsWith('audio/')) {
      console.log("Invalid file type:", file.type);
      toast({
        title: "Erro no upload",
        description: "Por favor, selecione um arquivo de áudio válido.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);
      console.log("Starting upload process");

      // Criar uma URL para o arquivo de áudio
      const audioUrl = URL.createObjectURL(file);
      console.log("Created audio URL:", audioUrl);
      
      // Verificar se o áudio pode ser reproduzido
      const audio = new Audio();
      
      const checkAudio = new Promise((resolve, reject) => {
        audio.oncanplaythrough = () => {
          console.log("Audio can play through");
          resolve(true);
        };
        audio.onerror = (e) => {
          console.error("Audio error:", e);
          reject(new Error("Erro ao carregar o áudio"));
        };
        audio.onloadstart = () => console.log("Audio started loading");
        audio.onloadedmetadata = () => console.log("Audio metadata loaded");
      });

      audio.src = audioUrl;
      console.log("Set audio source");
      
      await checkAudio;
      console.log("Audio validated successfully");

      // Atualizar o estado com a nova URL do áudio
      onAudioUploaded(audioUrl);
      console.log("Audio URL passed to parent component");
      
      toast({
        title: "Áudio adicionado",
        description: `Áudio adicionado para ${verse.book} ${verse.chapter}:${verse.verse}`,
      });
    } catch (error) {
      console.error("Erro detalhado no upload do áudio:", error);
      toast({
        title: "Erro no upload",
        description: "Ocorreu um erro ao fazer upload do arquivo. Verifique se o arquivo é um áudio válido.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      console.log("Upload process finished");
    }
  };

  const inputId = `audio-upload-${verse.book}-${verse.chapter}-${verse.verse}`.replace(/\s+/g, '-');

  return (
    <div className="flex items-center gap-2">
      <input
        type="file"
        accept="audio/*"
        className="hidden"
        id={inputId}
        onChange={handleFileSelect}
        disabled={isUploading}
      />
      <Button
        variant="outline"
        size="sm"
        disabled={isUploading}
        onClick={() => {
          console.log("Upload button clicked");
          document.getElementById(inputId)?.click();
        }}
      >
        <Upload className="h-4 w-4 mr-2" />
        {isUploading ? "Enviando..." : "Adicionar Áudio"}
      </Button>
    </div>
  );
};
