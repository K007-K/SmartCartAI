
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("Starting price alert check");

    // Get all user products with alerts enabled
    const { data: alertProducts, error: alertError } = await supabase
      .from("user_products")
      .select(`
        id,
        user_id,
        product_id,
        alert_price,
        alert_enabled,
        products:product_id (
          id, asin, title, current_price, image_url, url
        )
      `)
      .eq("alert_enabled", true)
      .not("alert_price", "is", null);

    if (alertError) {
      throw alertError;
    }

    console.log(`Found ${alertProducts?.length || 0} products with alerts enabled`);

    // Process each alert
    const alertsToSend = [];
    for (const product of alertProducts || []) {
      const currentPrice = product.products.current_price;
      const targetPrice = product.alert_price;
      
      if (!currentPrice || !targetPrice) continue;
      
      // Check if current price meets or is below target price
      if (currentPrice <= targetPrice) {
        alertsToSend.push({
          userId: product.user_id,
          productId: product.product_id,
          productInfo: product.products,
          currentPrice,
          targetPrice
        });
      }
    }

    console.log(`Found ${alertsToSend.length} alerts to send`);

    // Create in-app notifications for alerts
    for (const alert of alertsToSend) {
      // Create notification record in a notifications table
      const { error: notifError } = await supabase
        .from("notifications")
        .insert({
          user_id: alert.userId,
          product_id: alert.productId,
          message: `Price Alert: ${alert.productInfo.title} has dropped to ${formatPrice(alert.currentPrice)}, which is at or below your target price of ${formatPrice(alert.targetPrice)}.`,
          type: 'price_alert',
          is_read: false
        });
      
      if (notifError) {
        console.error("Error creating notification:", notifError);
      } else {
        console.log(`Created notification for user ${alert.userId} for product ${alert.productInfo.title}`);
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Checked ${alertProducts?.length || 0} products, found ${alertsToSend.length} alerts to send` 
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (error) {
    console.error("Error checking price alerts:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2
  }).format(price);
}
