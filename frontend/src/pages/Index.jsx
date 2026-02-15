import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
const Index = () => {
  const navigate = useNavigate();
  return (<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-cyan-50 to-teal-50 dark:from-gray-950 dark:via-emerald-950/30 dark:to-gray-950 relative overflow-hidden">
    {}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/30 rounded-full mix-blend-multiply filter blur-xl animate-blob" />
      <div className="absolute top-40 right-20 w-72 h-72 bg-sky-400/30 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000" />
      <div className="absolute bottom-20 left-20 w-72 h-72 bg-violet-400/30 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000" />
    </div>

    <div className="text-center space-y-8 p-8 max-w-4xl relative z-10">
      <h1 className="text-7xl md:text-8xl font-extrabold bg-gradient-to-r from-blue-600 via-sky-600 to-violet-600 bg-clip-text text-transparent">
        MartNexus
      </h1>
      <p className="text-3xl font-medium text-muted-foreground">
        Advanced Inventory Management System
      </p>
      <Button onClick={() => navigate("/auth")} size="lg" className="mt-8 text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 shadow-xl hover:shadow-2xl transition-all duration-300">
        {sessionStorage.getItem('token') ? 'Go to Dashboard' : 'Get Started'} <ArrowRight className="ml-2 h-5 w-5" />
      </Button>
    </div>

    <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
  </div>);
};
export default Index;
