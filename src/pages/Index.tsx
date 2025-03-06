import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Button } from "@/components/ui/button";
import { ShoppingCart, ArrowRight } from "lucide-react";
const Index = () => {
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      const {
        data
      } = await supabase.auth.getSession();
      if (data.session) {
        navigate("/dashboard");
      }
    };
    checkSession();
  }, [navigate]);

  // Smooth page transitions
  useEffect(() => {
    document.body.classList.add('animate-fade-in');
    return () => {
      document.body.classList.remove('animate-fade-in');
    };
  }, []);
  return <div className="min-h-screen bg-gradient-soft overflow-hidden">
      <Navbar />
      <main>
        <section className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden bg-blue-100">
          {/* Gradient background instead of shopping doodles */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-soft-blue/40 blur-3xl" />
            <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-soft-purple/30 blur-3xl" />
          </div>
          
          {/* Content */}
          <div className="max-w-4xl mx-auto text-center pt-24">
            <span className="inline-block px-3 py-1 mb-6 text-xs font-medium bg-soft-blue/50 rounded-full animate-fade-in">
              AI-Powered Amazon Price Tracker
            </span>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-fade-in">
              <span className="block">Never overpay on</span>
              <span className="block mt-2 text-primary">Amazon again</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-slide-up delay-200">
              Track prices, get alerts, view history, and receive AI-powered shopping insights for Amazon products.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up delay-300">
              <Button size="lg" className="rounded-full px-8 flex items-center gap-2" onClick={() => navigate("/auth")}>
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="rounded-full px-8" onClick={() => navigate("/dashboard")}>
                View Demo
              </Button>
            </div>
          </div>
        </section>
        
        <section id="features" className="py-24 px-6 relative overflow-hidden bg-gradient-minimal bg-blue-900">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <span className="inline-block px-3 py-1 mb-4 text-xs font-medium bg-soft-purple/50 rounded-full">
                Features
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">Smart Amazon shopping assistant</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Track prices, get alerts, view price history, and receive AI-powered insights for smarter shopping decisions.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="glass p-8 rounded-2xl">
                <div className="bg-soft-green w-12 h-12 rounded-xl flex items-center justify-center mb-5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3">Price Tracking</h3>
                <p className="text-muted-foreground">Track Amazon product prices in real-time and see when prices drop to their lowest point.</p>
              </div>
              
              <div className="glass p-8 rounded-2xl">
                <div className="bg-soft-yellow w-12 h-12 rounded-xl flex items-center justify-center mb-5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3">Price Drop Alerts</h3>
                <p className="text-muted-foreground">Set custom price alerts and get notified when products reach your target price.</p>
              </div>
              
              <div className="glass p-8 rounded-2xl">
                <div className="bg-soft-orange w-12 h-12 rounded-xl flex items-center justify-center mb-5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 3v18h18" />
                    <path d="m19 9-5 5-4-4-3 3" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3">Price History Charts</h3>
                <p className="text-muted-foreground">View detailed price history charts to identify patterns and the best time to buy.</p>
              </div>
              
              <div className="glass p-8 rounded-2xl">
                <div className="bg-soft-purple w-12 h-12 rounded-xl flex items-center justify-center mb-5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4" />
                    <path d="M12 8h.01" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3">AI-Powered Insights</h3>
                <p className="text-muted-foreground">Get smart product recommendations and shopping advice powered by Gemini AI.</p>
              </div>
              
              <div className="glass p-8 rounded-2xl">
                <div className="bg-soft-pink w-12 h-12 rounded-xl flex items-center justify-center mb-5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3">User Dashboard</h3>
                <p className="text-muted-foreground">Personalized dashboard to manage your tracked products, alerts, and recommendations.</p>
              </div>
              
              <div className="glass p-8 rounded-2xl">
                <div className="bg-soft-peach w-12 h-12 rounded-xl flex items-center justify-center mb-5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="14" x="2" y="3" rx="2" />
                    <line x1="8" x2="16" y1="21" y2="21" />
                    <line x1="12" x2="12" y1="17" y2="21" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3">Reviews Analysis</h3>
                <p className="text-muted-foreground">Get helpful insights from the sentiment analysis of the customers reviews.</p>
              </div>
            </div>
          </div>
        </section>
        
        <section id="cta" className="py-24 px-6 bg-blue-50">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-800">Ready to start saving on Amazon?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Create your free account today and never miss a price drop again.
            </p>
            <div className="flex justify-center">
              <Button size="lg" className="rounded-full px-8 flex items-center gap-2" onClick={() => navigate("/auth")}>
                Get Started Now
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>;
};
export default Index;