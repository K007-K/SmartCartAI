import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, ShoppingCart, Bell, BellOff, Share2, Bookmark, BookmarkCheck, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import PriceHistoryChart from "@/components/PriceHistoryChart";
import ProductChatbot from "@/components/ProductChatbot";
import SentimentAnalysis from "@/components/SentimentAnalysis";
import CompareButton from "@/components/CompareButton";
import { useComparison } from "@/contexts/ComparisonContext";
import { Json } from "@/integrations/supabase/types";
interface Product {
  id?: string;
  asin: string;
  title: string;
  description?: string | null;
  image_url?: string | null;
  current_price?: number | null;
  original_price?: number | null;
  url?: string | null;
  availability?: string | null;
  customers_say?: string | null;
  about_product?: string[] | null;
  product_information?: Record<string, string> | null;
  product_details?: Record<string, string> | null;
}
const ProductDetail = () => {
  const {
    asin
  } = useParams<{
    asin: string;
  }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [watchlistLoading, setWatchlistLoading] = useState(false);
  const [alertPrice, setAlertPrice] = useState<string>("");
  const [alertEnabled, setAlertEnabled] = useState<boolean>(false);
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [alerts, setAlerts] = useState<{
    price: number;
    enabled: boolean;
  } | null>(null);
  const {
    addToCompare
  } = useComparison();
  const [priceInputRef, setPriceInputRef] = useState<HTMLInputElement | null>(null);
  useEffect(() => {
    if (asin) {
      fetchProductDetails();
    }
  }, [asin]);
  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const {
        data: session
      } = await supabase.auth.getSession();
      const token = session?.session?.access_token;
      if (!token) {
        toast.error("Please log in to view product details");
        navigate("/auth");
        return;
      }
      const {
        data: existingProduct,
        error: dbError
      } = await supabase.from("products").select("*").eq("asin", asin).maybeSingle();
      const now = new Date();
      const isFresh = existingProduct && existingProduct.updated_at && now.getTime() - new Date(existingProduct.updated_at).getTime() < 24 * 60 * 60 * 1000;
      if (isFresh) {
        const formattedProduct: Product = {
          ...existingProduct,
          about_product: Array.isArray(existingProduct.about_product) ? existingProduct.about_product : typeof existingProduct.about_product === 'string' ? JSON.parse(existingProduct.about_product) : [],
          product_information: existingProduct.product_information ? typeof existingProduct.product_information === 'string' ? JSON.parse(existingProduct.product_information) : existingProduct.product_information as Record<string, string> : {},
          product_details: existingProduct.product_details ? typeof existingProduct.product_details === 'string' ? JSON.parse(existingProduct.product_details) : existingProduct.product_details as Record<string, string> : {}
        };
        setProduct(formattedProduct);
        await checkWatchlistStatus(existingProduct.id);
        setLoading(false);
        await saveProduct(existingProduct, true);
        return;
      }
      try {
        const response = await supabase.functions.invoke("amazon-product-details", {
          body: {
            asin,
            country: "US"
          }
        });
        if (response.error) {
          throw new Error(`Amazon API error: ${response.error.message}`);
        }
        if (!response.data || !response.data.product) {
          throw new Error("No product data returned");
        }
        const productData = response.data.product;
        console.log("Saving product to database via edge function");
        const saveResponse = await supabase.functions.invoke("save-product", {
          body: {
            productData,
            recordView: true
          },
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (saveResponse.error) {
          console.error("Error saving product via edge function:", saveResponse.error);
          throw new Error(`Failed to save product: ${saveResponse.error.message}`);
        }
        if (!saveResponse.data || !saveResponse.data.productId) {
          console.error("No product ID returned from save-product function");
          throw new Error("Failed to get product ID after save");
        }
        const productWithId: Product = {
          ...productData,
          id: saveResponse.data.productId,
          about_product: Array.isArray(productData.about_product) ? productData.about_product : typeof productData.about_product === 'string' ? JSON.parse(productData.about_product) : [],
          product_information: productData.product_information ? typeof productData.product_information === 'string' ? JSON.parse(productData.product_information) : productData.product_information as Record<string, string> : {},
          product_details: productData.product_details ? typeof productData.product_details === 'string' ? JSON.parse(productData.product_details) : productData.product_details as Record<string, string> : {}
        };
        setProduct(productWithId);
        await checkWatchlistStatus(saveResponse.data.productId);
        setTimeout(() => fetchAdditionalInsights(productData.asin), 1000);
      } catch (fetchError) {
        console.error("Error fetching from Supabase function:", fetchError);
        throw new Error(`Failed to fetch product details: ${fetchError.message}`);
      }
    } catch (error: any) {
      console.error("Error fetching product details:", error);
      toast.error(error.message || "Failed to load product details");
    } finally {
      setLoading(false);
    }
  };
  const saveProduct = async (productData: any, recordView: boolean = false) => {
    try {
      const {
        data: session
      } = await supabase.auth.getSession();
      if (!session?.session?.access_token) return;
      await supabase.functions.invoke("save-product", {
        body: {
          productData,
          recordView
        },
        headers: {
          Authorization: `Bearer ${session.session.access_token}`
        }
      });
      return true;
    } catch (error) {
      console.error("Error saving product:", error);
      return false;
    }
  };
  const fetchAdditionalInsights = async (productAsin: string) => {
    try {
      await supabase.functions.invoke("update-product-insights", {
        body: {
          asin: productAsin
        }
      });
    } catch (error) {
      console.error("Error fetching additional insights:", error);
    }
  };
  const saveRecentlyViewed = async (product: Product) => {
    try {
      if (!product.id) return;
      const {
        data: session
      } = await supabase.auth.getSession();
      if (!session?.session) return;
      const {
        data: existingView
      } = await supabase.from("recently_viewed").select("id").eq("user_id", session.session.user.id).eq("product_id", product.id).maybeSingle();
      if (existingView) {
        await supabase.from("recently_viewed").update({
          viewed_at: new Date().toISOString()
        }).eq("id", existingView.id);
      } else {
        await supabase.from("recently_viewed").insert({
          user_id: session.session.user.id,
          product_id: product.id,
          viewed_at: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error("Error saving recently viewed:", error);
    }
  };
  const checkWatchlistStatus = async (productId: string) => {
    try {
      const {
        data: session
      } = await supabase.auth.getSession();
      if (!session?.session) return;
      const {
        data,
        error
      } = await supabase.from("user_products").select("alert_price, alert_enabled").eq("user_id", session.session.user.id).eq("product_id", productId).maybeSingle();
      if (error) throw error;
      if (data) {
        setIsInWatchlist(true);
        setAlerts({
          price: data.alert_price || 0,
          enabled: data.alert_enabled || false
        });
        setAlertEnabled(data.alert_enabled || false);
        setAlertPrice(data.alert_price ? String(data.alert_price) : "");
      } else {
        setIsInWatchlist(false);
        setAlerts(null);
      }
    } catch (error) {
      console.error("Error checking watchlist status:", error);
    }
  };
  const toggleWatchlist = async () => {
    try {
      if (!product?.id) return;
      setWatchlistLoading(true);
      const {
        data: session
      } = await supabase.auth.getSession();
      if (!session?.session) {
        toast.error("Please log in to add products to your watchlist");
        navigate("/auth");
        return;
      }
      if (isInWatchlist) {
        const {
          error
        } = await supabase.from("user_products").delete().eq("user_id", session.session.user.id).eq("product_id", product.id);
        if (error) throw error;
        setIsInWatchlist(false);
        setAlerts(null);
        toast.success("Removed from watchlist");
      } else {
        const {
          error
        } = await supabase.from("user_products").insert({
          user_id: session.session.user.id,
          product_id: product.id,
          alert_enabled: false,
          alert_price: null
        });
        if (error) throw error;
        setIsInWatchlist(true);
        setAlerts({
          price: 0,
          enabled: false
        });
        toast.success("Added to watchlist");
      }
    } catch (error: any) {
      console.error("Error toggling watchlist:", error);
      toast.error(error.message || "Failed to update watchlist");
    } finally {
      setWatchlistLoading(false);
    }
  };
  const handleAddToCompare = () => {
    if (product && product.id) {
      const compareProduct = {
        ...product,
        id: product.id
      };
      addToCompare(compareProduct);
    } else {
      toast.error("Cannot add product to comparison without an ID");
    }
  };
  const handleGoBack = () => {
    navigate('/dashboard');
  };
  const formatPrice = (price: number | null | undefined) => {
    if (price === undefined || price === null) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2
    }).format(price);
  };
  const calculateDiscount = (original: number | null | undefined, current: number | null | undefined) => {
    if (!original || !current || original <= current) return null;
    const discount = (original - current) / original * 100;
    return Math.round(discount);
  };
  const renderProductInformation = () => {
    if (!product) return null;
    const hasAboutProduct = product.about_product && Array.isArray(product.about_product) && product.about_product.length > 0;
    const hasProductInfo = product.product_information && Object.keys(product.product_information).length > 0;
    const hasProductDetails = product.product_details && Object.keys(product.product_details).length > 0;
    if (!hasAboutProduct && !hasProductInfo && !hasProductDetails) {
      return <p className="text-muted-foreground">No detailed information available.</p>;
    }
    return <div className="space-y-6">
        {hasAboutProduct && <div className="space-y-2">
            <h3 className="text-lg font-bold">About This Product</h3>
            <ul className="list-disc list-inside space-y-1">
              {product.about_product.map((item: string, index: number) => <li key={index} className="text-sm">{item}</li>)}
            </ul>
          </div>}
        
        {hasProductInfo && <div className="space-y-2">
            <h3 className="text-lg font-bold">Product Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(product.product_information).map(([key, value], index) => <div key={index} className="border-b pb-2">
                  <div className="text-sm font-medium">{key}</div>
                  <div className="text-sm">{value as string}</div>
                </div>)}
            </div>
          </div>}
        
        {hasProductDetails && <div className="space-y-2">
            <h3 className="text-lg font-bold">Product Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(product.product_details).map(([key, value], index) => <div key={index} className="border-b pb-2">
                  <div className="text-sm font-medium">{key}</div>
                  <div className="text-sm">{value as string}</div>
                </div>)}
            </div>
          </div>}
      </div>;
  };
  const handleAddToWatchlist = () => {
    if (priceInputRef) {
      priceInputRef.focus();
      priceInputRef.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  };
  if (loading) {
    return <div className="container mx-auto py-12 px-4">
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>;
  }
  if (!product) {
    return <div className="container mx-auto py-12 px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
          <p className="mb-6">The product you're looking for could not be found.</p>
          <Button onClick={handleGoBack}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>;
  }
  return <div className="container mx-auto py-8 px-4 overflow-x-hidden">
      <Button variant="outline" className="mb-4" onClick={handleGoBack}>
        <ChevronLeft size={16} className="mr-1" />
        Back to Dashboard
      </Button>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-lg p-4 flex items-center justify-center">
          <img src={product?.image_url || '/placeholder.svg'} alt={product?.title} className="max-h-80 object-contain" />
        </div>
        
        <div>
          <h1 className="font-bold mb-2 text-base">{product?.title}</h1>
          
          <div className="flex flex-wrap gap-2 mb-6">
            <Badge variant="outline">{product?.asin}</Badge>
            {product?.availability && <Badge variant={product.availability.toLowerCase().includes("in stock") ? "secondary" : "outline"} className={product.availability.toLowerCase().includes("in stock") ? "bg-green-100 text-green-800 hover:bg-green-200" : ""}>
                {product.availability}
              </Badge>}
          </div>
          
          <div className="mb-6">
            <div className="text-3xl font-bold">
              {formatPrice(product?.current_price)}
            </div>
            
            {product?.original_price && product.original_price > (product.current_price || 0) && <div className="flex items-center gap-2 mt-1">
                <span className="text-muted-foreground line-through">
                  {formatPrice(product.original_price)}
                </span>
                <Badge variant="secondary">
                  {calculateDiscount(product.original_price, product.current_price)}% off
                </Badge>
              </div>}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
            <Button onClick={() => window.open(product?.url || '', '_blank')} className="w-full bg-zinc-950 hover:bg-zinc-800">
              <ShoppingCart size={16} className="mr-2" />
              Buy on Amazon
            </Button>
            
            <Button variant={isInWatchlist ? "default" : "outline"} className="w-full" onClick={toggleWatchlist} disabled={watchlistLoading}>
              {isInWatchlist ? <>
                  <BookmarkCheck size={16} className="mr-2" />
                  In Watchlist
                </> : <>
                  <Bookmark size={16} className="mr-2" />
                  Track & Monitor
                </>}
            </Button>
            
            {product?.id && <CompareButton product={{
            id: product.id,
            asin: product.asin,
            title: product.title,
            description: product.description,
            image_url: product.image_url,
            current_price: product.current_price,
            original_price: product.original_price,
            url: product.url,
            availability: product.availability
          }} variant="outline" size="default" className="w-full" />}
            
            <Button variant="outline" className="w-full" onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            toast.success("Link copied to clipboard");
          }}>
              <Share2 size={16} className="mr-2" />
              Share
            </Button>
          </div>
          
          <div className="mb-6 p-4 border rounded-lg">
            <h3 className="font-medium mb-2 flex items-center">
              {alertEnabled ? <>
                  <Bell size={16} className="mr-2 text-primary" />
                  Price Alert Active
                </> : <>
                  <BellOff size={16} className="mr-2 text-muted-foreground" />
                  Set Price Alert
                </>}
            </h3>
            
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <input type="number" className="w-full px-3 py-2 border rounded-md text-sm" placeholder="Target price" value={alertPrice} onChange={e => setAlertPrice(e.target.value)} ref={setPriceInputRef} />
              </div>
              
              <Button variant={alertEnabled ? "destructive" : "default"} className="w-full" onClick={async () => {
              try {
                if (!product || !product.id) {
                  toast.error("Product data is missing");
                  return;
                }
                const {
                  data: session
                } = await supabase.auth.getSession();
                if (!session?.session) {
                  toast.error("Please log in to set price alerts");
                  return;
                }
                if (alertEnabled) {
                  const {
                    error
                  } = await supabase.from("user_products").update({
                    alert_enabled: false
                  }).eq("user_id", session.session.user.id).eq("product_id", product.id);
                  if (error) throw error;
                  setAlertEnabled(false);
                  setAlerts(prev => prev ? {
                    ...prev,
                    enabled: false
                  } : null);
                  toast.success("Price alert disabled");
                } else {
                  const price = parseFloat(alertPrice);
                  if (isNaN(price) || price <= 0) {
                    toast.error("Please enter a valid price");
                    return;
                  }
                  if (!isInWatchlist) {
                    const {
                      error: insertError
                    } = await supabase.from("user_products").insert({
                      user_id: session.session.user.id,
                      product_id: product.id,
                      alert_price: price,
                      alert_enabled: true
                    });
                    if (insertError) throw insertError;
                  } else {
                    const {
                      error: updateError
                    } = await supabase.from("user_products").update({
                      alert_price: price,
                      alert_enabled: true
                    }).eq("user_id", session.session.user.id).eq("product_id", product.id);
                    if (updateError) throw updateError;
                  }
                  setIsInWatchlist(true);
                  setAlertEnabled(true);
                  setAlerts({
                    price,
                    enabled: true
                  });
                  toast.success("Price alert set");
                }
              } catch (error: any) {
                console.error("Error setting price alert:", error);
                toast.error(error.message || "Failed to set price alert");
              }
            }}>
                {alertEnabled ? "Disable" : "Set Alert"}
              </Button>
            </div>
            
            {alertEnabled ? <p className="text-xs text-muted-foreground mt-2">
                We'll notify you when the price drops below {formatPrice(parseFloat(alertPrice))}
              </p> : <p className="text-xs text-muted-foreground mt-2">
                Set a target price to track this product and get price alerts
              </p>}
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="details" className="w-full">
        <div className="mb-4 overflow-x-auto hide-scrollbar -mx-4 px-4">
          <TabsList className="w-auto inline-flex">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="price-history">Price History</TabsTrigger>
            <TabsTrigger value="ai-analysis">AI Analysis</TabsTrigger>
            <TabsTrigger value="chat" className="whitespace-nowrap">Ask Questions</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              {renderProductInformation()}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="price-history">
          <Card>
            <CardHeader>
              <CardTitle>Price Tracking</CardTitle>
              <CardDescription>
                {isInWatchlist && alertEnabled ? "Track how this product's price has changed over time" : "Add to watchlist with a target price to track price history"}
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              {product?.id && <PriceHistoryChart productId={product.id} asin={product.asin} isTracked={isInWatchlist && alertEnabled} onAddToWatchlist={handleAddToWatchlist} />}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="ai-analysis">
          <Card>
            <CardHeader>
              <CardTitle>AI Analysis</CardTitle>
              <CardDescription>
                What customers are saying about this product
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <SentimentAnalysis asin={product?.asin} customersSay={product?.customers_say} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="chat">
          <Card>
            <CardHeader>
              <CardTitle>Product Q&A</CardTitle>
              <CardDescription>
                Ask any questions about this product
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              {product?.id && <ProductChatbot productId={product.id} />}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>;
};
export default ProductDetail;