
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AudioService } from "@/services/AudioService";
import { BIBLE_AUDIO_BASE_URL } from "@/constants/bibleData";
import { useToast } from "@/hooks/use-toast";
import { ListMusic, Save } from "lucide-react";

interface AudioSettingsFormProps {
  isLoading: boolean;
  useDefaultAudio: boolean;
  setUseDefaultAudio: (value: boolean) => void;
  defaultAudioSource: string;
  setDefaultAudioSource: (value: string) => void;
}

export const AudioSettingsForm = ({
  isLoading,
  useDefaultAudio,
  setUseDefaultAudio,
  defaultAudioSource,
  setDefaultAudioSource,
}: AudioSettingsFormProps) => {
  const { toast } = useToast();

  const handleSaveSettings = async () => {
    try {
      const success = await AudioService.updateAudioSettings({
        useDefaultAudio,
        defaultAudioSource
      });
      
      if (success) {
        toast({
          title: "Sucesso",
          description: "Configurações de áudio atualizadas com sucesso.",
        });
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível salvar as configurações de áudio.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Failed to save audio settings:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar as configurações.",
        variant: "destructive"
      });
    }
  };

  const handleReset = () => {
    setDefaultAudioSource(BIBLE_AUDIO_BASE_URL);
    setUseDefaultAudio(true);
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-medium mb-4 flex items-center gap-2">
        <ListMusic className="h-5 w-5" />
        Configurações de Áudio
      </h2>
      
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch 
            id="default-audio-toggle" 
            checked={useDefaultAudio}
            onCheckedChange={setUseDefaultAudio}
            disabled={isLoading}
          />
          <Label htmlFor="default-audio-toggle">
            Exibir áudio padrão para usuários
          </Label>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="audio-source">URL Base do Áudio Padrão</Label>
          <Input 
            id="audio-source"
            value={defaultAudioSource}
            onChange={(e) => setDefaultAudioSource(e.target.value)}
            disabled={isLoading || !useDefaultAudio}
            placeholder="https://exemplo.com/audio/"
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            A URL base será usada para construir os links para os arquivos de áudio padrão.
          </p>
        </div>
        
        <div className="flex space-x-2 pt-2">
          <Button 
            onClick={handleSaveSettings}
            disabled={isLoading}
          >
            <Save className="h-4 w-4 mr-1" />
            Salvar Configurações
          </Button>
          <Button 
            variant="outline" 
            onClick={handleReset}
            disabled={isLoading}
          >
            Restaurar Padrão
          </Button>
        </div>
      </div>
      
      <div className="border-t pt-3 mt-4">
        <p className="text-sm text-muted-foreground">
          <strong>Nota:</strong> Apenas administradores podem alterar essas configurações.
          Elas afetam como o áudio é exibido para todos os usuários do sistema.
        </p>
      </div>
    </div>
  );
};
