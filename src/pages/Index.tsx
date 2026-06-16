import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { isAuthenticated } from "@/lib/api";
import { Sparkles, Loader2 } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect based on auth status
    if (isAuthenticated()) {
      // If authenticated, redirect to projects dashboard
      navigate("/projects");
    } else {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/3 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative flex flex-col items-center">
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-8 shadow-glow border border-primary/20 backdrop-blur-xl">
          <Sparkles className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-4xl font-bold gradient-text mb-4 tracking-tight">Design Forge</h1>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    </div>
  );
};

export default Index;
