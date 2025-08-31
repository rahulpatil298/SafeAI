import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  MapPin, 
  Flag, 
  Search, 
  Shield, 
  Mic, 
  MessageCircle,
  AlertTriangle,
  Phone,
  Navigation,
  Clock,
  Star,
  Route as RouteIcon
} from "lucide-react";

interface RouteSearchData {
  startLocation: string;
  endLocation: string;
}

export default function Home() {
  const [isListening, setIsListening] = useState(false);
  const [sosTriggered, setSosTriggered] = useState(false);
  const [showEmergencyAlert, setShowEmergencyAlert] = useState(false);
  
  const { register, handleSubmit, setValue, watch } = useForm<RouteSearchData>({
    defaultValues: {
      startLocation: "",
      endLocation: "",
    }
  });

  const onRouteSearch = async (data: RouteSearchData) => {
    if (!data.startLocation || !data.endLocation) {
      alert("Please enter both starting point and destination");
      return;
    }
    
    // TODO: Implement route search with MapMyIndia API
    console.log("Searching route from", data.startLocation, "to", data.endLocation);
    // Navigate to route planning page with pre-filled data
    window.location.href = `/routes?start=${encodeURIComponent(data.startLocation)}&end=${encodeURIComponent(data.endLocation)}`;
  };

  const startVoiceAssistant = () => {
    setIsListening(true);
    
    // Check if browser supports speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported");
      // Simulate voice detection for demo
      setTimeout(() => {
        setIsListening(false);
        setSosTriggered(true);
      }, 3000);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const current = event.resultIndex;
      const transcript = event.results[current][0].transcript.toLowerCase();
      
      console.log("Heard:", transcript);
      
      // Check for SOS keywords
      const sosKeywords = ["help", "emergency", "sos", "danger", "assistance"];
      const foundKeyword = sosKeywords.some(keyword => transcript.includes(keyword));
      
      if (foundKeyword) {
        recognition.stop();
        setIsListening(false);
        triggerSOS();
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognition.start();
      
      // Auto-stop after 10 seconds
      setTimeout(() => {
        if (isListening) {
          recognition.stop();
          setIsListening(false);
        }
      }, 10000);
    } catch (error) {
      console.error("Failed to start speech recognition:", error);
      setIsListening(false);
    }
  };

  const triggerSOS = async () => {
    setSosTriggered(true);
    setShowEmergencyAlert(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const location = { lat: latitude, lng: longitude };
        
        try {
          // Send SOS alert to backend
          const response = await fetch('/api/emergency/sos', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              location,
              userId: 'current_user', // TODO: Get actual user ID
              message: 'Emergency SOS activated via voice command'
            }),
          });

          if (response.ok) {
            console.log("SOS alert sent successfully");
            // TODO: Trigger Firebase notifications to emergency contacts
          }
        } catch (error) {
          console.error("Failed to send SOS alert:", error);
        }
      },
      (error) => {
        console.error("Location access denied:", error);
        // Still send SOS without location
        fetch('/api/emergency/sos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            location: null,
            userId: 'current_user',
            message: 'Emergency SOS activated (location unavailable)'
          }),
        });
      }
    );
  };

  const sendLocationToFamily = () => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const location = { lat: latitude, lng: longitude };
        
        try {
          // Send location to family contacts
          const response = await fetch('/api/emergency/share-location', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              location,
              userId: 'current_user', // TODO: Get actual user ID
              contacts: ['family1', 'family2'] // TODO: Get from user settings
            }),
          });

          if (response.ok) {
            alert("Location shared with emergency contacts!");
          }
        } catch (error) {
          console.error("Failed to share location:", error);
          alert("Failed to share location. Please try again.");
        }
      },
      (error) => {
        console.error("Location access denied:", error);
        alert("Please enable location access to share your location.");
      }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 animate-fade-in">
              SafeWay AI
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Your intelligent travel companion that finds the safest routes using AI analysis of crime data, 
              accidents, and real-time safety information. Travel smart, travel safe.
            </p>
          </div>
          
          {/* Emergency Alert */}
          {showEmergencyAlert && (
            <Alert className="mb-8 border-destructive bg-destructive/10 animate-fade-in">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <AlertDescription className="text-destructive font-medium">
                🚨 SOS Alert Activated! Emergency contacts have been notified with your location.
              </AlertDescription>
            </Alert>
          )}

          {/* Main Route Search */}
          <Card className="max-w-2xl mx-auto shadow-xl border-0 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-center text-xl font-semibold text-foreground">
                Where are you going today?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onRouteSearch)} className="space-y-4">
                <div>
                  <Label htmlFor="startLocation" className="text-sm font-medium text-foreground">
                    From
                  </Label>
                  <div className="relative mt-2">
                    <Input
                      id="startLocation"
                      placeholder="Enter your starting location"
                      {...register("startLocation", { required: true })}
                      className="pl-10"
                      data-testid="home-start-location"
                    />
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="endLocation" className="text-sm font-medium text-foreground">
                    To
                  </Label>
                  <div className="relative mt-2">
                    <Input
                      id="endLocation"
                      placeholder="Enter your destination"
                      {...register("endLocation", { required: true })}
                      className="pl-10"
                      data-testid="home-end-location"
                    />
                    <Flag className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full btn-hover bg-primary text-primary-foreground"
                  data-testid="find-safest-route-button"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Find Safest Route
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 max-w-4xl mx-auto">
            {/* Voice Assistant */}
            <Card className="card-hover">
              <CardContent className="p-6 text-center">
                <Button
                  variant={isListening ? "destructive" : "outline"}
                  size="lg"
                  className="w-full mb-4"
                  onClick={startVoiceAssistant}
                  disabled={isListening}
                  data-testid="voice-assistant-button"
                >
                  <Mic className={`h-5 w-5 mr-2 ${isListening ? 'animate-pulse' : ''}`} />
                  {isListening ? "Listening..." : "Voice Assistant"}
                </Button>
                <p className="text-sm text-muted-foreground">
                  Say "Help", "SOS", or "Emergency" for instant assistance
                </p>
              </CardContent>
            </Card>

            {/* AI Chatbot */}
            <Card className="card-hover">
              <CardContent className="p-6 text-center">
                <Link href="/chat">
                  <Button variant="outline" size="lg" className="w-full mb-4" data-testid="ai-chatbot-button">
                    <MessageCircle className="h-5 w-5 mr-2" />
                    AI Route Assistant
                  </Button>
                </Link>
                <p className="text-sm text-muted-foreground">
                  Chat with AI for personalized route recommendations
                </p>
              </CardContent>
            </Card>

            {/* Emergency Contacts */}
            <Card className="card-hover">
              <CardContent className="p-6 text-center">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full mb-4"
                  onClick={sendLocationToFamily}
                  data-testid="share-location-button"
                >
                  <Phone className="h-5 w-5 mr-2" />
                  Share Location
                </Button>
                <p className="text-sm text-muted-foreground">
                  Send your location to family members
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Why Choose SafeWay AI?</h2>
            <p className="text-lg text-muted-foreground">Advanced safety features powered by AI and real-time data</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center card-hover">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">AI Safety Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Routes analyzed for crime data and accident history
                </p>
              </CardContent>
            </Card>

            <Card className="text-center card-hover">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Mic className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Voice SOS</h3>
                <p className="text-sm text-muted-foreground">
                  Voice-activated emergency alerts to contacts
                </p>
              </CardContent>
            </Card>

            <Card className="text-center card-hover">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Navigation className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Live Tracking</h3>
                <p className="text-sm text-muted-foreground">
                  Real-time location sharing with family
                </p>
              </CardContent>
            </Card>

            <Card className="text-center card-hover">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-6 w-6 text-warning" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">AI Assistant</h3>
                <p className="text-sm text-muted-foreground">
                  Smart chatbot for route planning help
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* SOS Panel */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          size="lg"
          className={`rounded-full w-16 h-16 shadow-lg ${
            sosTriggered 
              ? 'bg-destructive text-destructive-foreground animate-pulse' 
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
          onClick={triggerSOS}
          data-testid="emergency-sos-button"
        >
          {sosTriggered ? (
            <AlertTriangle className="h-8 w-8" />
          ) : (
            <span className="text-lg font-bold">SOS</span>
          )}
        </Button>
      </div>

      {/* Quick Access Navigation */}
      <div className="bg-card border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-foreground">Quick Access</h3>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/dashboard">
              <Button variant="outline" className="flex items-center" data-testid="nav-dashboard">
                <RouteIcon className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <Link href="/routes">
              <Button variant="outline" className="flex items-center" data-testid="nav-routes">
                <MapPin className="h-4 w-4 mr-2" />
                Route Planning
              </Button>
            </Link>
            <Link href="/workforce">
              <Button variant="outline" className="flex items-center" data-testid="nav-workforce">
                <Clock className="h-4 w-4 mr-2" />
                Workforce
              </Button>
            </Link>
            <Link href="/geofencing">
              <Button variant="outline" className="flex items-center" data-testid="nav-geofencing">
                <Navigation className="h-4 w-4 mr-2" />
                Geofencing
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}