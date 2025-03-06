
import { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Json } from "@/integrations/supabase/types";

export interface ComparedProduct {
  id: string;
  asin: string;
  title: string;
  description?: string | null;
  image_url?: string | null;
  current_price?: number | null;
  original_price?: number | null;
  url?: string | null;
  availability?: string | null;
  about_product?: string[] | null;
  product_information?: Record<string, string> | null;
  product_details?: Record<string, string> | null;
  rating?: number | null;
  review_count?: number | null;
}

export interface ComparisonHistory {
  id: string;
  name: string;
  created_at: string;
  products: ComparedProduct[];
}

interface ComparisonContextType {
  comparedProducts: ComparedProduct[];
  comparisonHistory: ComparisonHistory[];
  addToCompare: (product: ComparedProduct) => void;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
  isInCompare: (productId: string) => boolean;
  saveComparison: (name: string) => Promise<void>;
  loadComparisonHistory: () => Promise<void>;
  loadComparisonById: (id: string) => Promise<void>;
  deleteComparisonHistory: (id: string) => Promise<void>;
}

const STORAGE_KEY = "camelComparedProducts";

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

// Helper function to safely parse JSON fields and convert them to expected types
const parseJsonField = <T,>(jsonData: Json | null, defaultValue: T): T => {
  if (jsonData === null) return defaultValue;
  
  if (typeof jsonData === 'string') {
    try {
      return JSON.parse(jsonData) as T;
    } catch (e) {
      console.warn('Failed to parse JSON string:', e);
      return defaultValue;
    }
  }
  
  return jsonData as unknown as T;
};

