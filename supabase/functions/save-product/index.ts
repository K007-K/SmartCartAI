
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
    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase URL or Service Key");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Use service role key for admin privileges to bypass RLS
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Authenticate the request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.split(" ")[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error("Authentication error:", authError);
      return new Response(
        JSON.stringify({ error: "Unauthorized", details: authError?.message }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch (e) {
      console.error("Failed to parse request body:", e);
      return new Response(
        JSON.stringify({ error: "Invalid request body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const { productData, alertPrice, alertEnabled, recordView } = body;

    // Make sure we have valid product data
    if (!productData || !productData.asin) {
      console.error("Invalid product data", productData);
      return new Response(
        JSON.stringify({ error: "Invalid product data" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Saving product:", productData.asin);
    
    // Create a sanitized product object with all expected fields
    const sanitizedProduct = {
      asin: productData.asin,
      title: productData.title || "Unknown product",
      description: productData.description || null,
      image_url: productData.image_url || null,
      current_price: typeof productData.current_price === 'number' ? productData.current_price : null,
      original_price: typeof productData.original_price === 'number' ? productData.original_price : null,
      url: productData.url || null,
      availability: productData.availability || "Unknown",
      customers_say: productData.customers_say || null,
      about_product: Array.isArray(productData.about_product) ? productData.about_product : null,
      product_information: productData.product_information && typeof productData.product_information === 'object' ? productData.product_information : null,
      product_details: productData.product_details && typeof productData.product_details === 'object' ? productData.product_details : null
    };
    
    // Check if product already exists in database using service role client (bypasses RLS)
    const { data: existingProduct, error: lookupError } = await supabase
      .from("products")
      .select("id")
      .eq("asin", sanitizedProduct.asin)
      .maybeSingle();

    if (lookupError) {
      console.error("Error looking up existing product:", lookupError);
      throw lookupError;
    }

    let productId;
    
    if (existingProduct) {
      console.log("Found existing product with ID:", existingProduct.id);
      productId = existingProduct.id;
      
      // Update existing product with sanitized data
      const { error: updateError } = await supabase
        .from("products")
        .update({
          title: sanitizedProduct.title,
          description: sanitizedProduct.description,
          image_url: sanitizedProduct.image_url,
          current_price: sanitizedProduct.current_price,
          original_price: sanitizedProduct.original_price,
          url: sanitizedProduct.url,
          availability: sanitizedProduct.availability,
          customers_say: sanitizedProduct.customers_say,
          about_product: sanitizedProduct.about_product,
          product_information: sanitizedProduct.product_information,
          product_details: sanitizedProduct.product_details,
          updated_at: new Date().toISOString()
        })
        .eq("id", productId);

      if (updateError) {
        console.error("Error updating product:", updateError);
        throw updateError;
      }
      
      console.log("Updated existing product");
    } else {
      console.log("Inserting new product");
      // Insert new product using service role to bypass RLS
      const { data: newProduct, error: insertError } = await supabase
        .from("products")
        .insert({
          asin: sanitizedProduct.asin,
          title: sanitizedProduct.title,
          description: sanitizedProduct.description,
          image_url: sanitizedProduct.image_url,
          current_price: sanitizedProduct.current_price,
          original_price: sanitizedProduct.original_price,
          url: sanitizedProduct.url,
          availability: sanitizedProduct.availability,
          customers_say: sanitizedProduct.customers_say,
          about_product: sanitizedProduct.about_product,
          product_information: sanitizedProduct.product_information,
          product_details: sanitizedProduct.product_details
        })
        .select("id")
        .single();

      if (insertError) {
        console.error("Error inserting new product:", insertError);
        throw insertError;
      }
      
      if (!newProduct) {
        console.error("No product ID returned after insert");
        throw new Error("Failed to get product ID after insert");
      }
      
      console.log("Inserted new product with ID:", newProduct.id);
      productId = newProduct.id;
    }

    // Save initial price point to price history
    if (sanitizedProduct.current_price !== null) {
      console.log("Recording price history for product ID:", productId);
      const { error: historyError } = await supabase
        .from("price_history")
        .insert({
          product_id: productId,
          price: sanitizedProduct.current_price,
          recorded_at: new Date().toISOString()
        });
      
      if (historyError) {
        console.error("Error recording price history:", historyError);
      } else {
        console.log("Price history recorded successfully");
      }
    }

    // Record a recently viewed entry if requested
    if (recordView === true) {
      console.log("Recording view for product ID:", productId, "by user:", user.id);
      // First check if this product was recently viewed by the user
      const { data: recentlyViewed, error: recentlyViewedError } = await supabase
        .from("recently_viewed")
        .select("id")
        .eq("user_id", user.id)
        .eq("product_id", productId)
        .order("viewed_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (recentlyViewedError) {
        console.error("Error checking recently viewed:", recentlyViewedError);
      } else {
        if (recentlyViewed) {
          console.log("Updating existing recently viewed entry");
          // Update the viewed_at timestamp
          const { error: updateError } = await supabase
            .from("recently_viewed")
            .update({ viewed_at: new Date().toISOString() })
            .eq("id", recentlyViewed.id);
            
          if (updateError) {
            console.error("Error updating recently viewed:", updateError);
          } else {
            console.log("Updated recently viewed entry successfully");
          }
        } else {
          console.log("Creating new recently viewed entry");
          // Insert a new recently viewed entry
          const { error: insertError } = await supabase
            .from("recently_viewed")
            .insert({
              user_id: user.id,
              product_id: productId,
              viewed_at: new Date().toISOString()
            });
            
          if (insertError) {
            console.error("Error inserting recently viewed:", insertError);
          } else {
            console.log("Created new recently viewed entry successfully");
          }
        }
      }
    }

    // If alert settings are provided and alertPrice is set, save them
    if (alertEnabled !== undefined && alertPrice !== undefined && alertPrice > 0) {
      console.log("Processing alert settings for product");
      
      // Check if user already tracks this product
      const { data: userProduct, error: userProductError } = await supabase
        .from("user_products")
        .select("id")
        .eq("user_id", user.id)
        .eq("product_id", productId)
        .maybeSingle();

      if (userProductError) {
        console.error("Error checking user product:", userProductError);
        throw userProductError;
      }

      if (userProduct) {
        console.log("Updating existing user-product relationship");
        // Update existing user product relationship
        const { error: updateError } = await supabase
          .from("user_products")
          .update({
            alert_price: alertPrice,
            alert_enabled: alertEnabled
          })
          .eq("id", userProduct.id);

        if (updateError) {
          console.error("Error updating user product:", updateError);
          throw updateError;
        } else {
          console.log("Updated user-product relationship successfully");
        }
      } else {
        console.log("Creating new user-product relationship");
        // Create new user product relationship
        const { error: insertError } = await supabase
          .from("user_products")
          .insert({
            user_id: user.id,
            product_id: productId,
            alert_price: alertPrice,
            alert_enabled: alertEnabled
          });

        if (insertError) {
          console.error("Error inserting user product:", insertError);
          throw insertError;
        } else {
          console.log("Created new user-product relationship successfully");
        }
      }
    } else {
      console.log("No alert price set or alert price is 0, not creating tracked product entry");
    }

    // Return success
    return new Response(
      JSON.stringify({ success: true, productId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error saving product:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
