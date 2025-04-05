
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from '@supabase/supabase-js';

export type UserRole = 'admin' | 'editor' | 'viewer' | null;

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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
          // Buscar perfil do usuário para determinar o papel com base no username
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', session.user.id)
            .maybeSingle();
          
          if (error && error.code !== 'PGRST116') {
            console.error('Erro ao buscar perfil:', error);
          }
          
          // Determinar o papel com base no username ou no email do usuário
          determineUserRole(session.user.email, profileData?.username);
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
          // Buscar perfil do usuário para determinar o papel com base no username
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', session.user.id)
            .maybeSingle();
          
          if (error && error.code !== 'PGRST116') {
            console.error('Erro ao buscar perfil em onAuthStateChange:', error);
          }
          
          // Determinar o papel com base no username ou no email do usuário
          determineUserRole(session.user.email, profileData?.username);
        } else {
          setUserRole(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const determineUserRole = (email: string | undefined, username: string | undefined) => {
    // Verifica primeiro no username, depois no email
    if ((username && username.includes('admin')) || (email && email.includes('admin'))) {
      setUserRole('admin');
      console.log(`User role set to: admin for user: ${email}`);
    } else if ((username && username.includes('editor')) || (email && email.includes('editor'))) {
      setUserRole('editor');
      console.log(`User role set to: editor for user: ${email}`);
    } else {
      setUserRole('viewer');
      console.log(`User role set to: viewer for user: ${email}`);
    }
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
