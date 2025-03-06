
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import ProductDetail from "./pages/ProductDetail";
import Watchlist from "./pages/Watchlist";
import Compare from "./pages/Compare";
import { ComparisonProvider } from "./contexts/ComparisonContext";

const queryClient = new QueryClient();

// Function to check price alerts - will be invoked by cron job
const checkPriceAlerts = async () => {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session) return;
    
    await supabase.functions.invoke("check-price-alerts", {
      body: {}
    });
  } catch (error) {
    console.error("Error checking price alerts:", error);
  }
};

const App = () => {
  useEffect(() => {
    // On app load, run a price check - this is in addition to the scheduled checks
    checkPriceAlerts();
    
    // This is just for development - in production this would be handled by Supabase cron jobs
    const checkInterval = 8 * 60 * 60 * 1000; // 8 hours in milliseconds
    const intervalId = setInterval(checkPriceAlerts, checkInterval);
    
    return () => clearInterval(intervalId);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ComparisonProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/product/:asin" element={<ProductDetail />} />
              <Route path="/watchlist" element={<Watchlist />} />
              <Route path="/compare" element={<Compare />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ComparisonProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
