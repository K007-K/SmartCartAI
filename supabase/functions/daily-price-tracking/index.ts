
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with the service role key for admin privileges
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase URL or Service Key");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Starting daily price tracking job");
    
    // Get all products that are being tracked (with alert_price set)
    const { data: trackedProducts, error: trackedError } = await supabase
      .from("user_products")
      .select(`
        product_id,
        products:product_id (id, asin, current_price)
      `)
      .not("alert_price", "is", null);
    
    if (trackedError) {
      console.error("Error fetching tracked products:", trackedError);
      throw trackedError;
    }
    
    console.log(`Found ${trackedProducts?.length || 0} tracked products to update`);
    
    // Get unique product IDs (remove duplicates)
    const uniqueProductIds = [...new Set(trackedProducts?.map(item => item.product_id) || [])];
    
    console.log(`Processing ${uniqueProductIds.length} unique products`);
    
    // Update each product's price and record price history
    const results = [];
    for (const productId of uniqueProductIds) {
      try {
        // Find the product in our tracked products array
        const productData = trackedProducts?.find(p => p.product_id === productId)?.products;
        
        if (!productData) {
          console.warn(`Product data not found for ID: ${productId}`);
          continue;
        }
        
        // Record current price in price history
        if (productData.current_price !== null) {
          const { data: historyRecord, error: historyError } = await supabase
            .from("price_history")
            .insert({
              product_id: productId,
              price: productData.current_price,
              recorded_at: new Date().toISOString()
            });
          
          if (historyError) {
            console.error(`Error recording price history for ${productId}:`, historyError);
            results.push({ productId, status: "error", error: historyError.message });
          } else {
            console.log(`Recorded current price ${productData.current_price} for product ${productId}`);
            results.push({ productId, status: "success" });
          }
        } else {
          console.warn(`No current price available for product ${productId}`);
          results.push({ productId, status: "skipped", reason: "no price available" });
        }
      } catch (err) {
        console.error(`Error processing product ${productId}:`, err);
        results.push({ productId, status: "error", error: err.message });
      }
    }
    
    // Also run check-price-alerts to see if any alerts need to be triggered
    try {
      const alertResponse = await supabase.functions.invoke("check-price-alerts", {
        body: {}
      });
      
      console.log("Price alerts check completed with status:", alertResponse.status);
    } catch (alertError) {
      console.error("Error checking price alerts:", alertError);
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Processed ${uniqueProductIds.length} products`,
        results 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in daily price tracking job:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
