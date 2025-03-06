
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { BookmarkPlus } from "lucide-react";

interface PriceHistoryProps {
  productId: string;
  asin: string;
  isTracked?: boolean;
  onAddToWatchlist?: () => void;
}

// Define price history item type
interface PriceHistoryItem {
  price: number;
  recorded_at: string;
}

const PriceHistoryChart = ({ productId, asin, isTracked = false, onAddToWatchlist }: PriceHistoryProps) => {
  const [loading, setLoading] = useState(true);
  const [priceHistory, setPriceHistory] = useState<any[]>([]);
  const [lowestPrice, setLowestPrice] = useState<number | null>(null);
  const [lowestDate, setLowestDate] = useState<string | null>(null);

  useEffect(() => {
    if (productId && asin && isTracked) {
      fetchPriceHistory();
    } else {
      setLoading(false);
    }
  }, [productId, asin, isTracked]);

  const fetchPriceHistory = async () => {
    try {
      setLoading(true);
      
      // First check if we have price history in our database
      const { data: dbPriceHistory, error } = await supabase
        .from("price_history")
        .select("price, recorded_at")
        .eq("product_id", productId)
        .order("recorded_at", { ascending: true });

      if (error) throw error;
      
      if (dbPriceHistory && dbPriceHistory.length > 1) {
        // Format data for chart
        const formattedData = dbPriceHistory.map(item => ({
          date: new Date(item.recorded_at).toLocaleDateString(),
          price: item.price
        }));
        
        setPriceHistory(formattedData);
        
        // Find lowest price
        const prices = dbPriceHistory.map(item => item.price);
        const minPrice = Math.min(...prices);
        setLowestPrice(minPrice);
        
        // Find date of lowest price
        const lowestPriceItem = dbPriceHistory.find(item => item.price === minPrice);
        if (lowestPriceItem) {
          setLowestDate(new Date(lowestPriceItem.recorded_at).toLocaleDateString());
        }
        
        setLoading(false);
        return;
      }
      
      // If not enough data points in database, use keepa-price-history edge function
      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token;

      if (!token) {
        toast.error("Authentication required");
        setLoading(false);
        return;
      }

      // Use supabase.functions.invoke instead of direct fetch
      const { data, error: funcError } = await supabase.functions.invoke("keepa-price-history", {
        body: { 
          asin,
          productId
        }
      });

      if (funcError) {
        console.error("Function error in fetchPriceHistory:", funcError);
        throw new Error("Failed to fetch price history: " + funcError.message);
      }
      
      if (data?.priceHistory) {
        setPriceHistory(data.priceHistory);
        setLowestPrice(data.lowestPrice);
        setLowestDate(data.lowestDate);
      }
    } catch (error: any) {
      console.error("Error fetching price history:", error.message);
      toast.error("Failed to load price history");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2
    }).format(price);
  };

  if (!isTracked) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
        <BookmarkPlus className="h-12 w-12 text-muted-foreground opacity-40" />
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Add to Watchlist to Track Prices</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Set a target price to add this product to your watchlist and view its price history.
            We'll track prices daily and alert you when it drops below your target.
          </p>
          {onAddToWatchlist && (
            <Button onClick={onAddToWatchlist} className="mt-4">
              Add to Watchlist
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-72 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {priceHistory.length > 1 ? (
        <>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={priceHistory}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickMargin={10}
                />
                <YAxis 
                  tickFormatter={(value) => `$${value}`}
                  tick={{ fontSize: 12 }}
                  tickMargin={10}
                />
                <Tooltip 
                  formatter={(value) => [`$${value}`, "Price"]}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#6366F1" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          {lowestPrice && lowestDate && (
            <div className="text-sm font-medium">
              Lowest recorded price: <span className="text-green-600">{formatPrice(lowestPrice)}</span> on {lowestDate}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-10 text-muted-foreground">
          {priceHistory.length === 1 
            ? "More price data points will appear as they are collected daily."
            : "No price history available yet. We'll track prices automatically."
          }
        </div>
      )}
    </div>
  );
};

export default PriceHistoryChart;
