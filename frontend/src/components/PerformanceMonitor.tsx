import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Activity, Cpu, HardDrive, Wifi, Sparkles, Send, MessageCircle, User, Bot } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { sendChatMessage } from "@/services/aiService";

interface SystemMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
}

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpu: 45,
    memory: 62,
    disk: 78,
    network: 34
  });
  const [showAIChat, setShowAIChat] = useState(false);
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
      text: 'Based on Q1 2025 data, 3 clients are currently unprofitable:\n\n1. Sharma Technologies (-5% margin, -$7.5K)\n   Main cost driver: Support hours\n\n2. Patel Solutions (-2% margin, -$3.2K)\n   Main cost driver: Infrastructure\n\n3. Kumar Enterprises (-1% margin, -$1.8K)\n   Main cost driver: License costs\n\nWould you like recommendations to improve margins for these clients?',
      sender: 'ai',
      timestamp: new Date(Date.now() - 290000)
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics({
        cpu: Math.floor(Math.random() * 40) + 30,
        memory: Math.floor(Math.random() * 30) + 50,
        disk: Math.floor(Math.random() * 20) + 70,
        network: Math.floor(Math.random() * 50) + 20
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (value: number) => {
    if (value > 80) return "text-red-500";
    if (value > 60) return "text-yellow-500";
    return "text-green-500";
  };

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
        text: "AI service unavailable. Please try again.",
        sender: 'ai',
        timestamp: new Date()
      };
      setChatHistory(prev => [...prev, errorMessage]);
    }

    setIsLoading(false);
  };

  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            System Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4" />
                <span className="text-sm">CPU Usage</span>
              </div>
              <span className={`text-sm font-medium ${getStatusColor(metrics.cpu)}`}>
                {metrics.cpu}%
              </span>
            </div>
            <Progress value={metrics.cpu} className="h-2" />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                <span className="text-sm">Memory</span>
              </div>
              <span className={`text-sm font-medium ${getStatusColor(metrics.memory)}`}>
                {metrics.memory}%
              </span>
            </div>
            <Progress value={metrics.memory} className="h-2" />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4" />
                <span className="text-sm">Disk Usage</span>
              </div>
              <span className={`text-sm font-medium ${getStatusColor(metrics.disk)}`}>
                {metrics.disk}%
              </span>
            </div>
            <Progress value={metrics.disk} className="h-2" />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wifi className="h-4 w-4" />
                <span className="text-sm">Network</span>
              </div>
              <span className={`text-sm font-medium ${getStatusColor(metrics.network)}`}>
                {metrics.network}%
              </span>
            </div>
            <Progress value={metrics.network} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* AI Assistant */}
      <Card className="border-0 shadow-md bg-gradient-to-br from-primary/5 to-secondary/5" data-ai-assistant>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary to-secondary">
                <Sparkles className="h-4 w-4 text-white animate-pulse" />
              </div>
              💬 OptiMSP AI Assistant
            </CardTitle>
            <Button
              onClick={() => setShowAIChat(!showAIChat)}
              variant="outline"
              size="sm"
              className="border-primary/30 hover:bg-primary/10 transition-all duration-300 hover:scale-105 hover:shadow-md"
            >
              <MessageCircle className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">{showAIChat ? 'Hide' : 'Chat'}</span>
            </Button>
          </div>
        </CardHeader>
        {showAIChat && (
          <CardContent className="space-y-4" data-ai-chat>
            {/* Chat History */}
            <div className="max-h-80 overflow-y-auto space-y-3 p-3 bg-muted/20 rounded-lg border">
              {chatHistory.map((msg) => (
                <div key={msg.id} className={`flex gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.sender === 'ai' && (
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                      <Bot className="h-3 w-3 text-white" />
                    </div>
                  )}
                  <div className={`max-w-[80%] p-3 rounded-lg text-sm ${msg.sender === 'user'
                    ? 'bg-primary text-primary-foreground ml-auto'
                    : 'bg-card border border-border'
                    }`}>
                    {msg.sender === 'user' && (
                      <div className="flex items-center gap-1 mb-1 opacity-70">
                        <User className="h-3 w-3" />
                        <span className="text-xs font-medium">User</span>
                      </div>
                    )}
                    {msg.sender === 'ai' && (
                      <div className="flex items-center gap-1 mb-1 text-primary">
                        <Bot className="h-3 w-3" />
                        <span className="text-xs font-medium">AI Assistant</span>
                      </div>
                    )}
                    <div className={`prose prose-sm max-w-none ${msg.sender === 'user' ? 'prose-invert text-primary-foreground' : 'dark:prose-invert text-foreground'}`}>
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          // Override basic elements to match the theme better if needed
                          p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                          ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-2" {...props} />,
                          ol: ({ node, ...props }) => <ol className="list-decimal pl-4 mb-2" {...props} />,
                          li: ({ node, ...props }) => <li className="mb-0.5" {...props} />,
                          strong: ({ node, ...props }) => <strong className="font-semibold" {...props} />,
                        }}
                      >
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                  </div>
                  {msg.sender === 'user' && (
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <User className="h-3 w-3 text-primary-foreground" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-2 justify-start">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <Bot className="h-3 w-3 text-white" />
                  </div>
                  <div className="bg-card border border-border p-3 rounded-lg text-sm">
                    <div className="flex items-center gap-1 mb-1 text-primary">
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
            </div>

            {/* Input Area */}
            <div className="flex gap-2">
              <Input
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Ask anything..."
                className="flex-1 border-primary/20 focus:border-primary/50 text-sm"
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!chatMessage.trim() || isLoading}
                size="sm"
                className="bg-gradient-to-r from-primary to-secondary hover:shadow-lg transition-all duration-300 px-3"
              >
                {isLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}