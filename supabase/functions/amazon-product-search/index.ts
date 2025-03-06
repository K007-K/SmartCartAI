
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const amazonApiKey = Deno.env.get("AMAZON_API_KEY");
const apiHost = "real-time-amazon-data.p.rapidapi.com";

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
    const { asin, country = "US" } = await req.json();

    if (!asin) {
      return new Response(
        JSON.stringify({ error: "ASIN is required" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    console.log(`Getting product details for ASIN: ${asin}, country: ${country}`);
    
    // Use the EXACT same API key and header format as in the Python example
    const apiKey = amazonApiKey || "41fa177643mshbea0f7259ba7ad4p1a2ccejsn2cb9fd7060a9";
    console.log(`Using Amazon API Key: ${apiKey ? "Available" : "Missing"}`);

    // Build the URL with query parameters - using product-details endpoint directly
    const url = `https://${apiHost}/product-details`;
    const queryParams = {
      asin: asin,
      country: country
    };
    
    console.log("Making request to URL:", url);
    console.log("With parameters:", JSON.stringify(queryParams));
    
    // Add timeout to the fetch request to avoid hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    try {
      const headers = {
        "X-RapidAPI-Key": apiKey,
        "X-RapidAPI-Host": apiHost,
      };
      console.log("Request headers:", JSON.stringify(headers));
      
      const response = await fetch(url + "?" + new URLSearchParams(queryParams), {
        method: "GET",
        headers: headers,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      console.log("Response status:", response.status);
      
      // Check if the response is empty
      const responseText = await response.text();
      console.log("Response text length:", responseText.length);
      console.log("Response text sample:", responseText.substring(0, 200));
      
      if (!responseText || responseText.trim() === '') {
        console.error("Empty response received from Amazon API");
        throw new Error("Empty response received from Amazon API");
      }
      
      let data;
      try {
        // Parse the response text manually
        data = JSON.parse(responseText);
        console.log("Successfully parsed response JSON");
        console.log("Response status from API:", data.status);
      } catch (parseError) {
        console.error("Failed to parse JSON response:", responseText.substring(0, 200) + "...");
        throw new Error("Invalid JSON response from Amazon API");
      }

      if (!response.ok) {
        console.error("API returned error HTTP status:", response.status);
        throw new Error(`Amazon API HTTP error: ${response.statusText}`);
      }
      
      if (data.status !== "OK") {
        console.error("API returned error status in payload:", data.status);
        throw new Error(`Amazon API error: ${data.message || "Unknown error"}`);
      }

      if (!data.data) {
        console.error("API response missing data object");
        throw new Error("API response missing data object");
      }

      // Process and validate JSON fields before returning
      const about_product = Array.isArray(data.data?.about_product) 
        ? data.data.about_product 
        : [];
        
      const product_information = data.data?.product_information && 
        typeof data.data.product_information === 'object' 
        ? data.data.product_information 
        : {};
        
      const product_details = data.data?.product_details && 
        typeof data.data.product_details === 'object' 
        ? data.data.product_details 
        : {};

      // Format product details for response
      const productDetails = {
        asin: data.data?.asin || asin,
        title: data.data?.product_title || "",
        description: data.data?.product_description || "",
        image_url: data.data?.product_photo || "",
        current_price: data.data?.product_price ? parseFloat(data.data.product_price.replace(/[^0-9.]/g, '')) || null : null,
        original_price: data.data?.product_original_price ? parseFloat(data.data.product_original_price.replace(/[^0-9.]/g, '')) || null : null,
        url: data.data?.product_url || "",
        rating: data.data?.product_star_rating || null,
        num_ratings: data.data?.product_num_ratings || 0,
        images: data.data?.product_photos || [],
        availability: data.data?.product_availability || "In Stock",
        customers_say: data.data?.customers_say || "",
        about_product,
        product_information,
        product_details
      };
      
      console.log("Amazon product details response received for ASIN:", productDetails.asin);
      return new Response(JSON.stringify({ product: productDetails, status: "OK" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        console.error("Request timed out after 30 seconds");
        throw new Error("Search request timed out");
      }
      throw fetchError;
    }
  } catch (error) {
    console.error("Error in amazon-product-search function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "An unexpected error occurred", product: null, status: "ERROR" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
