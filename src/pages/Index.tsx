import { Link } from "react-router-dom";
import { useEffect } from "react";
import { SettingsService } from "@/services/SettingsService";

const Index = () => {
  // Load settings from local storage on initial render
  useEffect(() => {
    const savedSettings = SettingsService.getSettings();
    if (savedSettings) {
      if (savedSettings.darkTheme) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="max-w-3xl mx-auto p-8 text-center">
        <h1 className="text-4xl font-bold mb-6 text-primary">Bem-vindo à Bíblia em Áudio JFAC 1848</h1>
        
        <p className="text-xl text-muted-foreground mb-8">
          Explore a Palavra de Deus através da histórica tradução João Ferreira de Almeida Corrigida de 1848.
        </p>

        <Link 
          to="/biblia"
          className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors"
        >
          Começar a Leitura
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6 ml-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </Link>
      </div>
    </div>
  );
};

export default Index;