
import { useState } from "react";
import { useAuth } from "./AuthProvider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { LogIn } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const { signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSigningIn(true);

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        console.error("Erro no login:", error);
        toast({
          title: "Erro no login",
          description: "Email ou senha inválidos.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Login realizado com sucesso",
          description: "Bem-vindo de volta!",
        });
        // Redireciona para a página inicial após login bem-sucedido
        navigate('/');
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-card rounded-lg shadow-md">
      <h2 className="text-2xl font-serif text-center mb-6">Entrar no Sistema</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            required
          />
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Senha
          </label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>
        
        <Button type="submit" className="w-full" disabled={isSigningIn}>
          <LogIn className="h-4 w-4 mr-2" />
          {isSigningIn ? "Entrando..." : "Entrar"}
        </Button>
        
        <div className="text-center text-sm mt-4">
          Ainda não tem uma conta?{" "}
          <Link to="/signup" className="text-primary hover:underline">
            Cadastre-se
          </Link>
        </div>
      </form>
    </div>
  );
}
