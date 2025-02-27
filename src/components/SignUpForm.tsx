
import { useState } from "react";
import { useAuth } from "./AuthProvider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { UserPlus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export const SignUpForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSigningUp, setIsSigningUp] = useState(false);
  const { signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Senhas não coincidem",
        description: "Por favor, verifique se as senhas foram digitadas corretamente.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSigningUp(true);

    try {
      const { error } = await signUp(email, password);
      
      if (error) {
        console.error("Erro no cadastro:", error);
        toast({
          title: "Erro no cadastro",
          description: error.message || "Não foi possível criar sua conta.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Cadastro realizado com sucesso",
          description: "Verifique seu email para confirmar sua conta.",
        });
        
        // Redireciona para a página de login após cadastro bem-sucedido
        navigate('/login');
      }
    } finally {
      setIsSigningUp(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-card rounded-lg shadow-md">
      <h2 className="text-2xl font-serif text-center mb-6">Criar Conta</h2>
      
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
            minLength={6}
          />
        </div>
        
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
            Confirmar Senha
          </label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            required
            minLength={6}
          />
        </div>
        
        <Button type="submit" className="w-full" disabled={isSigningUp}>
          <UserPlus className="h-4 w-4 mr-2" />
          {isSigningUp ? "Cadastrando..." : "Cadastrar"}
        </Button>
        
        <div className="text-center text-sm mt-4">
          Já tem uma conta?{" "}
          <Link to="/login" className="text-primary hover:underline">
            Entrar
          </Link>
        </div>
      </form>
    </div>
  );
};
