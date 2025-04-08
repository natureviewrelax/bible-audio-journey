
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import { AuthGuard } from '@/components/AuthGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CircleUser, Film, Book, Settings, Users } from 'lucide-react';

export default function Admin() {
  const { user, userRole } = useAuth();

  return (
    <AuthGuard allowedRoles={['admin']}>
      <div className="container mx-auto p-4 bg-gray-50 min-h-screen">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <Link 
              to="/"
              className="inline-flex items-center justify-center px-6 py-3 text-lg font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors"
            >
              Voltar para Início
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-center text-gray-800">Painel de Administração</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card de Vídeos */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
              <div className="flex items-center gap-3">
                <Film size={32} />
                <CardTitle>Gerenciamento de Vídeos</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <CardDescription className="text-gray-600 mb-6">
                Adicione, edite e remova vídeos bíblicos da plataforma.
              </CardDescription>
              <Link 
                to="/videos/admin"
                className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Gerenciar Vídeos
              </Link>
            </CardContent>
          </Card>

          {/* Card de Áudios */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-t-lg">
              <div className="flex items-center gap-3">
                <Book size={32} />
                <CardTitle>Áudios da Bíblia</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <CardDescription className="text-gray-600 mb-6">
                Configure e gerencie os áudios da Bíblia e autores.
              </CardDescription>
              <Link 
                to="/audio/admin"
                className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
              >
                Gerenciar Áudios
              </Link>
            </CardContent>
          </Card>

          {/* Card de Usuários */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg">
              <div className="flex items-center gap-3">
                <Users size={32} />
                <CardTitle>Usuários</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <CardDescription className="text-gray-600 mb-6">
                Visualize e gerencie os usuários da plataforma.
              </CardDescription>
              <Link 
                to="/users/admin"
                className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
              >
                Gerenciar Usuários
              </Link>
            </CardContent>
          </Card>

          {/* Card de Configurações */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-t-lg">
              <div className="flex items-center gap-3">
                <Settings size={32} />
                <CardTitle>Configurações</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <CardDescription className="text-gray-600 mb-6">
                Configure as opções gerais da plataforma.
              </CardDescription>
              <Link 
                to="/settings/admin"
                className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors"
              >
                Configurações do Sistema
              </Link>
            </CardContent>
          </Card>

          {/* Card de Perfil */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-t-lg">
              <div className="flex items-center gap-3">
                <CircleUser size={32} />
                <CardTitle>Seu Perfil</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <CardDescription className="text-gray-600 mb-6">
                Gerencie seu perfil e informações pessoais.
              </CardDescription>
              <Link 
                to="/profile"
                className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors"
              >
                Ver Perfil
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  );
}
