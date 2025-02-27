
import { LoginForm } from "@/components/LoginForm";

const Login = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-serif text-center mb-8">Bíblia em Áudio</h1>
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;
