import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BibleVerse } from "@/types/bible";
import { supabase } from "@/integrations/supabase/client";

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

      // Criar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const sanitizedBook = verse.book.replace(/[^a-zA-Z0-9]/g, '_');
      const fileName = `${sanitizedBook}_${verse.chapter}_${verse.verse}_${Date.now()}.${fileExt}`;
      
      // Upload do arquivo para o Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('bible_audio')
        .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      // Obter URL pública do arquivo
      const { data: { publicUrl } } = supabase.storage
        .from('bible_audio')
        .getPublicUrl(fileName);

      // Salvar metadados no banco de dados
      const { error: dbError } = await supabase
        .from('verse_audio')
        .upsert({
          book: verse.book,
          chapter: verse.chapter,
          verse: verse.verse,
          audio_path: fileName
        });

      if (dbError) {
        throw dbError;
      }

      console.log("Audio uploaded successfully:", publicUrl);
      onAudioUploaded(publicUrl);
      
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
