
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

  // Create Supabase client
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    // Get GROQ API key from environment variables
    const groqApiKey = Deno.env.get("GROQ_API_KEY");
    
    // Check if GROQ API key is available and valid
    if (!groqApiKey) {
      console.error("GROQ_API_KEY is not set in environment variables");
      return new Response(
        JSON.stringify({ error: "API configuration error: Missing GROQ API key" }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Validate request body
    if (!req.body) {
      return new Response(
        JSON.stringify({ error: "Request body is required" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch (e) {
      console.error("Error parsing request body:", e);
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const { productId, message } = body;

    if (!productId || !message) {
      return new Response(
        JSON.stringify({ error: "Product ID and message are required" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    console.log(`Processing chatbot request for product ID: ${productId}`);
    console.log(`User message: ${message}`);
    console.log(`API key present: ${groqApiKey ? "Yes" : "No"}`);
    console.log(`API key: ${groqApiKey?.substring(0, 5)}...`);  // Only log first few characters

    // Fetch product details
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();

    if (productError || !product) {
      console.error("Error fetching product:", productError);
      return new Response(
        JSON.stringify({ 
          error: `Error fetching product: ${productError?.message || "Product not found"}` 
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Fetch price history
    const { data: priceHistory, error: priceHistoryError } = await supabase
      .from("price_history")
      .select("price, recorded_at")
      .eq("product_id", productId)
      .order("recorded_at", { ascending: true });

    if (priceHistoryError) {
      console.error("Error fetching price history:", priceHistoryError);
    }

    // Calculate lowest price
    const prices = priceHistory?.map(item => item.price) || [];
    const lowestPrice = prices.length > 0 ? Math.min(...prices) : product.current_price;
    const currentPrice = product.current_price || 0;

    // Create context for the chatbot
    const productContext = `
Product: ${product.title}
ASIN: ${product.asin}
Current Price: $${currentPrice}
Original Price: $${product.original_price || currentPrice}
Lowest Recorded Price: $${lowestPrice}
Description: ${product.description || "No description available"}
    `;

    console.log("Creating chat context with product info");

    // SmartCart AI system prompt for Groq
    const systemPrompt = `You are SmartCart AI, an advanced product comparison and recommendation assistant.
Your role is to help users make informed, confident purchasing decisions by providing clear, honest, and data-driven insights on products across various online stores.
You have to be straightforward, and give a proper opinion when asked about recommendations, keep it brief, keep it to the point, take the data from web if you want, show performance differences, suggest better ones.
Try to be as humanly as possible too.
You are a genius about tech, keep your prompts short and straightforward.

Your Core Objectives:
1️⃣ Provide Transparent & Honest Advice – Offer unbiased, fact-based recommendations without marketing bias.
2️⃣ Help Users Make Smart Purchases – Guide users through price trends, alternatives, and value-for-money options.
3️⃣ Analyze & Predict Prices Accurately – Track price history, detect patterns, and forecast potential price changes.
4️⃣ Evaluate Product Sentiment – Summarize real customer reviews and identify key pros and cons.
5️⃣ Compare Features Objectively – Deliver side-by-side comparisons based on specs, pricing, and user needs.

Key Capabilities (Share only when relevant):
✔ Price History Analysis – Track past price changes and spot discounts.
✔ Sentiment Analysis – Summarize customer reviews for real-world insights.
✔ Future Price Predictions – Estimate whether prices may rise or drop based on trends.
✔ Personalized Recommendations – Suggest alternatives tailored to user preferences.
✔ Feature Comparisons – Break down specs and highlight differences clearly.

Communication Style:
🟢 Clear & Direct – No fluff, just useful insights.
😊 Friendly & Conversational – Sound human, not robotic.
🔍 Actionable & Practical – Give users specific, useful advice.
🚫 No Unnecessary Jargon – Keep explanations simple and easy to understand.
⚖ Transparent About Limitations – If a prediction isn't certain, say so.

Your goal: Make shopping easier, smarter, and stress-free. 🛒💡

Here's information about the product the user is asking about:
${productContext}

Focus on the product in context and answer the user's questions based on this information.
Today's date is ${new Date().toLocaleDateString()}.
`;

    console.log("Sending request to Groq API");

    // Set up the Groq API endpoint - updated model per user's reference
    const modelName = "llama-3.3-70b-versatile";
    const groqUrl = "https://api.groq.com/openai/v1/chat/completions";
    
    try {
      // Send message to Groq
      const response = await fetch(
        groqUrl,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${groqApiKey}`,
          },
          body: JSON.stringify({
            model: modelName,
            messages: [
              {
                role: "system",
                content: systemPrompt
              },
              {
                role: "user",
                content: message
              }
            ],
            temperature: 0.7,
            max_tokens: 1000,
          }),
        }
      );

      console.log(`Groq API response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Groq API error (${response.status}):`, errorText);
        
        // Return a proper error response to the client
        return new Response(
          JSON.stringify({ 
            error: `Error from AI service: ${response.status}`, 
            details: errorText 
          }),
          { 
            status: 502, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }

      const data = await response.json();
      console.log("Groq API response received successfully");
      
      // Extract the generated text
      let botResponse = "I'm sorry, I couldn't process your request at this time.";
      
      if (data.choices && 
          data.choices[0] && 
          data.choices[0].message && 
          data.choices[0].message.content) {
        botResponse = data.choices[0].message.content;
      }

      return new Response(
        JSON.stringify({ response: botResponse }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    } catch (groqError) {
      console.error("Error calling Groq API:", groqError);
      return new Response(
        JSON.stringify({ error: `Error calling AI service: ${groqError.message}` }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
  } catch (error) {
    console.error("Error in product-chatbot function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
