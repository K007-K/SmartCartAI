import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, DollarSign, ExternalLink, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import CompareButton from "./CompareButton";
interface ProductCardProps {
  product: any;
  userProductId: string;
  alertPrice: number | null;
  alertEnabled: boolean;
  onUpdate: () => void;
}
const ProductCard = ({
  product,
  userProductId,
  alertPrice,
  alertEnabled,
  onUpdate
}: ProductCardProps) => {
  const navigate = useNavigate();
  const [isUpdating, setIsUpdating] = useState(false);
  const [newAlertPrice, setNewAlertPrice] = useState(alertPrice?.toString() || "");
  const [newAlertEnabled, setNewAlertEnabled] = useState(alertEnabled);
  const [priceError, setPriceError] = useState<string | null>(null);
  const handleSaveAlert = async () => {
    try {
      if (newAlertEnabled && (!newAlertPrice || parseFloat(newAlertPrice) <= 0)) {
        setPriceError("Please enter a valid target price");
        return;
      }
      setIsUpdating(true);
      setPriceError(null);
      const {
        error
      } = await supabase.from("user_products").update({
        alert_price: newAlertPrice === "" ? null : Number(newAlertPrice),
        alert_enabled: newAlertEnabled
      }).eq("id", userProductId);
      if (error) throw error;
      toast.success("Alert settings updated");
      onUpdate();
    } catch (error: any) {
      toast.error("Failed to update alert settings");
      console.error("Error updating alert:", error.message);
    } finally {
      setIsUpdating(false);
    }
  };
  const handleRemoveProduct = async () => {
    try {
      setIsUpdating(true);
      const {
        error
      } = await supabase.from("user_products").delete().eq("id", userProductId);
      if (error) throw error;
      toast.success("Product removed from tracking");
      onUpdate();
    } catch (error: any) {
      toast.error("Failed to remove product");
      console.error("Error removing product:", error.message);
    } finally {
      setIsUpdating(false);
    }
  };
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2
    }).format(price);
  };
  const discount = product.original_price && product.current_price ? Math.round((product.original_price - product.current_price) / product.original_price * 100) : 0;
  const getPriceAlertStatus = () => {
    if (!alertEnabled || !alertPrice || !product.current_price) return "";
    if (product.current_price <= alertPrice) {
      return "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800/30";
    }
    const threshold = alertPrice * 1.1;
    if (product.current_price <= threshold) {
      return "bg-[#FFDEE2] border-red-200 dark:bg-red-950/20 dark:border-red-800/30";
    }
    return "";
  };
  const getPriceTextColor = () => {
    if (!alertEnabled || !alertPrice || !product.current_price) return "";
    if (product.current_price <= alertPrice) {
      return "text-green-600 dark:text-green-400";
    }
    const threshold = alertPrice * 1.1;
    if (product.current_price <= threshold) {
      return "text-red-600 dark:text-red-400";
    }
    return "";
  };
  return <Card className={cn("overflow-hidden transition-all hover:shadow-md border-[1.5px]", getPriceAlertStatus())}>
      <CardContent className="p-2">
        <div className="aspect-square bg-muted rounded-lg mb-2 cursor-pointer hover:opacity-90 transition-opacity" onClick={() => navigate(`/product/${product.asin}`)}>
          <img src={product.image_url || "/placeholder.svg"} alt={product.title} className="w-full h-full object-contain p-2" />
        </div>
        
        <h3 className="text-xs font-medium line-clamp-2 mb-1 cursor-pointer hover:text-primary/80 transition-colors" onClick={() => navigate(`/product/${product.asin}`)}>
          {product.title}
        </h3>
        
        <div className={cn("text-sm font-bold", getPriceTextColor())}>
          {product.current_price ? formatPrice(product.current_price) : "N/A"}
        </div>
        
        {discount > 0 && <div className="flex items-center gap-1 text-xs">
            <span className="line-through text-muted-foreground">
              {formatPrice(product.original_price)}
            </span>
            <span className="text-green-500 font-medium">
              -{discount}%
            </span>
          </div>}

        <div className="flex flex-col gap-1 mt-2">
          <div className="flex items-center justify-between gap-1">
            <CompareButton product={product} size="sm" className="h-7 px-2 text-xs w-full bg-blue-500 hover:bg-blue-600 text-white rounded-md" />
          </div>
          
          <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-border">
            <div className="text-xs font-medium mb-1 flex items-center">
              <Bell size={12} className="mr-1 text-purple-500" /> Price Alert
            </div>
            
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <DollarSign className="h-3 w-3 absolute left-2 top-1.5 text-muted-foreground" />
                <Input type="number" placeholder="Target price" value={newAlertPrice} onChange={e => {
                setNewAlertPrice(e.target.value);
                setPriceError(null);
              }} className={cn("text-xs h-7 pl-7 rounded-md", priceError ? "border-red-500" : "")} />
              </div>
              <Switch checked={newAlertEnabled} onCheckedChange={checked => {
              setNewAlertEnabled(checked);
              if (checked && (!newAlertPrice || parseFloat(newAlertPrice) <= 0)) {
                setPriceError("Please enter a valid target price");
              } else {
                setPriceError(null);
              }
            }} className="scale-75 bg-zinc-950 hover:bg-zinc-800" />
            </div>
            
            {priceError && <div className="text-xs text-red-500">
                {priceError}
              </div>}
          
            <div className="flex items-center justify-between mt-2">
              <Button variant="outline" size="sm" onClick={handleRemoveProduct} disabled={isUpdating} className="h-7 px-2 text-xs rounded-md border-red-300 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20">
                <Trash2 size={12} className="mr-1 text-red-500" /> Remove
              </Button>
              
              <Button size="sm" onClick={handleSaveAlert} disabled={isUpdating} className="h-7 px-2 text-xs bg-[#000000e6] hover:bg-black text-white rounded-md">
                Save Alert
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>;
};
export default ProductCard;