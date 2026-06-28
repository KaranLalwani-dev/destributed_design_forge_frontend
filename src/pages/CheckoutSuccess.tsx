import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export function CheckoutSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [counter, setCounter] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCounter((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/dashboard");
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full p-8 bg-card rounded-2xl shadow-xl text-center border border-border/50">
        <div className="flex justify-center mb-6">
          <div className="h-20 w-20 bg-green-500/10 rounded-full flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-4">Payment Successful!</h1>
        <p className="text-muted-foreground mb-8">
          Thank you for upgrading! Your subscription is now active.
        </p>
        <p className="text-sm text-muted-foreground mb-8">
          Redirecting to your dashboard in {counter} seconds...
        </p>
        <Button onClick={() => navigate("/dashboard")} className="w-full h-12 text-md">
          Go to Dashboard Now
        </Button>
      </div>
    </div>
  );
}
