
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from '@supabase/supabase-js';

type UserRole = 'admin' | 'editor' | 'viewer' | null;

interface AuthContextType {
  session: Session | null;
  user: User | null;
  userRole: UserRole;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Como não temos uma tabela de papéis definida no tipo, vamos usar um papel padrão
          // Em um ambiente de produção real, você teria uma tabela apropriada
          determineUserRole(session.user.email);
        }
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          determineUserRole(session.user.email);
        } else {
          setUserRole(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Função simplificada para definir o papel do usuário com base no email
  // Esta é uma solução temporária até que você configure uma tabela de papéis adequada
  const determineUserRole = (email: string | undefined) => {
    if (!email) {
      setUserRole('viewer');
      return;
    }
    
    // Verificação básica - em um sistema real, isto viria do banco de dados
    if (email.includes('admin')) {
      setUserRole('admin');
    } else if (email.includes('editor')) {
      setUserRole('editor');
    } else {
      setUserRole('viewer');
    }
    
    // Usando const currentRole para acessar o valor atual ao invés do state que pode não estar atualizado
    const currentRole = email.includes('admin') ? 'admin' : 
                        email.includes('editor') ? 'editor' : 'viewer';
    
    console.log(`User role set to: ${currentRole} for email: ${email}`);
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    session,
    user,
    userRole,
    signIn,
    signUp,
    signOut,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
