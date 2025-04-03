
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import { Sun, Moon, Settings, LogIn, LogOut, UserPlus, User, VideoIcon, AtSignIcon, HomeIcon } from "lucide-react";

interface NavMenuProps {
  darkTheme: boolean;
  toggleTheme: () => void;
  toggleConfig: () => void;
  toggleAdminSettings?: () => void;
  showAdminSettings?: boolean;
}

export const NavMenu = ({
  darkTheme,
  toggleTheme,
  toggleConfig,
  toggleAdminSettings,
  showAdminSettings
}: NavMenuProps) => {
  const { user, userRole, signOut } = useAuth();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="hover:bg-accent hover:text-accent-foreground transition-colors rounded-full">
          <Menu className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 p-3 shadow-lg rounded-lg border-border/50 bg-background/95 backdrop-blur-sm">
        <DropdownMenuItem onClick={toggleTheme} className="flex items-center cursor-pointer hover:bg-accent/50 rounded-lg transition-all duration-200 px-3 py-2 mb-1 group">
          {darkTheme ? <Sun className="h-4 w-4 mr-2 text-primary group-hover:scale-110 transition-transform" /> : <Moon className="h-4 w-4 mr-2 text-primary group-hover:scale-110 transition-transform" />}
          <span className="font-medium">{darkTheme ? 'Tema Claro' : 'Tema Escuro'}</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={toggleConfig} className="flex items-center cursor-pointer hover:bg-accent/50 rounded-lg transition-all duration-200 px-3 py-2 mb-1 group">
          <Settings className="h-4 w-4 mr-2 text-primary group-hover:scale-110 transition-transform" />
          <span className="font-medium">Configurações</span>
        </DropdownMenuItem>
        
        {userRole === 'admin' && toggleAdminSettings && (
          <DropdownMenuItem onClick={toggleAdminSettings} className="flex items-center cursor-pointer hover:bg-accent/50 rounded-lg transition-all duration-200 px-3 py-2 mb-1 group">
            <Settings className="h-4 w-4 mr-2 text-primary group-hover:scale-110 transition-transform" />
            <span className="font-medium">{showAdminSettings ? 'Ocultar Configurações Admin' : 'Configurações Admin'}</span>
          </DropdownMenuItem>
        )}
        
        {!user ? (
          <> 
            <DropdownMenuItem asChild>
              <Link to="/" className="flex items-center cursor-pointer hover:bg-accent/50 rounded-lg transition-all duration-200 px-3 py-2 mb-1 group">
                <HomeIcon className="h-4 w-4 mr-2 text-primary group-hover:scale-110 transition-transform" />
                <span className="font-medium">Home</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/login" className="flex items-center cursor-pointer hover:bg-accent/50 rounded-lg transition-all duration-200 px-3 py-2 mb-1 group">
                <LogIn className="h-4 w-4 mr-2 text-primary group-hover:scale-110 transition-transform" />
                <span className="font-medium">Entrar</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/signup" className="flex items-center cursor-pointer hover:bg-accent/50 rounded-lg transition-all duration-200 px-3 py-2 mb-1 group">
                <UserPlus className="h-4 w-4 mr-2 text-primary group-hover:scale-110 transition-transform" />
                <span className="font-medium">Cadastrar</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/videos" className="flex items-center cursor-pointer hover:bg-accent/50 rounded-lg transition-all duration-200 px-3 py-2 mb-1 group">
                <VideoIcon className="h-4 w-4 mr-2 text-primary group-hover:scale-110 transition-transform" />
                <span className="font-medium">Vídeos</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/sobre" className="flex items-center cursor-pointer hover:bg-accent/50 rounded-lg transition-all duration-200 px-3 py-2 mb-1 group">
                <AtSignIcon className="h-4 w-4 mr-2 text-primary group-hover:scale-110 transition-transform" />
                <span className="font-medium">Sobre</span>
              </Link>
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem asChild>
              <Link to="/profile" className="flex items-center cursor-pointer hover:bg-accent/50 rounded-lg transition-all duration-200 px-3 py-2 mb-1 group">
                <User className="h-4 w-4 mr-2 text-primary group-hover:scale-110 transition-transform" />
                <span className="font-medium">Perfil</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => signOut()} className="flex items-center cursor-pointer hover:bg-accent/50 rounded-lg transition-all duration-200 px-3 py-2 mb-1 group">
              <LogOut className="h-4 w-4 mr-2 text-primary group-hover:scale-110 transition-transform" />
              <span className="font-medium">Sair</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
