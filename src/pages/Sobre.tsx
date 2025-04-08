import { Link } from "react-router-dom";
import { useEffect } from "react";
import { SettingsService } from "@/services/SettingsService";

const Sobre = () => {
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
        <h1 className="text-4xl font-bold mb-6 text-primary">Sobre a Bíblia em Áudio JFAC 1848</h1>
        
        <div className="text-xl text-muted-foreground space-y-6">
          <p>
            A Bíblia em Áudio JFAC 1848 é um projeto dedicado a tornar a Palavra de Deus mais acessível,
            combinando a histórica tradução João Ferreira de Almeida Corrigida de 1848 com narração em áudio
            de alta qualidade.
          </p>

          <p>
            Nossa missão é proporcionar uma experiência única de estudo bíblico, permitindo que você
            acompanhe a leitura do texto enquanto ouve a narração, tornando o estudo da Palavra mais
            envolvente e acessível.
          </p>

          <p>
            Este projeto é uma iniciativa em parceria com
            <a 
              href="http://www.feedz360.com.br" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline ml-2"
            >
              Feedz360
            </a>
          </p>
        </div>

        <Link 
          to="/"
          className="inline-flex items-center justify-center px-8 py-4 mt-8 text-lg font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors"
        >
          Voltar para Início
        </Link>
      </div>
    </div>
  );
};

export default Sobre;