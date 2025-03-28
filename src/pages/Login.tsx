
import { LoginForm } from "@/components/LoginForm";

const Login = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className=" bg-card rounded-lg shadow-md p-3 w-full max-w-md">
        <div className="flex items-center justify-center mb-4">
          <img src="/logo.png" className="h-18 w-18" alt="Bíblia em Áudio JFAC 1848" />
        </div>
        <h1 className="text-4xl font-serif text-center mb-8">Bíblia em Áudio JFAC 1848</h1>
        <LoginForm />

      </div>
    </div>
  );
};

export default Login;
