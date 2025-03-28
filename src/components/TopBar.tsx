
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, X, Moon, Sun, Settings, BookOpen, Search, ListMusic, LogIn, LogOut, UserPlus, User } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TopBarProps {
  darkTheme: boolean;
  toggleTheme: () => void;
  toggleConfig: () => void;
  toggleAdminSettings?: () => void;
  showAdminSettings?: boolean;
}

export const TopBar = ({
  darkTheme,
  toggleTheme,
  toggleConfig,
  toggleAdminSettings,
  showAdminSettings
}: TopBarProps) => {
  const { user, userRole, signOut } = useAuth();
  const [menuExpanded, setMenuExpanded] = useState(false);

  return (
    <div className="flex justify-between items-center mb-8 text-left transition-all">
      <div className="flex items-center gap-3">
        {user && (
          <div className="text-sm text-muted-foreground mr-2 hidden md:block">
            <span className="font-medium">{user.email}</span>
            {userRole && (
              <span className="ml-2 bg-primary/10 text-primary px-2 py-0.5 rounded text-xs">
                {userRole}
              </span>
            )}
          </div>
        )}
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="mr-2 hover:bg-accent hover:text-accent-foreground transition-colors">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 p-3 shadow-lg rounded-lg border-border/50">
            <DropdownMenuItem onClick={toggleTheme} className="flex items-center cursor-pointer hover:bg-accent/50 rounded-md transition-colors px-2 py-1.5">
              {darkTheme ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
              <span>{darkTheme ? 'Tema Claro' : 'Tema Escuro'}</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={toggleConfig} className="flex items-center cursor-pointer hover:bg-accent/50 rounded-md transition-colors px-2 py-1.5">
              <Settings className="h-4 w-4 mr-2" />
              <span>Configurações</span>
            </DropdownMenuItem>
            
            {userRole === 'admin' && toggleAdminSettings && (
              <DropdownMenuItem onClick={toggleAdminSettings} className="flex items-center cursor-pointer hover:bg-accent/50 rounded-md transition-colors px-2 py-1.5">
                <Settings className="h-4 w-4 mr-2" />
                <span>{showAdminSettings ? 'Ocultar Configurações Admin' : 'Configurações Admin'}</span>
              </DropdownMenuItem>
            )}
            
            {!user ? (
              <>
                <DropdownMenuItem asChild>
                  <Link to="/login" className="flex items-center cursor-pointer hover:bg-accent/50 rounded-md transition-colors px-2 py-1.5">
                    <LogIn className="h-4 w-4 mr-2" />
                    <span>Entrar</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/signup" className="flex items-center cursor-pointer hover:bg-accent/50 rounded-md transition-colors px-2 py-1.5">
                    <UserPlus className="h-4 w-4 mr-2" />
                    <span>Cadastrar</span>
                  </Link>
                </DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex items-center cursor-pointer hover:bg-accent/50 rounded-md transition-colors px-2 py-1.5">
                    <User className="h-4 w-4 mr-2" />
                    <span>Perfil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => signOut()} className="flex items-center cursor-pointer hover:bg-accent/50 rounded-md transition-colors px-2 py-1.5">
                  <LogOut className="h-4 w-4 mr-2" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
