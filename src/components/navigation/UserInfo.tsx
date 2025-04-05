
import { useAuth } from "@/components/AuthProvider";

export const UserInfo = () => {
  const { user, userRole } = useAuth();

  if (!user) return null;

  return (
    <div className="text-sm text-muted-foreground mr-2 hidden md:block hover:text-primary transition-colors">
      <span className="font-medium">{user.email}</span>
      {userRole && (
        <span className="ml-2 bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-semibold">
          {userRole}
        </span>
      )}
    </div>
  );
};
