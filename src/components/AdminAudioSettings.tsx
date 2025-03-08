
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AudioService } from "@/services/AudioService";
import { BIBLE_AUDIO_BASE_URL } from "@/constants/bibleData";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuthorManagement } from "./admin/AuthorManagement";

export const AdminAudioSettings = () => {
  const [useDefaultAudio, setUseDefaultAudio] = useState(true);
  const [defaultAudioSource, setDefaultAudioSource] = useState(BIBLE_AUDIO_BASE_URL);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);
      try {
        const settings = await AudioService.getAudioSettings();
        setUseDefaultAudio(settings.useDefaultAudio);
        setDefaultAudioSource(settings.defaultAudioSource);
      } catch (error) {
        console.error("Failed to load audio settings:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as configurações de áudio.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSettings();
  }, [toast]);

  const handleSaveSettings = async () => {
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setDefaultAudioSource(BIBLE_AUDIO_BASE_URL);
    setUseDefaultAudio(true);
  };

  return (
    <div className="bg-card rounded-lg shadow-sm space-y-4">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="general">Configurações Gerais</TabsTrigger>
          <TabsTrigger value="authors">Gerenciar Autores</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="p-4">
          <h2 className="text-xl font-medium mb-4">Configurações de Áudio (Administrador)</h2>
          
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
        </TabsContent>
        
        <TabsContent value="authors" className="p-4">
          <AuthorManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};