export const ComparisonProvider = ({ children }: { children: ReactNode }) => {
  const [comparedProducts, setComparedProducts] = useState<ComparedProduct[]>([]);
  const [comparisonHistory, setComparisonHistory] = useState<ComparisonHistory[]>([]);

  // Load compared products from localStorage on initial render
  useEffect(() => {
    const savedProducts = localStorage.getItem(STORAGE_KEY);
    if (savedProducts) {
      try {
        const parsed = JSON.parse(savedProducts);
        if (Array.isArray(parsed)) {
          setComparedProducts(parsed);
        }
      } catch (error) {
        console.error("Error parsing saved comparison products:", error);
      }
    }
  }, []);

  // Save to localStorage whenever comparedProducts changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(comparedProducts));
  }, [comparedProducts]);

  const addToCompare = async (product: ComparedProduct) => {
    // Check if product is valid and has an id
    if (!product || !product.id) {
      console.error("Invalid product object:", product);
      toast.error("Cannot add an invalid product to comparison");
      return;
    }

    if (comparedProducts.length >= 4) {
      toast.error("You can compare up to 4 products");
      return;
    }
    
    if (comparedProducts.some(p => p.id === product.id)) {
      toast.info("Product already in comparison");
      return;
    }

    // Fetch complete product info if product_information is missing
    let enhancedProduct = { ...product };
    if (!product.product_information || !product.about_product || !product.product_details) {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("id", product.id)
          .single();

        if (!error && data) {
          enhancedProduct = {
            ...product,
            about_product: parseJsonField<string[]>(data.about_product, []),
            product_information: parseJsonField<Record<string, string>>(data.product_information, {}),
            product_details: parseJsonField<Record<string, string>>(data.product_details, {})
          };
        }
      } catch (error) {
        console.error("Error fetching complete product details:", error);
      }
    }
    
    setComparedProducts(prev => [...prev, enhancedProduct]);
    toast.success("Added to comparison");
  };

  const removeFromCompare = (productId: string) => {
    if (!productId) {
      console.error("Invalid product ID for removal:", productId);
      return;
    }
    
    setComparedProducts(prev => prev.filter(p => p.id !== productId));
    toast.info("Removed from comparison");
  };

  const clearCompare = () => {
    setComparedProducts([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const isInCompare = (productId: string) => {
    if (!productId) {
      console.error("Invalid product ID for comparison check:", productId);
      return false;
    }
    
    return comparedProducts.some(p => p.id === productId);
  };

  const saveComparison = async (name: string) => {
    try {
      if (comparedProducts.length === 0) {
        toast.error("No products to save for comparison");
        return;
      }

      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        toast.error("You need to be logged in to save comparisons");
        return;
      }

      // Convert ComparedProduct[] to a JSON-serializable format
      const productsJson = JSON.parse(JSON.stringify(comparedProducts)) as Json;

      const { error } = await supabase
        .from("comparison_history")
        .insert({
          user_id: userData.user.id,
          name: name,
          products: productsJson
        });

      if (error) throw error;
      
      toast.success("Comparison saved successfully");
      loadComparisonHistory();
    } catch (error: any) {
      console.error("Error saving comparison:", error);
      toast.error("Failed to save comparison");
    }
  };

  const loadComparisonHistory = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return;

      const { data, error } = await supabase
        .from("comparison_history")
        .select("*")
        .eq("user_id", userData.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        // Convert the Json products to ComparedProduct[] with proper parsing
        const typedHistory: ComparisonHistory[] = data.map(item => ({
          id: item.id,
          name: item.name,
          created_at: item.created_at,
          products: parseJsonField<ComparedProduct[]>(item.products, [])
        }));
        
        setComparisonHistory(typedHistory);
      }
    } catch (error: any) {
      console.error("Error loading comparison history:", error);
    }
  };

  const loadComparisonById = async (id: string) => {
    try {
      if (!id) {
        console.error("Invalid comparison ID:", id);
        toast.error("Cannot load comparison with invalid ID");
        return;
      }

      const { data, error } = await supabase
        .from("comparison_history")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      
      if (data && data.products) {
        try {
          // Convert Json to ComparedProduct[] with proper type handling
          const products = parseJsonField<ComparedProduct[]>(data.products, []);
          
          // Validate that all products have the required properties
          const validProducts = products.filter(product => 
            product && typeof product === 'object' && product.id && product.asin && product.title
          );
          
          // Enhance products with additional information if needed
          const enhancedProducts: ComparedProduct[] = await Promise.all(
            validProducts.map(async (product) => {
              if (!product.product_information || !product.about_product || !product.product_details) {
                try {
                  const { data, error } = await supabase
                    .from("products")
                    .select("*")
                    .eq("id", product.id)
                    .single();

                  if (!error && data) {
                    return {
                      ...product,
                      about_product: parseJsonField<string[]>(data.about_product, []),
                      product_information: parseJsonField<Record<string, string>>(data.product_information, {}),
                      product_details: parseJsonField<Record<string, string>>(data.product_details, {})
                    };
                  }
                } catch (err) {
                  console.error("Error fetching product details:", err);
                }
              }
              return product;
            })
          );
          
          if (validProducts.length !== products.length) {
            console.warn("Some products were filtered out due to invalid data");
          }
          
          setComparedProducts(enhancedProducts);
          toast.success("Comparison loaded");
        } catch (parseError) {
          console.error("Error parsing products data:", parseError);
          toast.error("Failed to parse comparison data");
        }
      } else {
        toast.error("No comparison found with the given ID");
      }
    } catch (error: any) {
      console.error("Error loading comparison:", error);
      toast.error("Failed to load comparison");
    }
  };

  const deleteComparisonHistory = async (id: string) => {
    try {
      if (!id) {
        console.error("Invalid comparison ID for deletion:", id);
        toast.error("Cannot delete comparison with invalid ID");
        return;
      }

      const { error } = await supabase
        .from("comparison_history")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      setComparisonHistory(prev => prev.filter(c => c.id !== id));
      toast.success("Comparison deleted");
    } catch (error: any) {
      console.error("Error deleting comparison:", error);
      toast.error("Failed to delete comparison");
    }
  };

  // Load comparison history when user logs in
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        loadComparisonHistory();
      }
    };
    
    checkUser();
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        loadComparisonHistory();
      } else if (event === "SIGNED_OUT") {
        setComparisonHistory([]);
      }
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <ComparisonContext.Provider
      value={{
        comparedProducts,
        comparisonHistory,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isInCompare,
        saveComparison,
        loadComparisonHistory,
        loadComparisonById,
        deleteComparisonHistory
      }}
    >
      {children}
    </ComparisonContext.Provider>
  );
};

export const useComparison = () => {
  const context = useContext(ComparisonContext);
  if (context === undefined) {
    throw new Error("useComparison must be used within a ComparisonProvider");
  }
  return context;
};
