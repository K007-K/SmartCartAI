
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

const geminiApiKey = Deno.env.get("GEMINI_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Create Supabase client
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    const { productId } = await req.json();

    if (!productId) {
      return new Response(
        JSON.stringify({ error: "Product ID is required" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Fetch product details
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();

    if (productError || !product) {
      throw new Error(`Error fetching product: ${productError?.message || "Product not found"}`);
    }

    // Check if insights already exist and are recent (less than 24 hours old)
    const { data: existingInsight } = await supabase
      .from("product_insights")
      .select("*")
      .eq("product_id", productId)
      .single();

    // If insights exist and are recent, return them
    if (existingInsight) {
      const insightDate = new Date(existingInsight.created_at);
      const now = new Date();
      const hoursSinceUpdate = (now.getTime() - insightDate.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceUpdate < 24) {
        return new Response(
          JSON.stringify({ insight: existingInsight.insight_text }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }
    }

    // Construct prompt for Gemini
    const prompt = `Analyze this Amazon India product:
Title: ${product.title}
Description: ${product.description || "Not available"}
Price: ₹${product.current_price || "Not available"}

Provide a concise analysis including:
1. Value for money assessment
2. Key features and benefits
3. Potential drawbacks or concerns
4. When this would be a good purchase
5. Is this a good time to buy based on the current price?

Keep the response under 250 words and make it helpful for a shopper.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    // Extract the generated text from Gemini's response
    let insightText = "Unable to generate insights at this time.";
    
    if (data.candidates && 
        data.candidates[0] && 
        data.candidates[0].content && 
        data.candidates[0].content.parts && 
        data.candidates[0].content.parts[0] && 
        data.candidates[0].content.parts[0].text) {
      insightText = data.candidates[0].content.parts[0].text;
    }

    // Save or update insights in database
    if (existingInsight) {
      const { error: updateError } = await supabase
        .from("product_insights")
        .update({
          insight_text: insightText,
          created_at: new Date().toISOString()
        })
        .eq("id", existingInsight.id);

      if (updateError) {
        console.error("Error updating product insights:", updateError);
      }
    } else {
      const { error: insertError } = await supabase
        .from("product_insights")
        .insert({
          product_id: productId,
          insight_text: insightText
        });

      if (insertError) {
        console.error("Error saving product insights:", insertError);
      }
    }

    return new Response(
      JSON.stringify({ insight: insightText }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Error in update-product-insights function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
