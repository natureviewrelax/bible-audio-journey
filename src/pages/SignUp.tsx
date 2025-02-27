
import { SignUpForm } from "@/components/SignUpForm";

const SignUp = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-serif text-center mb-8">Bíblia em Áudio</h1>
        <SignUpForm />
      </div>
    </div>
  );
};

export default SignUp;
