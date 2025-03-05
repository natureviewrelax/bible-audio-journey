
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, Moon, Settings, Sun, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";

interface AppHeaderProps {
  darkTheme: boolean;
  toggleTheme: () => void;
  toggleConfig: () => void;
  toggleAdminSettings?: () => void;
  showAdminSettings?: boolean;
}

export const AppHeader = ({ 
  darkTheme, 
  toggleTheme, 
  toggleConfig,
  toggleAdminSettings,
  showAdminSettings
}: AppHeaderProps) => {
  const { user, userRole, signOut } = useAuth();

  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-4xl font-serif">Bíblia em Áudio</h1>
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={toggleTheme}
          className="mr-2"
          aria-label={darkTheme ? "Mudar para tema claro" : "Mudar para tema escuro"}
        >
          {darkTheme ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={toggleConfig}
          className="mr-2"
          aria-label="Configurações do aplicativo"
        >
          <Settings className="h-4 w-4" />
        </Button>
        {user ? (
          <>
            <div className="text-sm text-muted-foreground mr-2">
              <span className="font-medium">{user.email}</span>
              {userRole && (
                <span className="ml-2 bg-primary/10 text-primary px-2 py-0.5 rounded text-xs">
                  {userRole}
                </span>
              )}
            </div>
            {userRole === 'admin' && toggleAdminSettings && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={toggleAdminSettings}
                className="mr-2"
              >
                <Settings className="h-4 w-4 mr-2" />
                {showAdminSettings ? 'Ocultar Configurações' : 'Configurações Admin'}
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => signOut()}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/login">
                <LogIn className="h-4 w-4 mr-2" />
                Entrar
              </Link>
            </Button>
            <Button variant="default" size="sm" asChild>
              <Link to="/signup">
                <UserPlus className="h-4 w-4 mr-2" />
                Cadastrar
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
