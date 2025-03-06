import { useState } from "react";
import { useComparison, ComparedProduct } from "@/contexts/ComparisonContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { GitCompare, Save, ExternalLink as ExternalLinkIcon, TrashIcon, AlertCircle, Bookmark, ChevronLeft, PlusCircle, Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

const PriceAlertSection = ({ product }: { product: ComparedProduct }) => {
  const [alertPrice, setAlertPrice] = useState<string>("");
  const [alertEnabled, setAlertEnabled] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  
  const handleSetAlert = async () => {
    try {
      setLoading(true);
      
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        toast.error("You need to be logged in to set price alerts");
        return;
      }
      
      const parsedPrice = parseFloat(alertPrice);
      if (isNaN(parsedPrice) || parsedPrice <= 0) {
        toast.error("Please enter a valid price");
        return;
      }
      
      const { data: existingUserProduct } = await supabase
        .from("user_products")
        .select("id")
        .eq("user_id", session.session.user.id)
        .eq("product_id", product.id)
        .maybeSingle();
      
      if (existingUserProduct) {
        const { error } = await supabase
          .from("user_products")
          .update({
            alert_price: parsedPrice,
            alert_enabled: true
          })
          .eq("id", existingUserProduct.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("user_products")
          .insert({
            user_id: session.session.user.id,
            product_id: product.id,
            alert_price: parsedPrice,
            alert_enabled: true
          });
        
        if (error) throw error;
      }
      
      setAlertEnabled(true);
      toast.success("Price alert set successfully");
    } catch (error: any) {
      console.error("Error setting price alert:", error);
      toast.error(error.message || "Failed to set price alert");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="mt-2 space-y-2">
      <div className="text-sm font-medium flex items-center mb-1">
        <AlertCircle size={14} className="mr-1" />
        Set Price Alert
      </div>
      
      {alertEnabled ? (
        <div className="text-xs text-green-600 flex items-center">
          <Check size={14} className="mr-1" />
          Alert set at ${alertPrice}
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Target price"
            value={alertPrice}
            onChange={(e) => setAlertPrice(e.target.value)}
            className="h-8 text-xs"
          />
          <Button 
            size="sm" 
            className="h-8 px-2"
            onClick={handleSetAlert}
            disabled={loading}
          >
            {loading ? "Setting..." : "Set"}
          </Button>
        </div>
      )}
    </div>
  );
};

const ComparePage = () => {
  const { 
    comparedProducts, 
    removeFromCompare, 
    clearCompare, 
    saveComparison, 
    comparisonHistory,
    loadComparisonById,
    deleteComparisonHistory
  } = useComparison();
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [comparisonName, setComparisonName] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

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
    const discount = ((original - current) / original) * 100;
    return Math.round(discount);
  };

  const renderObjectProperties = (obj: Record<string, any> | null | undefined) => {
    if (!obj) {
      return <span className="text-muted-foreground text-sm">No information available</span>;
    }
    
    let entries: [string, any][] = [];
    
    if (typeof obj === 'string') {
      try {
        const parsed = JSON.parse(obj);
        if (typeof parsed === 'object' && !Array.isArray(parsed)) {
          entries = Object.entries(parsed);
        }
      } catch (e) {
        return <span>{obj}</span>;
      }
    } else if (typeof obj === 'object' && !Array.isArray(obj)) {
      entries = Object.entries(obj);
    } else if (Array.isArray(obj)) {
      return (
        <div className="space-y-2">
          {obj.map((item, idx) => (
            <div key={idx} className="border-b pb-2">
              <span className="text-sm">{typeof item === 'object' ? JSON.stringify(item) : String(item)}</span>
            </div>
          ))}
        </div>
      );
    }
    
    entries = entries.filter(([_, value]) => 
      value !== null && value !== undefined && value !== ''
    );
    
    if (entries.length === 0) {
      return <span className="text-muted-foreground text-sm">No information available</span>;
    }
    
    return (
      <div className="space-y-3">
        {entries.map(([key, value], idx) => (
          <div key={idx} className="border-b pb-2 last:border-b-0">
            <span className="font-medium block capitalize text-sm">{key.replace(/_/g, ' ')}</span>
            <span className="text-sm">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderAboutProduct = (about: string[] | null | undefined) => {
    if (!about) {
      return <span className="text-muted-foreground text-sm">No information available</span>;
    }
    
    let aboutArray: string[] = [];
    
    if (typeof about === 'string') {
      try {
        const parsed = JSON.parse(about);
        if (Array.isArray(parsed)) {
          aboutArray = parsed;
        } else {
          aboutArray = [String(parsed)];
        }
      } catch (e) {
        aboutArray = [about];
      }
    } else if (Array.isArray(about)) {
      aboutArray = about.map(item => typeof item === 'string' ? item : JSON.stringify(item));
    }
    
    if (aboutArray.length === 0) {
      return <span className="text-muted-foreground text-sm">No information available</span>;
    }
    
    return (
      <div className="space-y-2">
        <ul className="list-disc list-inside text-sm space-y-1">
          {aboutArray.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      </div>
    );
  };

  const handleSaveComparison = async () => {
    if (!comparisonName.trim()) {
      toast.error("Please enter a name for this comparison");
      return;
    }

    try {
      setSaveLoading(true);
      await saveComparison(comparisonName);
      setShowSaveDialog(false);
      setComparisonName("");
    } catch (error) {
      console.error("Error saving comparison:", error);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleRemoveProduct = (id: string) => {
    removeFromCompare(id);
  };

  const handleViewProduct = (asin: string) => {
    navigate(`/product/${asin}`);
  };

  const handleLoadComparison = async (id: string) => {
    await loadComparisonById(id);
  };

  const handleDeleteComparison = async (id: string) => {
    await deleteComparisonHistory(id);
  };

  const processProductData = (product: ComparedProduct) => {
    const processedProduct = { ...product };
    
    if (product.product_information) {
      if (typeof product.product_information === 'string') {
        try {
          processedProduct.product_information = JSON.parse(product.product_information);
        } catch (e) {
          console.warn("Failed to parse product_information string:", e);
        }
      }
    }
    
    if (product.about_product) {
      if (typeof product.about_product === 'string') {
        try {
          processedProduct.about_product = JSON.parse(product.about_product);
        } catch (e) {
          processedProduct.about_product = [product.about_product];
        }
      }
    }
    
    if (product.product_details) {
      if (typeof product.product_details === 'string') {
        try {
          processedProduct.product_details = JSON.parse(product.product_details);
        } catch (e) {
          console.warn("Failed to parse product_details string:", e);
        }
      }
    }
    
    return processedProduct;
  };

  const processedProducts = comparedProducts.map(processProductData);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-4">
        <Button 
          variant="outline" 
          className="mb-2"
          onClick={() => navigate("/dashboard")}
        >
          <ChevronLeft size={16} className="mr-1" />
          Back to Dashboard
        </Button>
        <p className="text-xs text-muted-foreground">
          Note: This service currently supports Amazon.com only. Amazon.in support coming soon.
        </p>
      </div>
      
      <Tabs defaultValue="compare">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Product Comparison</h1>
          <TabsList>
            <TabsTrigger value="compare">Compare</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="compare">
          {processedProducts.length === 0 ? (
            <div className="text-center py-12">
              <GitCompare size={48} className="mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">No Products to Compare</h2>
              <p className="text-muted-foreground mb-4">
                Add products to comparison from product pages or search results.
              </p>
              <Button onClick={() => navigate("/dashboard")}>
                Browse Products
              </Button>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <Badge variant="outline" className="mr-2">
                    {processedProducts.length} {processedProducts.length === 1 ? "product" : "products"}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => clearCompare()}
                  >
                    Clear All
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => setShowSaveDialog(true)}
                    disabled={processedProducts.length === 0}
                  >
                    <Save size={16} className="mr-1" />
                    Save Comparison
                  </Button>
                </div>
              </div>

              <div className="responsive-table">
                <Table className="w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[150px] min-w-[120px]">Feature</TableHead>
                      {processedProducts.map((product) => (
                        <TableHead key={product.id} className={isMobile ? "min-w-[150px] w-1/2" : "min-w-[200px]"}>
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-bold">{product.title.substring(0, 30)}...</span>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 w-6 p-0"
                              onClick={() => handleRemoveProduct(product.id)}
                            >
                              <X size={14} />
                            </Button>
                          </div>
                          <div className="aspect-w-1 aspect-h-1 w-full mb-2">
                            <img 
                              src={product.image_url || '/placeholder.svg'} 
                              alt={product.title}
                              className="object-contain h-32 w-full"
                            />
                          </div>
                          <div className="flex justify-between">
                            <Button 
                              variant="outline"
                              size="sm"
                              className="text-xs"
                              onClick={() => handleViewProduct(product.asin)}
                            >
                              <ExternalLinkIcon size={12} className="mr-1" />
                              View
                            </Button>
                            <Button 
                              variant="outline"
                              size="sm"
                              className="text-xs"
                              onClick={() => window.open(product.url || '', '_blank')}
                            >
                              Amazon
                            </Button>
                          </div>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Price</TableCell>
                      {processedProducts.map((product) => (
                        <TableCell key={`${product.id}-price`}>
                          <div className="font-bold text-lg">
                            {formatPrice(product.current_price)}
                          </div>
                          {product.original_price && product.original_price > (product.current_price || 0) && (
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground line-through">
                                {formatPrice(product.original_price)}
                              </span>
                              <Badge variant="secondary" className="text-xs">
                                {calculateDiscount(product.original_price, product.current_price)}% off
                              </Badge>
                            </div>
                          )}
                          
                          <PriceAlertSection product={product} />
                        </TableCell>
                      ))}
                    </TableRow>
                    
                    <TableRow>
                      <TableCell className="font-medium">Availability</TableCell>
                      {processedProducts.map((product) => (
                        <TableCell key={`${product.id}-availability`}>
                          {product.availability ? (
                            <Badge variant={product.availability.toLowerCase().includes("in stock") ? "secondary" : "outline"} className={product.availability.toLowerCase().includes("in stock") ? "bg-green-100 text-green-800 hover:bg-green-200" : ""}>
                              {product.availability}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">Unknown</span>
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                    
                    <TableRow>
                      <TableCell className="font-medium">Description</TableCell>
                      {processedProducts.map((product) => (
                        <TableCell key={`${product.id}-description`}>
                          <div className="text-sm">
                            {product.description ? 
                              product.description.substring(0, 200) + (product.description.length > 200 ? '...' : '') 
                              : <span className="text-muted-foreground">No description available</span>}
                          </div>
                        </TableCell>
                      ))}
                    </TableRow>

                    <TableRow>
                      <TableCell className="font-medium">Features</TableCell>
                      {processedProducts.map((product) => (
                        <TableCell key={`${product.id}-features`} className="min-w-[250px]">
                          {renderAboutProduct(product.about_product)}
                        </TableCell>
                      ))}
                    </TableRow>

                    <TableRow>
                      <TableCell className="font-medium">Information</TableCell>
                      {processedProducts.map((product) => (
                        <TableCell key={`${product.id}-info`} className="min-w-[250px]">
                          {renderObjectProperties(product.product_information)}
                        </TableCell>
                      ))}
                    </TableRow>

                    <TableRow>
                      <TableCell className="font-medium">Details</TableCell>
                      {processedProducts.map((product) => (
                        <TableCell key={`${product.id}-details`} className="min-w-[250px]">
                          {renderObjectProperties(product.product_details)}
                        </TableCell>
                      ))}
                    </TableRow>

                    <TableRow>
                      <TableCell className="font-medium">Rating</TableCell>
                      {processedProducts.map((product) => (
                        <TableCell key={`${product.id}-rating`}>
                          {product.rating ? (
                            <div className="flex items-center">
                              <span className="text-amber-500 font-bold">{product.rating}</span>
                              <span className="text-muted-foreground text-sm ml-1">/ 5</span>
                              {product.review_count && (
                                <span className="text-muted-foreground text-xs ml-2">
                                  ({product.review_count} reviews)
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">No rating available</span>
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="history">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {comparisonHistory.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Bookmark size={48} className="mx-auto text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">No Saved Comparisons</h2>
                <p className="text-muted-foreground mb-4">
                  Your saved product comparisons will appear here.
                </p>
              </div>
            ) : (
              comparisonHistory.map((comparison) => (
                <Card key={comparison.id}>
                  <CardHeader>
                    <CardTitle>{comparison.name}</CardTitle>
                    <CardDescription>
                      {formatDistanceToNow(new Date(comparison.created_at), { addSuffix: true })}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {(comparison.products as ComparedProduct[]).map((product) => (
                        <Badge variant="outline" key={product.id}>
                          {product.title.substring(0, 20)}...
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex justify-between">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeleteComparison(comparison.id)}
                    >
                      <TrashIcon size={14} className="mr-1" />
                      Delete
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => handleLoadComparison(comparison.id)}
                    >
                      <GitCompare size={14} className="mr-1" />
                      Load
                    </Button>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Comparison</DialogTitle>
            <DialogDescription>
              Give this comparison a name to save it for future reference.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Comparison Name</Label>
              <Input
                id="name"
                placeholder="e.g., Gaming Laptops Comparison"
                value={comparisonName}
                onChange={(e) => setComparisonName(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowSaveDialog(false)} 
              disabled={saveLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveComparison} 
              disabled={saveLoading || !comparisonName.trim()}
            >
              {saveLoading ? "Saving..." : "Save Comparison"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ComparePage;
