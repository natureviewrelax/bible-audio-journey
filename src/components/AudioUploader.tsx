
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

    try {
      setIsUploading(true);

      // Criar uma URL para o arquivo de áudio
      const audioUrl = URL.createObjectURL(file);
      
      // Verificar se o áudio pode ser reproduzido
      const audio = new Audio();
      audio.src = audioUrl;
      
      await new Promise((resolve, reject) => {
        audio.oncanplaythrough = resolve;
        audio.onerror = reject;
        audio.load();
      });

      onAudioUploaded(audioUrl);
      
      toast({
        title: "Áudio adicionado",
        description: `Áudio adicionado para ${verse.book} ${verse.chapter}:${verse.verse}`,
      });
    } catch (error) {
      console.error("Erro no upload do áudio:", error);
      toast({
        title: "Erro no upload",
        description: "Ocorreu um erro ao fazer upload do arquivo. Verifique se o arquivo é um áudio válido.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
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
        onClick={() => document.getElementById(inputId)?.click()}
      >
        <Upload className="h-4 w-4 mr-2" />
        {isUploading ? "Enviando..." : "Adicionar Áudio"}
      </Button>
    </div>
  );
};
