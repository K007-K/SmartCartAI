import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { ThumbsUp, ThumbsDown, RefreshCw, MessageCircle } from "lucide-react";
interface SentimentAnalysisProps {
  asin: string;
  customersSay?: string;
}
interface SentimentData {
  sentiment: {
    positive: number;
    negative: number;
    neutral: number;
    total: number;
  };
  topPositive: string[];
  topNegative: string[];
  summary: string;
}
const SentimentAnalysis = ({
  asin,
  customersSay
}: SentimentAnalysisProps) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<SentimentData | null>(null);
  useEffect(() => {
    if (asin) {
      if (customersSay) {
        // If we already have customers_say data, process it directly
        processSentimentFromText(customersSay);
      } else {
        // Otherwise fetch from API
        fetchSentimentAnalysis();
      }
    }
  }, [asin, customersSay]);
  const processSentimentFromText = async (text: string) => {
    try {
      setLoading(true);

      // Create a simple sentiment analysis from the text
      // In a real app, we would use a more sophisticated analysis
      const sentimentData: SentimentData = {
        sentiment: {
          positive: 70,
          // Placeholder values
          negative: 20,
          neutral: 10,
          total: 100
        },
        topPositive: [],
        topNegative: [],
        summary: text || "No sentiment analysis available"
      };

      // Extract positive and negative points from the text if possible
      const sentences = text.split('. ');
      for (const sentence of sentences) {
        if (sentence.toLowerCase().includes('good') || sentence.toLowerCase().includes('great') || sentence.toLowerCase().includes('excellent') || sentence.toLowerCase().includes('like') || sentence.toLowerCase().includes('happy')) {
          sentimentData.topPositive.push(sentence);
        } else if (sentence.toLowerCase().includes('bad') || sentence.toLowerCase().includes('poor') || sentence.toLowerCase().includes('dislike') || sentence.toLowerCase().includes('issue') || sentence.toLowerCase().includes('problem')) {
          sentimentData.topNegative.push(sentence);
        }
      }
      setData(sentimentData);
    } catch (error) {
      console.error("Error processing sentiment:", error);
    } finally {
      setLoading(false);
    }
  };
  const fetchSentimentAnalysis = async () => {
    try {
      setLoading(true);
      const {
        data: session
      } = await supabase.auth.getSession();
      const token = session?.session?.access_token;
      if (!token) {
        toast.error("Authentication required");
        return;
      }
      const response = await fetch("/api/product-sentiment-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          asin
        })
      });
      if (!response.ok) {
        throw new Error("Failed to fetch sentiment analysis");
      }
      const data = await response.json();
      setData(data);
    } catch (error: any) {
      console.error("Error fetching sentiment analysis:", error.message);
      toast.error("Failed to load sentiment analysis");
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>;
  }
  if (!data) {
    return <div className="text-center p-8">
        <p className="text-muted-foreground">No sentiment analysis available</p>
        <Button variant="outline" onClick={fetchSentimentAnalysis} className="mt-4">
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </div>;
  }
  const totalReviews = data.sentiment.total || data.sentiment.positive + data.sentiment.negative + data.sentiment.neutral;
  const positivePercentage = totalReviews > 0 ? Math.round(data.sentiment.positive / totalReviews * 100) : 0;
  const negativePercentage = totalReviews > 0 ? Math.round(data.sentiment.negative / totalReviews * 100) : 0;
  const neutralPercentage = totalReviews > 0 ? Math.round(data.sentiment.neutral / totalReviews * 100) : 0;
  return <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Customer Sentiment Analysis</h3>
        
        
        
        <div className="p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2 flex items-center">
            <MessageCircle className="h-4 w-4 mr-2" />
            Summary
          </h4>
          <p className="text-sm">{data.summary}</p>
        </div>
      </div>
      
      {(data.topPositive.length > 0 || data.topNegative.length > 0) && <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.topPositive.length > 0 && <div>
              <h4 className="text-sm font-medium flex items-center mb-3">
                <ThumbsUp className="h-4 w-4 mr-2 text-green-500" />
                Top Positive Reviews
              </h4>
              <div className="space-y-3">
                {data.topPositive.map((review, index) => <Card key={index} className="p-3 text-xs border-l-4 border-l-green-500">
                    "{review}"
                  </Card>)}
              </div>
            </div>}
          
          {data.topNegative.length > 0 && <div>
              <h4 className="text-sm font-medium flex items-center mb-3">
                <ThumbsDown className="h-4 w-4 mr-2 text-red-500" />
                Top Negative Reviews
              </h4>
              <div className="space-y-3">
                {data.topNegative.map((review, index) => <Card key={index} className="p-3 text-xs border-l-4 border-l-red-500">
                    "{review}"
                  </Card>)}
              </div>
            </div>}
        </div>}
    </div>;
};
export default SentimentAnalysis;