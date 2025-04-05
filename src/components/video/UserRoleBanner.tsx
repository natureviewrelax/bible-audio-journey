
import React from 'react';
import { User } from '@supabase/supabase-js';
import { UserRole } from "@/components/AuthProvider";

interface UserRoleBannerProps {
  user: User | null;
  userRole: UserRole;
}

export const UserRoleBanner: React.FC<UserRoleBannerProps> = ({ user, userRole }) => {
  return (
    <div className="mb-6 p-4 bg-blue-50 rounded-lg">
      <p className="font-medium">
        Logado como: {user?.email} ({userRole})
      </p>
      <p className="text-sm text-gray-600 mt-1">
        {userRole === 'admin' ? 
          'Você tem permissão para adicionar, editar e excluir vídeos.' : 
          'Você tem permissão para adicionar e editar vídeos, mas não pode excluí-los.'}
      </p>
    </div>
  );
};
