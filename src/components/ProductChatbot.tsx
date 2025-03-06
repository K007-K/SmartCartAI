
import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Send, User, Bot, X, AlertCircle, Save } from "lucide-react";

export interface ProductChatbotProps {
  productId: string;
}

interface Message {
  id: string;
  content: string;
  sender: "user" | "bot" | "error";
  timestamp: Date;
}

const ProductChatbot = ({ productId }: ProductChatbotProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [chatSessionId, setChatSessionId] = useState<string | null>(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

  // Add initial bot message
  useEffect(() => {
    const welcomeMessage: Message = {
      id: "welcome",
      content: "Hi there! I'm your SmartCart AI assistant. You can ask me about this product, whether it's a good time to buy, or recommendations for similar products. How can I help you today?",
      sender: "bot",
      timestamp: new Date()
    };
    
    setMessages([welcomeMessage]);
    
    // Create a new chat session when component mounts
    createChatSession([welcomeMessage]);
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current;
      scrollArea.scrollTop = scrollArea.scrollHeight;
    }
  }, [messages]);

  const createChatSession = async (initialMessages: Message[]) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session?.session) {
        // Skip chat session creation for non-authenticated users
        return;
      }
      
      // Use RPC to call the stored procedure we created
      const { data, error } = await supabase
        .rpc('create_chat_session', { 
          p_user_id: session.session.user.id,
          p_product_id: productId
        });
      
      if (error) {
        console.error("Error creating chat session:", error);
        return;
      }
      
      if (data && data.length > 0) {
        const newSessionId = data[0].id;
        setChatSessionId(newSessionId);
        
        // Save initial message
        if (initialMessages.length > 0 && newSessionId) {
          await saveChatMessages(newSessionId, initialMessages);
        }
      }
    } catch (error) {
      console.error("Error creating chat session:", error);
    }
  };

  const saveChatMessages = async (sessionId: string, messagesToSave: Message[]) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session?.session) {
        // Skip message saving for non-authenticated users
        return;
      }
      
      const messagesForDB = messagesToSave.map(msg => ({
        chat_session_id: sessionId,
        content: msg.content,
        sender: msg.sender,
        timestamp: msg.timestamp.toISOString()
      }));
      
      // Use RPC to call the stored procedure we created
      const { error } = await supabase
        .rpc('save_chat_messages', { 
          p_messages: messagesForDB
        });
      
      if (error) {
        console.error("Error saving chat messages:", error);
      }
    } catch (error) {
      console.error("Error saving chat messages:", error);
    }
  };

  const handleSaveChat = async () => {
    if (!chatSessionId || messages.length <= 1) {
      toast.error("No conversation to save");
      return;
    }
    
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session?.session) {
        toast.error("Please log in to save conversations");
        return;
      }
      
      // Filter out the welcome message which is already saved
      const newMessages = messages.filter(msg => msg.id !== "welcome");
      
      if (newMessages.length > 0) {
        await saveChatMessages(chatSessionId, newMessages);
        toast.success("Chat history saved successfully");
      } else {
        toast.info("No new messages to save");
      }
    } catch (error) {
      console.error("Error saving chat:", error);
      toast.error("Failed to save chat history");
    }
  };

  const handleEndChat = () => {
    if (currentChatId) {
      // No need to actually cancel the request as it's already in progress
      // Just update the UI to show that we've stopped
      setLoading(false);
      setCurrentChatId(null);
      
      // Add a message to indicate the chat was stopped
      const stopMessage: Message = {
        id: Date.now().toString(),
        content: "Chat was ended.",
        sender: "bot",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, stopMessage]);
      toast.info("Chat response ended");
    }
  };

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!inputMessage.trim()) return;
    
    // Add user message to chat
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: "user",
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setLoading(true);
    
    // Generate a unique ID for this chat request
    const chatId = Date.now().toString();
    setCurrentChatId(chatId);
    
    try {
      console.log("Getting authentication session");
      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token;

      if (!token) {
        toast.error("Authentication required");
        throw new Error("Authentication required");
      }

      console.log("Sending request to product-chatbot function");
      
      // Direct call to the Supabase Edge Function
      const response = await supabase.functions.invoke("product-chatbot", {
        body: { 
          productId,
          message: inputMessage
        }
      });

      // Reset current chat ID as request is complete
      setCurrentChatId(null);

      if (response.error) {
        console.error("Chatbot response error:", response.error);
        throw new Error(`Failed to get chatbot response: ${response.error.message}`);
      }

      if (response.data?.error) {
        console.error("Chatbot error in response data:", response.data.error);
        throw new Error(`AI service error: ${response.data.error}`);
      }

      console.log("Received chatbot response:", response.data);
      
      // Add bot response to chat
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.data?.response || "I'm sorry, I couldn't process your request.",
        sender: "bot",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
      
      // Auto-save the messages after each exchange
      if (chatSessionId && autoSaveEnabled) {
        await saveChatMessages(chatSessionId, [userMessage, botMessage]);
      }
    } catch (error: any) {
      console.error("Chatbot error:", error);
      
      // Create user-friendly error message
      let errorMessage = "I'm sorry, I encountered an error while processing your request.";
      
      if (error.message.includes("API configuration")) {
        errorMessage = "The AI service is not properly configured. Please contact support.";
      } else if (error.message.includes("AI service")) {
        errorMessage = "There was an issue connecting to the AI service. Please try again later.";
      } else if (error.message.includes("Authentication")) {
        errorMessage = "You need to be logged in to use this feature.";
      }
      
      toast.error(`Error: ${errorMessage}`);
      
      // Add error message with special styling
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        content: errorMessage,
        sender: "error",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMsg]);
      
      // Auto-save the error message too
      if (chatSessionId && autoSaveEnabled) {
        await saveChatMessages(chatSessionId, [userMessage, errorMsg]);
      }
    } finally {
      setLoading(false);
      setCurrentChatId(null);
    }
  };

  return (
    <div className="border rounded-lg flex flex-col h-[500px] max-w-full">
      <div className="p-3 border-b bg-muted/50 flex justify-between items-center">
        <h3 className="font-medium flex items-center">
          <Bot className="mr-2 h-5 w-5" />
          SmartCart AI Assistant
        </h3>
        <div className="flex items-center text-xs text-muted-foreground">
          <span className="hidden sm:inline">Auto-save {autoSaveEnabled ? 'enabled' : 'disabled'}</span>
        </div>
      </div>
      
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div 
              key={message.id}
              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`flex gap-3 max-w-[80%] ${message.sender === "user" ? "flex-row-reverse" : ""}`}>
                <Avatar className={`h-8 w-8 ${
                  message.sender === "user" 
                    ? "bg-primary" 
                    : message.sender === "error" 
                      ? "bg-destructive" 
                      : "bg-secondary"
                }`}>
                  {message.sender === "user" ? (
                    <User className="h-4 w-4" />
                  ) : message.sender === "error" ? (
                    <AlertCircle className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </Avatar>
                
                <div className={`rounded-lg p-3 text-sm ${
                  message.sender === "user" 
                    ? "bg-primary text-primary-foreground" 
                    : message.sender === "error"
                      ? "bg-destructive/10 text-destructive border border-destructive/20"
                      : "bg-muted"
                }`}>
                  {message.content.split('\n').map((paragraph, idx) => (
                    <p key={idx} className={idx > 0 ? "mt-2" : ""}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start">
              <div className="flex gap-3 max-w-[80%]">
                <Avatar className="h-8 w-8 bg-secondary">
                  <Bot className="h-4 w-4" />
                </Avatar>
                <div className="rounded-lg p-3 bg-muted">
                  <div className="flex space-x-2">
                    <div className="h-2 w-2 rounded-full bg-current animate-bounce" />
                    <div className="h-2 w-2 rounded-full bg-current animate-bounce [animation-delay:0.2s]" />
                    <div className="h-2 w-2 rounded-full bg-current animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      
      <div className="border-t p-2">
        {/* Action buttons above the message bar - fixed for mobile */}
        <div className="flex flex-wrap justify-end mb-2 gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
            className="text-xs flex-shrink-0"
            title={autoSaveEnabled ? "Turn off auto-save" : "Turn on auto-save"}
          >
            <Save className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">{autoSaveEnabled ? "Auto-save ON" : "Auto-save OFF"}</span>
            <span className="sm:hidden">{autoSaveEnabled ? "ON" : "OFF"}</span>
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSaveChat}
            disabled={loading || messages.length <= 1 || autoSaveEnabled}
            title={autoSaveEnabled ? "Auto-save is enabled" : "Save chat history manually"}
            className="text-xs flex-shrink-0"
          >
            <Save className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Save Chat</span>
            <span className="sm:hidden">Save</span>
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleEndChat}
            disabled={!loading}
            className="text-xs flex-shrink-0"
          >
            <X className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">End Chat</span>
            <span className="sm:hidden">End</span>
          </Button>
        </div>
        
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            placeholder="Ask about this product..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={loading}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={loading || !inputMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ProductChatbot;
