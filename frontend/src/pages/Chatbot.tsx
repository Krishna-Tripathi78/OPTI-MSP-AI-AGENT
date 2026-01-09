import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Send, MessageCircle, User, Bot, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { sendChatMessage } from "@/services/aiService";

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export default function Chatbot() {
  const navigate = useNavigate();
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      id: '1',
      text: 'Which clients are unprofitable this quarter?',
      sender: 'user',
      timestamp: new Date(Date.now() - 300000)
    },
    {
      id: '2',
      text: 'Based on Q1 2025 data, 3 clients are currently unprofitable:\n\n1. Sharma Technologies (-5% margin, -$7.5K)\n   - Main cost driver: Support hours\n   - Recommendation: Implement automated monitoring\n\n2. Patel Solutions (-2% margin, -$3.2K)\n   - Main cost driver: Infrastructure costs\n   - Recommendation: Optimize cloud resources\n\n3. Kumar Enterprises (-1% margin, -$1.8K)\n   - Main cost driver: License costs\n   - Recommendation: Review license utilization\n\nWould you like specific recommendations to improve margins for these clients?',
      sender: 'ai',
      timestamp: new Date(Date.now() - 290000)
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const handleSendMessage = async () => {
    if (!chatMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: chatMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setChatHistory(prev => [...prev, userMessage]);
    setChatMessage("");
    setIsLoading(true);

    try {
      const response = await sendChatMessage(chatMessage);
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'ai',
        timestamp: new Date()
      };
      setChatHistory(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: "AI service unavailable. Please try again later.",
        sender: 'ai',
        timestamp: new Date()
      };
      setChatHistory(prev => [...prev, errorMessage]);
    }

    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessage = (text: string) => {
    return text.split('\n').map((line, index) => (
      <div key={index}>
        {line}
        {index < text.split('\n').length - 1 && <br />}
      </div>
    ));
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard')}
            className="hover:bg-muted"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-secondary">
              <Sparkles className="h-6 w-6 text-white animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">OptiMSP AI Assistant</h1>
              <p className="text-muted-foreground">Get intelligent insights about your MSP operations</p>
            </div>
          </div>
        </div>

        {/* Chat Container */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-primary/5 to-secondary/5">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              Chat with AI Assistant
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Chat History */}
            <div className="h-[60vh] overflow-y-auto space-y-4 p-4 bg-muted/20 rounded-lg border">
              {chatHistory.map((msg) => (
                <div key={msg.id} className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.sender === 'ai' && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <div className={`max-w-[80%] p-4 rounded-lg ${msg.sender === 'user'
                    ? 'bg-primary text-primary-foreground ml-auto'
                    : 'bg-card border border-border'
                    }`}>
                    {msg.sender === 'user' && (
                      <div className="flex items-center gap-2 mb-2 opacity-70">
                        <User className="h-3 w-3" />
                        <span className="text-xs font-medium">You</span>
                      </div>
                    )}
                    {msg.sender === 'ai' && (
                      <div className="flex items-center gap-2 mb-2 text-primary">
                        <Bot className="h-3 w-3" />
                        <span className="text-xs font-medium">AI Assistant</span>
                      </div>
                    )}
                    <div className="text-sm">
                      {formatMessage(msg.text)}
                    </div>
                    <div className="text-xs opacity-50 mt-2">
                      {msg.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                  {msg.sender === 'user' && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                      <User className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-card border border-border p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2 text-primary">
                      <Bot className="h-3 w-3" />
                      <span className="text-xs font-medium">AI Assistant</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-primary rounded-full animate-bounce" />
                      <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="flex gap-3">
              <Input
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Ask anything about your MSP operations..."
                className="flex-1 border-primary/20 focus:border-primary/50"
                onKeyPress={handleKeyPress}
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!chatMessage.trim() || isLoading}
                className="bg-gradient-to-r from-primary to-secondary hover:shadow-lg transition-all duration-300 px-6"
              >
                {isLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setChatMessage("Which clients are most profitable?")}
                className="text-xs"
              >
                Most profitable clients
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setChatMessage("How can I reduce costs?")}
                className="text-xs"
              >
                Cost reduction tips
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setChatMessage("Show me revenue trends")}
                className="text-xs"
              >
                Revenue trends
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setChatMessage("What are the current anomalies?")}
                className="text-xs"
              >
                Current anomalies
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}