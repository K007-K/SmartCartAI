
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import ProductSearch from "@/components/ProductSearch";
import ProductCard from "@/components/ProductCard";
import RecentlyViewed from "@/components/RecentlyViewed";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Search, ShoppingCart } from "lucide-react";
import { Input } from "@/components/ui/input";
import CompareNavItem from "@/components/CompareNavItem";
import DashboardSidebar from "@/components/DashboardSidebar";
import { useIsMobile } from "@/hooks/use-mobile";

interface UserProduct {
  id: string;
  product_id: string;
  alert_price: number | null;
  alert_enabled: boolean;
  products: {
    id: string;
    asin: string;
    title: string;
    description: string | null;
    image_url: string | null;
    current_price: number | null;
    original_price: number | null;
    url: string | null;
    availability: string | null;
  };
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userProducts, setUserProducts] = useState<UserProduct[]>([]);
  const [user, setUser] = useState<any>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    const getUser = async () => {
      const {
        data
      } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
        fetchUserProducts(data.user.id);
      } else {
        navigate("/auth");
      }
    };
    getUser();
    const {
      data: authListener
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setUser(session.user);
        fetchUserProducts(session.user.id);
      } else if (event === "SIGNED_OUT") {
        navigate("/auth");
      }
    });
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  const fetchUserProducts = async (userId: string) => {
    try {
      setLoading(true);
      const {
        data,
        error
      } = await supabase.from("user_products").select(`
          id,
          product_id,
          alert_price,
          alert_enabled,
          products:product_id (
            id, asin, title, description, image_url, 
            current_price, original_price, url, availability
          )
        `).eq("user_id", userId).not("alert_price", "is", null).order("alert_enabled", {
        ascending: false
      });
      if (error) throw error;
      setUserProducts((data || []) as unknown as UserProduct[]);
    } catch (error: any) {
      console.error("Error fetching products:", error.message);
      toast.error("Failed to load your tracked products");
    } finally {
      setLoading(false);
    }
  };

  const handleProductSave = () => {
    if (user) {
      fetchUserProducts(user.id);
    }
  };

  return <div className="min-h-screen relative overflow-x-hidden">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50 to-blue-100"></div>
        <div className="absolute bottom-0 left-0 w-[120%] h-[120%] rounded-full bg-blue-100/60 blur-[100px] translate-y-1/4 -translate-x-1/4"></div>
      </div>

      <header className="bg-white/70 backdrop-blur-md shadow-sm py-4 fixed top-0 left-0 right-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center">
            <ShoppingCart className="h-6 w-6 text-primary mr-2" />
            <h1 className="text-2xl font-bold text-zinc-950">SmartCart AI</h1>
          </div>
          <div className="flex items-center space-x-2">
            <div className="hidden md:flex items-center space-x-4">
              <CompareNavItem />
              <Button variant="ghost" size="sm" onClick={() => navigate("/watchlist")} className="flex items-center">
                <ShoppingBag size={18} className="mr-2" />
                My Watchlist
              </Button>
              <Button variant="outline" onClick={() => supabase.auth.signOut()}>
                Sign Out
              </Button>
            </div>
            <div className="md:hidden">
              <DashboardSidebar />
            </div>
          </div>
        </div>
      </header>

      <main className="pt-24">
        <section className="py-16 px-6 relative bg-gradient-radial from-blue-300/40 via-blue-200/30 to-transparent">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col items-center mb-8 text-center">
              <h2 className="text-2xl font-bold mb-2 py-[10px] text-blue-700">Track Amazon Products & Get Price Alerts</h2>
              <p className="text-xs text-muted-foreground mb-6 py-[11px]">
                Note: This service currently supports Amazon.com only. Amazon.in support coming soon.
              </p>
              <div className="w-full max-w-3xl">
                <ProductSearch onProductSave={handleProductSave} />
              </div>
            </div>
          </div>
        </section>
        
        <section className="py-12 px-6 bg-white/40 backdrop-blur-sm border-y border-gray-100">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-xl font-bold mb-6 border-l-4 border-primary pl-3">My Tracked Products</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {loading ? <div className="col-span-full flex justify-center items-center py-12">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div> : userProducts.length > 0 ? userProducts.map(userProduct => <ProductCard key={userProduct.id} product={userProduct.products} userProductId={userProduct.id} alertPrice={userProduct.alert_price} alertEnabled={userProduct.alert_enabled} onUpdate={() => user && fetchUserProducts(user.id)} />) : <div className="col-span-full text-center py-12 text-muted-foreground">
                  <ShoppingBag className="h-16 w-16 mx-auto mb-4 opacity-20" />
                  <p className="text-lg font-medium mb-2">No products with price alerts</p>
                  <p className="mb-6">Search for products and set a target price to track them here.</p>
                </div>}
            </div>
          </div>
        </section>

        <section className="py-12 px-6">
          <div className="max-w-7xl mx-auto">
            <RecentlyViewed />
          </div>
        </section>
      </main>
    </div>;
};

export default Dashboard;
