
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { BookOpen, ListMusic, Sun, Save, User } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AuthorService } from "@/services/AuthorService";
import { AudioAuthor } from "@/types/bible";

interface ConfigPanelProps {
  showConfig: boolean;
  toggleConfig: () => void;
  darkTheme: boolean;
  toggleTheme: () => void;
  displayMode: "box" | "inline";
  setDisplayMode: (mode: "box" | "inline") => void;
  showAudio: boolean;
  setShowAudio: (show: boolean) => void;
  selectedAuthorId?: string;
  setSelectedAuthorId: (authorId: string) => void;
}

export const ConfigPanel = ({
  showConfig,
  toggleConfig,
  darkTheme,
  toggleTheme,
  displayMode,
  setDisplayMode,
  showAudio,
  setShowAudio,
  selectedAuthorId,
  setSelectedAuthorId
}: ConfigPanelProps) => {
  const { toast } = useToast();
  const [hasChanges, setHasChanges] = useState(false);
  const [authors, setAuthors] = useState<AudioAuthor[]>([]);

  useEffect(() => {
    // Load authors when component mounts
    const loadAuthors = async () => {
      const authorsList = await AuthorService.getAuthors();
      setAuthors(authorsList);
    };

    loadAuthors();
  }, []);

  // Reset hasChanges when settings panel is opened
  useEffect(() => {
    if (showConfig) {
      setHasChanges(false);
    }
  }, [showConfig]);

  // Track changes to settings
  useEffect(() => {
    if (showConfig) {
      setHasChanges(true);
    }
  }, [darkTheme, displayMode, showAudio, selectedAuthorId]);

  // Save settings confirmation
  const handleSaveSettings = () => {
    toast({
      title: "Configurações salvas",
      description: "Suas preferências foram salvas e serão aplicadas automaticamente no próximo acesso.",
    });
    setHasChanges(false);
  };

  if (!showConfig) return null;

  return (
    <div className="p-4 bg-card rounded-md mb-6 border border-border shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Configurações do Aplicativo</h2>
        <Button variant="ghost" size="sm" onClick={toggleConfig}>
          Fechar
        </Button>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sun className="h-4 w-4" />
            <span className="text-sm">Tema do Aplicativo:</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm">{darkTheme ? 'Escuro' : 'Claro'}</span>
            <Switch 
              checked={darkTheme} 
              onCheckedChange={toggleTheme} 
              aria-label="Alternar tema"
            />
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-4 w-4" />
            <span className="text-sm">Modo de Exibição:</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant={displayMode === "box" ? "default" : "outline"} 
              size="sm"
              onClick={() => setDisplayMode("box")}
            >
              Caixas
            </Button>
            <Button 
              variant={displayMode === "inline" ? "default" : "outline"} 
              size="sm"
              onClick={() => setDisplayMode("inline")}
            >
              Texto Contínuo
            </Button>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ListMusic className="h-4 w-4" />
            <span className="text-sm">Mostrar Áudio:</span>
          </div>
          <Switch 
            checked={showAudio} 
            onCheckedChange={setShowAudio} 
            aria-label="Mostrar player de áudio"
          />
        </div>

        {showAudio && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span className="text-sm">Autor Padrão para Áudio:</span>
            </div>
            <div className="w-full max-w-xs">
              <Select 
                value={selectedAuthorId} 
                onValueChange={setSelectedAuthorId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione um autor" />
                </SelectTrigger>
                <SelectContent>
                  {authors.length === 0 ? (
                    <div className="py-2 px-4 text-sm text-muted-foreground">Nenhum autor disponível</div>
                  ) : (
                    authors.map(author => (
                      <SelectItem key={author.id} value={author.id}>
                        {author.firstName} {author.lastName}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <div className="pt-2 border-t border-border">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full flex items-center justify-center"
            onClick={handleSaveSettings}
            disabled={!hasChanges}
          >
            <Save className="h-4 w-4 mr-2" />
            Salvar Configurações
          </Button>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Suas configurações são salvas automaticamente no navegador.
          </p>
        </div>
      </div>
    </div>
  );
};
