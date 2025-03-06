import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Search, Loader2, AlertCircle, Link as LinkIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";

// Function to extract ASIN from Amazon URLs
const extractAsin = (url: string): string | null => {
  const regex = /\/dp\/([A-Z0-9]{10})|\/(gp\/product|product)\/([A-Z0-9]{10})/i;
  const match = url.match(regex);
  if (match) {
    return match[1] || match[3] || null;
  }
  return null;
};

// Check if URL is from Amazon.com
const isAmazonComUrl = (url: string): boolean => {
  return url.includes('amazon.com');
};
interface ProductSearchProps {
  onProductSave: () => void;
}
const ProductSearch = ({
  onProductSave
}: ProductSearchProps) => {
  const navigate = useNavigate();
  const [asin, setAsin] = useState("");
  const [url, setUrl] = useState("");
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchType, setSearchType] = useState<"asin" | "url">("url");
  const isMobile = useIsMobile();
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    let searchAsin = "";
    if (searchType === "asin") {
      if (!asin.trim()) return;
      searchAsin = asin.trim();
    } else {
      if (!url.trim()) return;
      if (!isAmazonComUrl(url.trim())) {
        setError("Please enter only Amazon.com URLs. Other Amazon domains are not supported yet.");
        toast.error("URL must be from Amazon.com");
        return;
      }
      const extractedAsin = extractAsin(url.trim());
      if (!extractedAsin) {
        setError("Could not extract ASIN from URL. Please check the URL format.");
        toast.error("Invalid Amazon URL");
        return;
      }
      searchAsin = extractedAsin;
      toast.info(`Extracted ASIN: ${searchAsin}`);
    }
    try {
      setSearching(true);
      setError(null);
      const {
        data: session
      } = await supabase.auth.getSession();
      const token = session?.session?.access_token;
      if (!token) {
        toast.error("Authentication required");
        setError("You must be logged in to search for products");
        return;
      }
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      try {
        toast.info("Searching for product...");
        console.log("Making API request to Supabase Edge Function", {
          asin: searchAsin
        });
        const {
          data,
          error: funcError
        } = await supabase.functions.invoke("amazon-product-search", {
          body: {
            asin: searchAsin
          }
        });
        clearTimeout(timeoutId);
        if (funcError) {
          console.error("Supabase function error:", funcError);
          throw new Error(funcError.message || "Search failed. Please try again later.");
        }
        if (!data) {
          console.error("Empty response received from API");
          throw new Error("Empty response received from API");
        }
        if (!data.product) {
          toast.error("Product not found");
          throw new Error("Product not found. Please check the ASIN and try again.");
        }
        toast.success("Product found! Redirecting to details page...");
        navigate(`/product/${data.product.asin}`);
      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          throw new Error("Search request timed out. Please try again.");
        }
        throw fetchError;
      }
    } catch (error: any) {
      console.error("Search error:", error);
      setError(error.message || "Search failed. Please try again later.");
      toast.error("Search failed: " + (error.message || "Please try again later"));
    } finally {
      setSearching(false);
    }
  };
  return <div className="p-6 w-full overflow-hidden bg-white/20 backdrop-blur-sm rounded-xl border border-gray-100 shadow-sm">
      <h2 className="text-xl font-bold mb-4 text-center text-blue-950">Find Products to Track 🔍</h2>
      
      <Tabs defaultValue="url" onValueChange={value => setSearchType(value as "asin" | "url")} className="mb-6 w-full">
        <TabsList className="mb-4 w-full grid grid-cols-2 rounded-3xl">
          <TabsTrigger value="url" className="rounded-3xl">
            <LinkIcon className="h-4 w-4 mr-2" />
            {!isMobile ? "Search by URL" : ""}
          </TabsTrigger>
          <TabsTrigger value="asin" className="rounded-3xl">
            <Search className="h-4 w-4 mr-2" />
            {!isMobile ? "Search by ASIN" : ""}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="url">
          <form onSubmit={handleSearch}>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input placeholder="Enter Amazon product URL..." value={url} onChange={e => setUrl(e.target.value)} type="text" className="pr-10 rounded-3xl" />
                <Button type="submit" disabled={searching || !url.trim()} variant="ghost" size="icon" className="absolute right-0 top-0 h-full rounded-l-none text-blue-500">
                  {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
              </div>
              {!isMobile}
            </div>
            
          </form>
        </TabsContent>
        
        <TabsContent value="asin">
          <form onSubmit={handleSearch}>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input placeholder="Enter Amazon ASIN..." value={asin} onChange={e => setAsin(e.target.value)} type="text" className="pr-10 rounded-3xl" />
                <Button type="submit" disabled={searching || !asin.trim()} variant="ghost" size="icon" className="absolute right-0 top-0 h-full rounded-l-none text-blue-500">
                  {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
              </div>
              {!isMobile}
            </div>
          </form>
        </TabsContent>
      </Tabs>
      
      {error && <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>}
      
      {searching && <div className="flex flex-col items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Searching for product...</p>
        </div>}
    </div>;
};
export default ProductSearch;