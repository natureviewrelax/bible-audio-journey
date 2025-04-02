
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import { AuthGuard } from '@/components/AuthGuard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function Profile() {
  const { user, userRole } = useAuth();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [website, setWebsite] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    async function getProfile() {
      try {
        setLoading(true);
        if (!user) throw new Error('No user');

        const { data, error, status } = await supabase
          .from('profiles')
          .select(`username, website, avatar_url`)
          .eq('id', user.id)
          .single();

        if (error && status !== 406) {
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

    getProfile();
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

      const { error } = await supabase.from('profiles').upsert(updates);
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

  return (
    <AuthGuard>
      <div className="container mx-auto py-8">
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-6">Perfil</h1>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="text"
                value={user?.email || ''}
                disabled
              />
            </div>
            
            <div>
              <Label htmlFor="username">Nome de usuário</Label>
              <Input
                id="username"
                type="text"
                value={username || ''}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={website || ''}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="avatar_url">URL do Avatar</Label>
              <Input
                id="avatar_url"
                type="url"
                value={avatarUrl || ''}
                onChange={(e) => setAvatarUrl(e.target.value)}
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
        
        {/* Add Admin links if user has admin or editor role */}
        {userRole && (userRole === 'admin' || userRole === 'editor') && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg max-w-md mx-auto">
            <h2 className="text-xl font-semibold mb-2">Área Administrativa</h2>
            <div className="flex flex-wrap gap-2">
              <Link 
                to="/videos/admin"
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors"
              >
                Administrar Vídeos
              </Link>
              {/* Add other admin links as needed */}
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
