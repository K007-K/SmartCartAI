
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    // Get GROQ API key from environment variables
    const groqApiKey = Deno.env.get("GROQ_API_KEY");
    
    // Check if GROQ API key is available
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

    const { productTitle, productDescription, price } = body;

    if (!productTitle) {
      return new Response(
        JSON.stringify({ error: "Product title is required" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Construct prompt for Groq
    const prompt = `Analyze this Amazon India product:
Title: ${productTitle}
Description: ${productDescription || "Not available"}
Price: ₹${price || "Not available"}

Provide a concise analysis including:
1. Value for money assessment
2. Key features and benefits
3. Potential drawbacks or concerns
4. When this would be a good purchase
5. Is this a good time to buy based on the current price?

Keep the response under 250 words and make it helpful for a shopper.`;

    // Log request details
    console.log(`Processing insights request for product: ${productTitle}`);
    console.log(`API key present: ${groqApiKey ? "Yes" : "No"}`);
    console.log(`API key: ${groqApiKey?.substring(0, 5)}...`);  // Only log first few characters

    // Updated model to use the newer version
    const modelName = "llama-3.3-70b-versatile";
    const groqUrl = "https://api.groq.com/openai/v1/chat/completions";

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
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      }
    );

    console.log(`Groq API response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Groq API error (${response.status}):`, errorText);
      
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

    // Extract the generated text from Groq's response
    let insightText = "Unable to generate insights at this time.";
    
    if (data.choices && 
        data.choices[0] && 
        data.choices[0].message && 
        data.choices[0].message.content) {
      insightText = data.choices[0].message.content;
    }

    return new Response(
      JSON.stringify({ insight: insightText }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Error in insights function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
