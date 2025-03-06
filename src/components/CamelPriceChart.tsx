
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, ExternalLink } from "lucide-react";

interface CamelPriceChartProps {
  asin: string;
}

const CamelPriceChart = ({ asin }: CamelPriceChartProps) => {
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [timestamp, setTimestamp] = useState(Date.now());
  
  // Base URL for the chart without timestamp
  const baseChartUrl = `https://charts.camelcamelcamel.com/us/${asin}/amazon.png?force=1&zero=0&w=1022&h=529&desired=false&legend=1&ilt=1&tp=all&fo=0&lang=en`;
  
  // URL with timestamp for cache busting
  const chartUrl = `${baseChartUrl}&t=${timestamp}`;
  
  // Direct link to CamelCamelCamel product page
  const camelProductUrl = `https://camelcamelcamel.com/product/${asin}`;
  
  useEffect(() => {
    // When the component mounts, attempt to load the image
    handleRetry();
  }, [asin]);
  
  const handleRetry = () => {
    setLoading(true);
    setImageError(false);
    setTimestamp(Date.now()); // Force a cache-bust with a new timestamp
    
    // Create a new image object to preload the image
    const img = new Image();
    
    // Try with anonymous crossorigin to allow the image to load
    img.crossOrigin = "anonymous";
    
    img.onload = () => {
      console.log("CamelCamelCamel chart loaded successfully");
      setLoading(false);
    };
    
    img.onerror = () => {
      console.error("Failed to load CamelCamelCamel chart for ASIN:", asin);
      setLoading(false);
      setImageError(true);
    };
    
    img.src = chartUrl;
  };
  
  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-60">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : imageError ? (
          <div className="flex flex-col items-center justify-center h-60 p-6 text-center">
            <p className="text-muted-foreground mb-4">
              Price history chart from CamelCamelCamel is unavailable in the app due to cross-origin restrictions
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="outline" onClick={handleRetry}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
              <Button onClick={() => window.open(camelProductUrl, "_blank")}>
                <ExternalLink className="h-4 w-4 mr-2" />
                View on CamelCamelCamel
              </Button>
            </div>
          </div>
        ) : (
          <div className="relative">
            {/* Use the img tag with referrerPolicy to try to bypass restrictions */}
            <img
              src={chartUrl}
              alt={`Price history chart for ${asin}`}
              className="w-full h-auto"
              referrerPolicy="no-referrer"
              onError={() => {
                console.error("Image error occurred for ASIN:", asin);
                setImageError(true);
              }}
            />
            <div className="absolute bottom-2 right-2 text-xs text-muted-foreground opacity-70">
              Data from CamelCamelCamel
            </div>
          </div>
        )}
      </Card>
      
      <div className="text-xs text-muted-foreground">
        <p>This chart shows the price history of this product on Amazon over time.</p>
        <p className="mt-1">
          <a href={camelProductUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center">
            View complete price history
            <ExternalLink className="h-3 w-3 ml-1" />
          </a>
        </p>
      </div>
    </div>
  );
};

export default CamelPriceChart;
