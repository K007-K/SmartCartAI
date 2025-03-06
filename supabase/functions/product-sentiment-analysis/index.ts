
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const amazonApiKey = Deno.env.get("AMAZON_API_KEY");
const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
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
    const { asin, country = "IN" } = await req.json();

    if (!asin) {
      return new Response(
        JSON.stringify({ error: "ASIN is required" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Fetch reviews from Amazon API
    const reviewsUrl = `https://${apiHost}/product-reviews?asin=${asin}&country=${country}`;
    
    console.log("Fetching reviews for ASIN:", asin);
    
    const reviewsResponse = await fetch(reviewsUrl, {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": amazonApiKey || "41fa177643mshbea0f7259ba7ad4p1a2ccejsn2cb9fd7060a9",
        "X-RapidAPI-Host": apiHost,
      },
    });

    const reviewsData = await reviewsResponse.json();
    
    if (!reviewsResponse.ok) {
      throw new Error(`Amazon API error: ${reviewsData.message || reviewsResponse.statusText}`);
    }

    const reviews = reviewsData.data?.reviews || [];
    console.log(`Fetched ${reviews.length} reviews`);

    // Extract review texts for sentiment analysis
    const reviewTexts = reviews.map(review => review.review).join("\n");
    
    if (!reviewTexts) {
      return new Response(
        JSON.stringify({ 
          sentiment: {
            positive: 0,
            negative: 0,
            neutral: 0,
            total: 0
          },
          topPositive: [],
          topNegative: [],
          summary: "No reviews available for sentiment analysis."
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Use Gemini AI for sentiment analysis
    const prompt = `Analyze the sentiment of these Amazon product reviews. Categorize each review as positive, negative, or neutral. Then provide a count of each category, identify the top 3 most positive and top 3 most negative reviews, and give an overall summary of customer sentiment in 2-3 sentences.

Reviews:
${reviewTexts.substring(0, 10000)} // Limit to prevent token overflow

Output your response in this JSON format:
{
  "sentiment": {
    "positive": number,
    "negative": number,
    "neutral": number,
    "total": number
  },
  "topPositive": [
    "review text 1",
    "review text 2",
    "review text 3"
  ],
  "topNegative": [
    "review text 1",
    "review text 2",
    "review text 3"
  ],
  "summary": "Overall sentiment summary here"
}`;

    const geminiResponse = await fetch(
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

    const geminiData = await geminiResponse.json();
    
    // Parse sentiment analysis from Gemini
    let sentimentAnalysis = {
      sentiment: {
        positive: 0,
        negative: 0,
        neutral: 0,
        total: reviews.length
      },
      topPositive: [],
      topNegative: [],
      summary: "No sentiment analysis available."
    };
    
    try {
      if (geminiData.candidates && 
          geminiData.candidates[0] && 
          geminiData.candidates[0].content && 
          geminiData.candidates[0].content.parts && 
          geminiData.candidates[0].content.parts[0] && 
          geminiData.candidates[0].content.parts[0].text) {
        
        const text = geminiData.candidates[0].content.parts[0].text;
        // Extract JSON from the response
        const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/({[\s\S]*})/);
        
        if (jsonMatch && jsonMatch[1]) {
          sentimentAnalysis = JSON.parse(jsonMatch[1]);
        } else {
          sentimentAnalysis.summary = "Unable to parse sentiment analysis results.";
        }
      }
    } catch (error) {
      console.error("Error parsing sentiment analysis:", error);
      sentimentAnalysis.summary = "Error processing sentiment analysis.";
    }

    return new Response(
      JSON.stringify(sentimentAnalysis),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Error in product-sentiment-analysis function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
