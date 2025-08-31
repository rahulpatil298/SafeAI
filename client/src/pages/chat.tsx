import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  Send, 
  Bot, 
  User, 
  MapPin, 
  Navigation,
  Shield,
  Clock,
  Route as RouteIcon
} from "lucide-react";

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  routeSuggestion?: {
    from: string;
    to: string;
    safetyScore: number;
    duration: string;
    distance: string;
  };
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: "Hi! I'm your SafeWay AI assistant. I can help you find the safest routes, analyze travel risks, and provide real-time safety recommendations. Where would you like to go today?",
      timestamp: new Date(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      // Call OpenAI API for route analysis
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          context: 'route_planning'
        }),
      });

      const data = await response.json();
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: data.response || "I'm having trouble processing your request. Please try again.",
        timestamp: new Date(),
        routeSuggestion: data.routeSuggestion,
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: "I'm sorry, I'm having trouble connecting right now. Please try again later.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const selectRoute = (route: any) => {
    // Navigate to route planning with pre-filled data
    const params = new URLSearchParams({
      start: route.from,
      end: route.to,
      suggested: 'true'
    });
    window.location.href = `/routes?${params.toString()}`;
  };

  return (
    <div className="fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">AI Route Assistant</h2>
        <p className="text-muted-foreground">Chat with AI for personalized route recommendations and safety analysis</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chat Interface */}
        <div className="lg:col-span-3">
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center text-lg font-semibold text-foreground">
                <Bot className="h-5 w-5 mr-2 text-primary" />
                SafeWay AI Assistant
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0">
              <ScrollArea className="flex-1 px-6" ref={scrollAreaRef}>
                <div className="space-y-4 pb-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.type === 'user'
                            ? 'bg-primary text-primary-foreground ml-12'
                            : 'bg-muted text-foreground mr-12'
                        }`}
                      >
                        <div className="flex items-start space-x-2">
                          {message.type === 'bot' && (
                            <Bot className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                          )}
                          {message.type === 'user' && (
                            <User className="h-4 w-4 mt-0.5 text-primary-foreground flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <p className="text-sm">{message.content}</p>
                            
                            {/* Route Suggestion Card */}
                            {message.routeSuggestion && (
                              <Card className="mt-3 border">
                                <CardContent className="p-3">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium text-foreground">Suggested Route</span>
                                    <Badge className="bg-success text-success-foreground">
                                      <Shield className="h-3 w-3 mr-1" />
                                      {message.routeSuggestion.safetyScore}% Safe
                                    </Badge>
                                  </div>
                                  <div className="space-y-1 text-sm text-muted-foreground">
                                    <p><MapPin className="h-3 w-3 inline mr-1" />{message.routeSuggestion.from}</p>
                                    <p><Navigation className="h-3 w-3 inline mr-1" />{message.routeSuggestion.to}</p>
                                    <p><Clock className="h-3 w-3 inline mr-1" />{message.routeSuggestion.duration} • {message.routeSuggestion.distance}</p>
                                  </div>
                                  <Button
                                    size="sm"
                                    className="w-full mt-2"
                                    onClick={() => selectRoute(message.routeSuggestion)}
                                    data-testid="select-suggested-route"
                                  >
                                    <RouteIcon className="h-3 w-3 mr-1" />
                                    Use This Route
                                  </Button>
                                </CardContent>
                              </Card>
                            )}
                            
                            <p className="text-xs opacity-70 mt-1">
                              {message.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-muted text-foreground rounded-lg p-3 mr-12">
                        <div className="flex items-center space-x-2">
                          <Bot className="h-4 w-4 text-primary animate-pulse" />
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
              
              <div className="border-t p-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Ask about routes, safety, or travel advice..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                    className="flex-1"
                    data-testid="chat-input"
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={isLoading || !inputMessage.trim()}
                    data-testid="send-message-button"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">Quick Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  "What's the safest route to Mumbai Airport?",
                  "Show me routes with low crime rates",
                  "Find alternative routes avoiding traffic",
                  "Which areas should I avoid at night?",
                  "Best route for women traveling alone"
                ].map((question, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    className="w-full text-left justify-start h-auto p-2 text-wrap"
                    onClick={() => setInputMessage(question)}
                    data-testid={`quick-question-${index}`}
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">Safety Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-start space-x-2">
                  <Shield className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                  <p>Share your route with family before traveling</p>
                </div>
                <div className="flex items-start space-x-2">
                  <Clock className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <p>Avoid traveling alone during late hours</p>
                </div>
                <div className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 text-secondary mt-0.5 flex-shrink-0" />
                  <p>Stay on well-lit and populated routes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}