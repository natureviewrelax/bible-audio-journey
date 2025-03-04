
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { BookOpen, ListMusic, Sun } from "lucide-react";

interface ConfigPanelProps {
  showConfig: boolean;
  toggleConfig: () => void;
  darkTheme: boolean;
  toggleTheme: () => void;
  displayMode: "box" | "inline";
  setDisplayMode: (mode: "box" | "inline") => void;
  showAudio: boolean;
  setShowAudio: (show: boolean) => void;
}

export const ConfigPanel = ({
  showConfig,
  toggleConfig,
  darkTheme,
  toggleTheme,
  displayMode,
  setDisplayMode,
  showAudio,
  setShowAudio
}: ConfigPanelProps) => {
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
      </div>
    </div>
  );
};
