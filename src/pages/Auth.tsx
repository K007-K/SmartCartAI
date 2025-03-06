import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Lock, Mail, ArrowRight, ArrowLeft, ShoppingCart } from "lucide-react";
const Auth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  useEffect(() => {
    const checkSession = async () => {
      const {
        data
      } = await supabase.auth.getSession();
      if (data.session) {
        navigate("/");
      }
    };
    checkSession();
    const {
      data: authListener
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        navigate("/");
      }
    });
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (isSignUp) {
        const {
          error
        } = await supabase.auth.signUp({
          email,
          password
        });
        if (error) throw error;
        toast.success("Registration successful! Please check your email for verification.");
      } else {
        const {
          error
        } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        toast.success("Login successful!");
        navigate("/");
      }
    } catch (error: any) {
      toast.error(error.message || "Authentication failed");
      console.error("Auth error:", error);
    } finally {
      setLoading(false);
    }
  };
  return <div className="min-h-screen flex flex-col bg-background">
      <div className="pt-6 px-6 bg-sky-100">
        <Button variant="ghost" size="sm" className="flex items-center" onClick={() => navigate("/")}>
          <ArrowLeft size={16} className="mr-2" />
          Back to Home
        </Button>
      </div>
      
      <div className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-sky-100">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <Link to="/">
              <div className="flex items-center justify-center space-x-2">
                <ShoppingCart className="h-6 w-6 text-primary" />
                <h1 className="text-4xl font-bold mb-2 cursor-pointer hover:opacity-80 transition-opacity text-zinc-950">
                  SmartCart AI
                </h1>
              </div>
            </Link>
            <h2 className="text-2xl font-semibold">
              {isSignUp ? "Create an account" : "Sign in to your account"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {isSignUp ? "Start tracking Amazon prices and get AI-powered insights" : "Track prices, set alerts, and get AI-powered shopping insights"}
            </p>
          </div>

          <div className="glass p-8 rounded-3xl">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                      <Mail size={16} />
                    </div>
                    <Input id="email" name="email" type="email" autoComplete="email" required placeholder="example@email.com" value={email} onChange={e => setEmail(e.target.value)} className="pl-10 rounded-3xl" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                      <Lock size={16} />
                    </div>
                    <Input id="password" name="password" type="password" autoComplete={isSignUp ? "new-password" : "current-password"} required placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className="pl-10 rounded-3xl" />
                  </div>
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full rounded-3xl">
                {loading ? <span className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-background border-t-transparent rounded-full animate-spin mr-2"></div>
                    {isSignUp ? "Creating Account..." : "Signing In..."}
                  </span> : <span className="flex items-center justify-center">
                    {isSignUp ? "Create Account" : "Sign In"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </span>}
              </Button>

              <div className="text-center text-sm">
                <span className="text-muted-foreground">
                  {isSignUp ? "Already have an account?" : "Don't have an account?"}
                </span>{" "}
                <button type="button" className="text-primary hover:text-primary/80 font-medium" onClick={() => setIsSignUp(!isSignUp)}>
                  {isSignUp ? "Sign in" : "Create one"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>;
};
export default Auth;