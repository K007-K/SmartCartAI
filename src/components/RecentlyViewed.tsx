import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "react-router-dom";
import { Bell, DollarSign, Loader2 } from "lucide-react";
import { toast } from "sonner";
import CompareButton from "./CompareButton";
interface RecentlyViewedProps {
  limit?: number;
}
const RecentlyViewed = ({
  limit = 5
}: RecentlyViewedProps) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [userProducts, setUserProducts] = useState<Map<string, any>>(new Map());
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
  const [alertPrices, setAlertPrices] = useState<Map<string, string>>(new Map());
  const [alertEnabled, setAlertEnabled] = useState<Map<string, boolean>>(new Map());
  const [isSaving, setIsSaving] = useState<Map<string, boolean>>(new Map());
  useEffect(() => {
    fetchRecentlyViewed();
    fetchUserProducts();
  }, []);
  const fetchRecentlyViewed = async () => {
    try {
      setLoading(true);
      const {
        data: session
      } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        setLoading(false);
        return;
      }
      const {
        data,
        error
      } = await supabase.from("recently_viewed").select(`
          product_id,
          viewed_at,
          products:product_id (
            id, asin, title, image_url, current_price, original_price
          )
        `).eq("user_id", session.session.user.id).order("viewed_at", {
        ascending: false
      }).limit(limit);
      if (error) throw error;

      // Filter out any items where products is null
      const validData = data.filter(item => item.products !== null);
      const formattedData = validData.map(item => ({
        viewedAt: item.viewed_at,
        ...item.products
      }));
      setProducts(formattedData);
    } catch (error: any) {
      console.error("Error fetching recently viewed products:", error.message);
    } finally {
      setLoading(false);
    }
  };
  const fetchUserProducts = async () => {
    try {
      const {
        data: session
      } = await supabase.auth.getSession();
      if (!session?.session?.user) return;
      const {
        data,
        error
      } = await supabase.from("user_products").select("id, product_id, alert_price, alert_enabled").eq("user_id", session.session.user.id);
      if (error) throw error;
      const userProductsMap = new Map();
      const alertPricesMap = new Map();
      const alertEnabledMap = new Map();
      data.forEach(item => {
        userProductsMap.set(item.product_id, item);
        alertPricesMap.set(item.product_id, item.alert_price ? String(item.alert_price) : "");
        alertEnabledMap.set(item.product_id, item.alert_enabled);
      });
      setUserProducts(userProductsMap);
      setAlertPrices(alertPricesMap);
      setAlertEnabled(alertEnabledMap);
    } catch (error: any) {
      console.error("Error fetching user products:", error.message);
    }
  };
  const toggleExpandProduct = (productId: string) => {
    if (expandedProduct === productId) {
      setExpandedProduct(null);
    } else {
      setExpandedProduct(productId);
      if (!alertPrices.has(productId)) {
        setAlertPrices(prev => {
          const newMap = new Map(prev);
          newMap.set(productId, "");
          return newMap;
        });
        setAlertEnabled(prev => {
          const newMap = new Map(prev);
          newMap.set(productId, false);
          return newMap;
        });
      }
    }
  };
  const handlePriceChange = (productId: string, value: string) => {
    setAlertPrices(prev => {
      const newMap = new Map(prev);
      newMap.set(productId, value);
      return newMap;
    });
  };
  const handleAlertToggle = (productId: string, checked: boolean) => {
    setAlertEnabled(prev => {
      const newMap = new Map(prev);
      newMap.set(productId, checked);
      return newMap;
    });
  };
  const saveAlert = async (product: any) => {
    try {
      setIsSaving(prev => {
        const newMap = new Map(prev);
        newMap.set(product.id, true);
        return newMap;
      });
      const {
        data: session
      } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        toast.error("Please log in to set price alerts");
        return;
      }
      const price = alertPrices.get(product.id);
      const enabled = alertEnabled.get(product.id);
      if (enabled && (!price || parseFloat(price) <= 0)) {
        toast.error("Please enter a valid target price");
        return;
      }
      const userProduct = userProducts.get(product.id);
      if (userProduct) {
        // Update existing user product
        const {
          error
        } = await supabase.from("user_products").update({
          alert_price: price === "" ? null : Number(price),
          alert_enabled: enabled
        }).eq("id", userProduct.id);
        if (error) throw error;
      } else {
        // Create new user product
        const {
          error
        } = await supabase.from("user_products").insert({
          user_id: session.session.user.id,
          product_id: product.id,
          alert_price: price === "" ? null : Number(price),
          alert_enabled: enabled
        });
        if (error) throw error;
      }
      toast.success("Alert settings saved");
      fetchUserProducts();
    } catch (error: any) {
      toast.error("Failed to save alert settings");
      console.error("Error saving alert settings:", error.message);
    } finally {
      setIsSaving(prev => {
        const newMap = new Map(prev);
        newMap.set(product.id, false);
        return newMap;
      });
    }
  };
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2
    }).format(price);
  };
  if (loading) {
    return <div className="text-center py-4">
        <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
        <p className="text-xs text-muted-foreground">Loading recently viewed products...</p>
      </div>;
  }
  if (products.length === 0) {
    return <div className="p-4 rounded-xl border border-border">
        <h2 className="text-lg font-bold mb-3">Recently Viewed</h2>
        <p className="text-sm text-muted-foreground">No recently viewed products yet.</p>
      </div>;
  }
  return <div className="p-4 rounded-xl border bg-transparent">
      <h2 className="text-lg font-bold mb-3">Recently Viewed</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {products.map(product => <Card key={product.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-2">
              <div className="aspect-square bg-muted rounded mb-1 cursor-pointer" onClick={() => navigate(`/product/${product.asin}`)}>
                <img src={product.image_url || "/placeholder.svg"} alt={product.title} className="w-full h-full object-contain" />
              </div>
              <h3 className="text-xs font-medium line-clamp-1 mb-1 cursor-pointer" onClick={() => navigate(`/product/${product.asin}`)}>
                {product.title}
              </h3>
              <div className="text-sm font-bold text-primary">
                {product.current_price ? formatPrice(product.current_price) : "N/A"}
              </div>
              
              <div className="flex flex-col gap-1 mt-1">
                <div className="flex items-center justify-between gap-1">
                  <CompareButton product={product} size="sm" className="h-6 px-1 text-xs w-full" />
                  <Button variant="outline" size="sm" className="h-6 px-1 text-xs" onClick={() => toggleExpandProduct(product.id)}>
                    <Bell size={12} className="mr-1" />
                    Alert
                  </Button>
                </div>
                
                {expandedProduct === product.id && <div className="mt-2 border-t pt-2">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-1">
                        <div className="relative flex-1">
                          <DollarSign className="h-3 w-3 absolute left-2 top-1.5 text-muted-foreground" />
                          <Input type="number" placeholder="Target price" value={alertPrices.get(product.id) || ""} onChange={e => handlePriceChange(product.id, e.target.value)} className="text-xs h-6 pl-7" />
                        </div>
                        <Switch checked={alertEnabled.get(product.id) || false} onCheckedChange={checked => handleAlertToggle(product.id, checked)} className="scale-75" />
                      </div>
                      <Button size="sm" className="h-6 text-xs w-full" onClick={() => saveAlert(product)} disabled={isSaving.get(product.id)}>
                        {isSaving.get(product.id) ? <Loader2 size={12} className="animate-spin mr-1" /> : null}
                        Save Alert
                      </Button>
                    </div>
                  </div>}
              </div>
            </CardContent>
          </Card>)}
      </div>
    </div>;
};
export default RecentlyViewed;