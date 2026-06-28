import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

export function CheckoutCancel() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full p-8 bg-card rounded-2xl shadow-xl text-center border border-border/50">
        <div className="flex justify-center mb-6">
          <div className="h-20 w-20 bg-red-500/10 rounded-full flex items-center justify-center">
            <XCircle className="h-10 w-10 text-red-500" />
          </div>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-4">Checkout Cancelled</h1>
        <p className="text-muted-foreground mb-8">
          Your payment was cancelled. No charges were made to your account.
        </p>
        <div className="flex gap-4 justify-center">
          <Button variant="outline" onClick={() => navigate("/dashboard")} className="w-full h-12 text-md">
            Go to Dashboard
          </Button>
          <Button onClick={() => navigate(-1)} className="w-full h-12 text-md">
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}
