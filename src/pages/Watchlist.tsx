import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import ProductCard from "@/components/ProductCard";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShoppingBag, Loader2, Search, ShoppingCart } from "lucide-react";

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

const Watchlist = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userProducts, setUserProducts] = useState<UserProduct[]>([]);
  const [user, setUser] = useState<any>(null);

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
      toast.error("Failed to load your watchlist");
    } finally {
      setLoading(false);
    }
  };

  return <div className="min-h-screen bg-background">
      <header className="bg-card shadow-md mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <ShoppingCart className="h-6 w-6 text-primary mr-2" />
            <h1 className="text-2xl font-bold text-zinc-950">SmartCart AI</h1>
          </div>
          <Button variant="outline" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass p-6 rounded-xl mb-8">
          <div className="flex items-center mb-4">
            <ShoppingBag className="h-6 w-6 mr-2 text-primary" />
            <h2 className="text-2xl font-bold">My Watchlist</h2>
          </div>
          <p className="text-muted-foreground">
            Manage your price alerts and tracked products
          </p>
        </div>

        <div className="glass p-4 rounded-xl mt-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {loading ? <div className="col-span-full flex justify-center items-center py-24">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <span className="ml-2 text-muted-foreground">Loading your watchlist...</span>
              </div> : userProducts.length > 0 ? userProducts.map(userProduct => <ProductCard key={userProduct.id} product={userProduct.products} userProductId={userProduct.id} alertPrice={userProduct.alert_price} alertEnabled={userProduct.alert_enabled} onUpdate={() => user && fetchUserProducts(user.id)} />) : <div className="col-span-full text-center py-24 text-muted-foreground">
                <ShoppingBag className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p className="text-lg font-medium mb-2">Your watchlist is empty</p>
                <p className="mb-6">Set a target price on products to add them to your watchlist</p>
                <Button onClick={() => navigate("/dashboard")}>
                  <Search className="mr-2 h-4 w-4" />
                  Search Products
                </Button>
              </div>}
          </div>
        </div>
      </main>
    </div>;
};

export default Watchlist;
