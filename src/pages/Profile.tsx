
import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import { AuthGuard } from '@/components/AuthGuard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Loader2, User, Globe, Image } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];

export default function Profile() {
  const { user, userRole } = useAuth();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [website, setWebsite] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    async function getProfile() {
      if (!user) return; // Não tenta carregar o perfil se não houver usuário

      try {
        setLoading(true);

        const { data, error } = await supabase
          .from('profiles')
          .select('username, website, avatar_url')
          .eq('id', user.id)
          .maybeSingle(); // Usar maybeSingle em vez de single para evitar erro se não encontrar

        if (error && error.code !== 'PGRST116') { // Ignorar erro de "não encontrou resultado"
          throw error;
        }

        if (data) {
          setUsername(data.username || '');
          setWebsite(data.website || '');
          setAvatarUrl(data.avatar_url || '');
        }
      } catch (error) {
        console.error('Error loading user data!', error);
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'Não foi possível carregar os dados do usuário.',
        });
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      getProfile();
    }
  }, [user]);

  async function updateProfile() {
    try {
      setLoading(true);
      if (!user) throw new Error('No user');

      const updates = {
        id: user.id,
        username,
        website,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(updates);

      if (error) throw error;
      
      toast({
        title: 'Sucesso',
        description: 'Perfil atualizado com sucesso!',
      });
    } catch (error) {
      console.error('Error updating profile!', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível atualizar o perfil.',
      });
    } finally {
      setLoading(false);
    }
  }

  // Se não houver usuário autenticado, redirecionar para login
  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <AuthGuard>
      <div className="container mx-auto py-8">
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Perfil do Usuário</h1>
            {userRole && <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              {userRole === 'admin' ? 'Administrador' : userRole === 'editor' ? 'Editor' : 'Visualizador'}
            </span>}
          </div>
          
          <div className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="email" className="flex items-center gap-2">
                <User size={16} /> Email
              </Label>
              <Input
                id="email"
                type="text"
                value={user?.email || ''}
                disabled
                className="bg-gray-100"
              />
              <p className="text-xs text-gray-500">Email usado para autenticação (não pode ser alterado)</p>
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="username" className="flex items-center gap-2">
                <User size={16} /> Nome de usuário
              </Label>
              <Input
                id="username"
                type="text"
                value={username || ''}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Digite seu nome de usuário"
              />
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="website" className="flex items-center gap-2">
                <Globe size={16} /> Website
              </Label>
              <Input
                id="website"
                type="url"
                value={website || ''}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://seu-site.com"
              />
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="avatar_url" className="flex items-center gap-2">
                <Image size={16} /> URL do Avatar
              </Label>
              <Input
                id="avatar_url"
                type="url"
                value={avatarUrl || ''}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://exemplo.com/seu-avatar.jpg"
              />
            </div>

            <div className="pt-2">
              <Button 
                onClick={updateProfile}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Atualizar Perfil'
                )}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Admin Panel Links */}
        {userRole && (userRole === 'admin' || userRole === 'editor') && (
          <div className="mt-6 p-6 bg-blue-50 rounded-lg max-w-md mx-auto">
            <h2 className="text-xl font-semibold mb-4">Painel Administrativo</h2>
            <div className="grid grid-cols-1 gap-3">
              <Link 
                to="/videos/admin"
                className="inline-flex items-center justify-center px-4 py-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Administrar Vídeos
              </Link>
              {userRole === 'admin' && (
                <Link 
                  to="/admin"
                  className="inline-flex items-center justify-center px-4 py-3 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                >
                  Painel de Administração Principal
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
