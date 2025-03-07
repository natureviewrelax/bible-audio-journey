
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BibleVerse, AudioAuthor } from "@/types/bible";
import { supabase } from "@/integrations/supabase/client";
import { AuthorService } from "@/services/AuthorService";
import { AudioService } from "@/services/AudioService";

interface Props {
  verse: BibleVerse;
  onAudioUploaded: (audioUrl: string, authorId?: string, authorName?: string) => void;
}

export const AudioUploader = ({ verse, onAudioUploaded }: Props) => {
  const [isUploading, setIsUploading] = useState(false);
  const [authors, setAuthors] = useState<AudioAuthor[]>([]);
  const [selectedAuthorId, setSelectedAuthorId] = useState<string | undefined>(verse.authorId);
  const { toast } = useToast();

  useEffect(() => {
    // Load authors when component mounts
    const loadAuthors = async () => {
      const authorsList = await AuthorService.getAuthors();
      setAuthors(authorsList);
    };

    loadAuthors();
  }, []);

  // Update selected author if verse author changes
  useEffect(() => {
    setSelectedAuthorId(verse.authorId);
  }, [verse.authorId]);

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
          audio_path: fileName,
          author_id: selectedAuthorId || null
        });

      if (dbError) {
        throw dbError;
      }

      console.log("Audio uploaded successfully:", publicUrl);
      
      let authorName;
      if (selectedAuthorId) {
        const author = authors.find(a => a.id === selectedAuthorId);
        if (author) {
          authorName = `${author.firstName} ${author.lastName}`;
        }
      }
      
      onAudioUploaded(publicUrl, selectedAuthorId, authorName);
      
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

  const handleAuthorChange = async (value: string) => {
    // Update the selected author
    setSelectedAuthorId(value);

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

  const inputId = `audio-upload-${verse.book}-${verse.chapter}-${verse.verse}`.replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-2">
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
      
      {(verse.audio || authors.length > 0) && (
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground">Autor:</label>
          <div className="w-full max-w-xs">
            <Select 
              value={selectedAuthorId} 
              onValueChange={handleAuthorChange}
              disabled={isUploading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione um autor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Sem autor</SelectItem>
                {authors.map(author => (
                  <SelectItem key={author.id} value={author.id}>
                    {author.firstName} {author.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
};
