
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { User, RefreshCw } from "lucide-react";
import { SettingsService } from "@/services/SettingsService";
import { useState } from "react";

const Profile = () => {
  const { user, userRole, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [darkTheme, setDarkTheme] = useState(false);
  
  useEffect(() => {
    // Get the current theme setting
    const savedSettings = SettingsService.getSettings();
    if (savedSettings) {
      setDarkTheme(savedSettings.darkTheme);
    }
  }, []);
  
  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Desconectado",
      description: "Você desconectou com sucesso.",
    });
    navigate("/login");
  };

  const handleResetSettings = () => {
    SettingsService.clearSettings();
    toast({
      title: "Configurações redefinidas",
      description: "Todas as configurações do aplicativo foram redefinidas para os valores padrão.",
    });
    window.location.reload();
  };

  const toggleTheme = () => {
    // Just get the current theme for the profile page
    const savedSettings = SettingsService.getSettings();
    if (savedSettings) {
      setDarkTheme(savedSettings.darkTheme);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <TopBar darkTheme={darkTheme} toggleTheme={toggleTheme} toggleConfig={() => {}} />
        <div className="flex justify-center items-center h-64">
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <TopBar darkTheme={darkTheme} toggleTheme={toggleTheme} toggleConfig={() => {}} />
      
      <div className="container max-w-md mx-auto">
        <Card className="mt-8">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-primary/10 p-4 rounded-full">
                <User className="h-12 w-12 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">Perfil do Usuário</CardTitle>
            <CardDescription>Gerencie suas informações de conta</CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user?.email || ""} readOnly className="bg-muted" />
              </div>
              
              {userRole && (
                <div className="space-y-1">
                  <Label htmlFor="role">Função</Label>
                  <div className="bg-primary/10 text-primary font-medium px-4 py-2 rounded text-center">
                    {userRole}
                  </div>
                </div>
              )}
              
              <div className="space-y-1 pt-4">
                <Label>Configurações do Aplicativo</Label>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-1 flex items-center justify-center"
                  onClick={handleResetSettings}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Redefinir Configurações
                </Button>
                <p className="text-xs text-muted-foreground mt-1">
                  Isso redefinirá todas as configurações personalizadas do aplicativo.
                </p>
              </div>
            </div>
          </CardContent>
          
          <CardFooter>
            <Button onClick={handleSignOut} variant="destructive" className="w-full">
              Sair da Conta
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
