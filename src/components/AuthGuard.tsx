
import { ReactNode } from "react";
import { useAuth } from "./AuthProvider";
import { Navigate } from "react-router-dom";

interface AuthGuardProps {
  children: ReactNode;
  allowedRoles?: ('admin' | 'editor' | 'viewer')[];
}

export const AuthGuard = ({ children, allowedRoles = [] }: AuthGuardProps) => {
  const { user, userRole, loading } = useAuth();

  // Enquanto carrega, mostra um indicador de carregamento
  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Carregando...</div>;
  }

  // Se não estiver autenticado, redireciona para o login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Se precisar verificar papéis e o usuário não tiver um papel permitido
  if (allowedRoles.length > 0 && userRole && !allowedRoles.includes(userRole)) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">Acesso Negado</h1>
        <p className="text-center mb-4">
          Você não tem permissão para acessar esta página.
        </p>
        <Navigate to="/" replace />
      </div>
    );
  }

  // Se tudo estiver ok, renderiza o conteúdo protegido
  return <>{children}</>;
};
