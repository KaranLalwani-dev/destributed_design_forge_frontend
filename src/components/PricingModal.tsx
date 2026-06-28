import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface PricingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PricingModal({ open, onOpenChange }: PricingModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState<number | null>(null);

  const handleCheckout = async (planId: number) => {
    setLoading(planId);
    try {
      const response = await api.createCheckoutSession(planId);
      if (response && response.url) {
        window.location.href = response.url;
      } else {
        throw new Error("Invalid checkout response");
      }
    } catch (error) {
      console.error("Failed to start checkout", error);
      toast({
        title: "Checkout failed",
        description: "Could not initiate the checkout process. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl bg-background border border-border/50 shadow-2xl p-0 overflow-hidden">
        <div className="p-8">
          <DialogHeader className="mb-8 text-center">
            <DialogTitle className="text-3xl font-bold tracking-tight text-foreground">
              Upgrade your workflow
            </DialogTitle>
            <p className="text-muted-foreground mt-2">
              Choose the right plan for you and your team.
            </p>
          </DialogHeader>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Pro Plan */}
            <div className="relative p-6 bg-white border border-border/60 shadow-sm rounded-2xl flex flex-col">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-foreground">Pro</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-foreground">$15</span>
                  <span className="text-muted-foreground text-sm font-medium">/month</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Perfect for individual professionals and freelancers.
                </p>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                <li className="flex items-center gap-3 text-sm text-foreground">
                  <Check className="h-4 w-4 text-primary" />
                  Up to 10 Projects
                </li>
                <li className="flex items-center gap-3 text-sm text-foreground">
                  <Check className="h-4 w-4 text-primary" />
                  10,000 AI tokens / day
                </li>
                <li className="flex items-center gap-3 text-sm text-foreground">
                  <Check className="h-4 w-4 text-primary" />
                  50 Previews / day
                </li>
                <li className="flex items-center gap-3 text-sm text-foreground">
                  <Check className="h-4 w-4 text-primary" />
                  Priority Support
                </li>
              </ul>
              <Button
                className="w-full rounded-xl font-medium"
                size="lg"
                onClick={() => handleCheckout(1)}
                disabled={loading !== null}
              >
                {loading === 1 ? "Redirecting..." : "Upgrade to Pro"}
              </Button>
            </div>

            {/* Enterprise Plan */}
            <div className="relative p-6 bg-primary text-primary-foreground shadow-lg rounded-2xl flex flex-col">
              <div className="absolute top-0 right-6 transform -translate-y-1/2">
                <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-bold uppercase tracking-wider py-1 px-3 rounded-full">
                  Most Popular
                </span>
              </div>
              <div className="mb-4">
                <h3 className="text-xl font-bold">Enterprise</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold">$49</span>
                  <span className="text-primary-foreground/80 text-sm font-medium">/month</span>
                </div>
                <p className="text-sm text-primary-foreground/80 mt-2">
                  For power users and scaling teams.
                </p>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                <li className="flex items-center gap-3 text-sm">
                  <Check className="h-4 w-4" />
                  Unlimited Projects
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <Check className="h-4 w-4" />
                  Unlimited AI Access
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <Check className="h-4 w-4" />
                  Unlimited Previews
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <Check className="h-4 w-4" />
                  24/7 Dedicated Support
                </li>
              </ul>
              <Button
                variant="secondary"
                className="w-full rounded-xl font-medium bg-white text-primary hover:bg-white/90"
                size="lg"
                onClick={() => handleCheckout(2)}
                disabled={loading !== null}
              >
                {loading === 2 ? "Redirecting..." : "Upgrade to Enterprise"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
