import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Loader2, Mail, User, Lock } from "lucide-react";
import { api, setAuthToken, setUserInfo } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ParticleAnimation } from "@/components/ParticleAnimation";

export default function Signup() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || !email || !password) {
            toast({
                title: "Missing details",
                description: "Please fill in all fields",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);

        try {
            const response = await api.signup({ name, username: email, password });
            setAuthToken(response.token);
            setUserInfo(response.user);
            toast({
                title: "Welcome!",
                description: "Account created successfully",
            });
            navigate("/projects");
        } catch (error) {
            toast({
                title: "Signup failed",
                description: error instanceof Error ? error.message : "Could not create account",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-background overflow-hidden relative">
            <ParticleAnimation />

            <div className="relative z-10 w-full max-w-md">
                {/* Card */}
                <div className="bg-card/85 backdrop-blur-md border border-border/50 rounded-xl sm:rounded-2xl p-5 xs:p-6 sm:p-8 shadow-2xl transition-all duration-300">
                    {/* Logo */}
                    <div className="text-center mb-6 sm:mb-8">
                        <h1 className="text-xl sm:text-2xl font-semibold text-foreground mb-1.5 sm:mb-2">Create an account</h1>
                        <p className="text-muted-foreground text-xs sm:text-sm">Start building your next big idea</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                        <div className="space-y-1.5 sm:space-y-2">
                            <Label htmlFor="name" className="text-xs sm:text-sm font-medium text-foreground">
                                Full Name
                            </Label>
                            <div className="relative">
                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="John Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="pl-10 h-11 sm:h-12 bg-muted/50 border-border/50 focus:border-primary rounded-xl text-base sm:text-sm"
                                    disabled={isLoading}
                                    autoComplete="name"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5 sm:space-y-2">
                            <Label htmlFor="email" className="text-xs sm:text-sm font-medium text-foreground">
                                Email
                            </Label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10 h-11 sm:h-12 bg-muted/50 border-border/50 focus:border-primary rounded-xl text-base sm:text-sm"
                                    disabled={isLoading}
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5 sm:space-y-2">
                            <Label htmlFor="password" className="text-xs sm:text-sm font-medium text-foreground">
                                Password
                            </Label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-10 h-11 sm:h-12 bg-muted/50 border-border/50 focus:border-primary rounded-xl text-base sm:text-sm"
                                    disabled={isLoading}
                                    autoComplete="new-password"
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-11 sm:h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl text-sm sm:text-base"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Creating account...
                                </>
                            ) : (
                                "Create account"
                            )}
                        </Button>
                    </form>

                    <p className="text-center text-xs sm:text-sm text-muted-foreground mt-5 sm:mt-6">
                        Already have an account?{" "}
                        <Link to="/login" className="text-primary hover:underline font-medium">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
