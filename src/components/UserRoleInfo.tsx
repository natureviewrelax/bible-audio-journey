
interface UserRoleInfoProps {
  userRole: string | null;
}

export const UserRoleInfo = ({ userRole }: UserRoleInfoProps) => {
  if (!userRole) return null;
  
  return (
    <div className="mb-4 p-4 bg-muted rounded-md">
      <p className="text-sm">
        <strong>Seu papel:</strong> {userRole}
        {(userRole === 'admin' || userRole === 'editor') && (
          <span className="ml-2 text-green-600 dark:text-green-400">
            Você tem permissão para adicionar áudios.
          </span>
        )}
      </p>
    </div>
  );
};
