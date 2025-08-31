import { useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ErrorBoundary } from "@/components/error-boundary";
import { Badge } from "@/components/ui/badge";
import { MapContainer } from "@/components/maps/map-container";
import { useMapMyIndia } from "@/hooks/use-mapmyindia";
import { MapPin, Flag, Search } from "lucide-react";
import type { RoutePreferences, RouteOption } from "@/types";

interface RouteFormData {
  startLocation: string;
  endLocation: string;
  vehicleType: "car" | "motorcycle" | "truck" | "bus";
  prioritizeSafety: boolean;
  avoidTolls: boolean;
  fastest: boolean;
}

export default function RoutePlanning() {
  const [selectedRoute, setSelectedRoute] = useState<string>("route1");
  const [routeOptions, setRouteOptions] = useState<RouteOption[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  
  const { calculateRoute } = useMapMyIndia();
  
  const { register, handleSubmit, setValue, watch } = useForm<RouteFormData>({
    defaultValues: {
      startLocation: "",
      endLocation: "",
      vehicleType: "car",
      prioritizeSafety: true,
      avoidTolls: false,
      fastest: true,
    }
  });

  const onSubmit = async (data: RouteFormData) => {
    setIsCalculating(true);
    
    try {
      // Mock route calculation - in real implementation, this would use MapMyIndia API
      const mockRoutes: RouteOption[] = [
        {
          id: "route1",
          name: "Recommended Route",
          distance: "24.5 km",
          duration: "32 mins",
          safetyScore: 95,
          type: "recommended"
        },
        {
          id: "route2", 
          name: "Fastest Route",
          distance: "22.1 km",
          duration: "28 mins",
          safetyScore: 87,
          type: "fastest"
        },
        {
          id: "route3",
          name: "Scenic Route", 
          distance: "28.7 km",
          duration: "38 mins",
          safetyScore: 92,
          type: "scenic"
        }
      ];
      
      setRouteOptions(mockRoutes);
      setSelectedRoute("route1");
    } catch (error) {
      console.error("Route calculation failed:", error);
    } finally {
      setIsCalculating(false);
    }
  };

  const getRouteBadge = (type: RouteOption["type"]) => {
    switch (type) {
      case "recommended":
        return <Badge className="bg-primary text-primary-foreground">SAFEST</Badge>;
      case "fastest":
        return <Badge className="bg-secondary text-secondary-foreground">FASTEST</Badge>;
      case "scenic":
        return <Badge className="bg-accent text-accent-foreground">SCENIC</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Smart Route Planning</h2>
        <p className="text-muted-foreground">Plan optimized routes with AI-powered safety and efficiency analysis</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Route Planning Form */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">Route Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="startLocation" className="text-sm font-medium text-foreground">
                    Starting Point
                  </Label>
                  <div className="relative mt-2">
                    <Input
                      id="startLocation"
                      placeholder="Enter starting location"
                      {...register("startLocation", { required: true })}
                      data-testid="start-location-input"
                    />
                    <MapPin className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="endLocation" className="text-sm font-medium text-foreground">
                    Destination
                  </Label>
                  <div className="relative mt-2">
                    <Input
                      id="endLocation"
                      placeholder="Enter destination"
                      {...register("endLocation", { required: true })}
                      data-testid="end-location-input"
                    />
                    <Flag className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-foreground">Route Preferences</Label>
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="prioritizeSafety"
                        defaultChecked
                        onCheckedChange={(checked) => setValue("prioritizeSafety", !!checked)}
                        data-testid="prioritize-safety-checkbox"
                      />
                      <Label htmlFor="prioritizeSafety" className="text-sm text-foreground">
                        Prioritize safety
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="avoidTolls"
                        onCheckedChange={(checked) => setValue("avoidTolls", !!checked)}
                        data-testid="avoid-tolls-checkbox"
                      />
                      <Label htmlFor="avoidTolls" className="text-sm text-foreground">
                        Avoid toll roads
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="fastest"
                        defaultChecked
                        onCheckedChange={(checked) => setValue("fastest", !!checked)}
                        data-testid="fastest-route-checkbox"
                      />
                      <Label htmlFor="fastest" className="text-sm text-foreground">
                        Fastest route
                      </Label>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="vehicleType" className="text-sm font-medium text-foreground">
                    Vehicle Type
                  </Label>
                  <Select onValueChange={(value) => setValue("vehicleType", value as any)} defaultValue="car">
                    <SelectTrigger className="mt-2" data-testid="vehicle-type-select">
                      <SelectValue placeholder="Select vehicle type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="car">Car</SelectItem>
                      <SelectItem value="motorcycle">Motorcycle</SelectItem>
                      <SelectItem value="truck">Truck</SelectItem>
                      <SelectItem value="bus">Bus</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  type="submit" 
                  className="w-full btn-hover"
                  disabled={isCalculating}
                  data-testid="find-route-button"
                >
                  <Search className="h-4 w-4 mr-2" />
                  {isCalculating ? "Calculating..." : "Find Best Route"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Route Options */}
          {routeOptions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-foreground">Route Options</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {routeOptions.map((route) => (
                    <Card
                      key={route.id}
                      className={`cursor-pointer transition-colors ${
                        selectedRoute === route.id 
                          ? "border-primary bg-primary/5" 
                          : "hover:bg-muted/50"
                      }`}
                      onClick={() => setSelectedRoute(route.id)}
                      data-testid={`route-option-${route.id}`}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-foreground">{route.name}</span>
                          {getRouteBadge(route.type)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <p>Distance: {route.distance} • Time: {route.duration}</p>
                          <p>Safety Score: {route.safetyScore}%</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Interactive Map */}
        <div className="lg:col-span-2">
          <ErrorBoundary fallbackMessage="The map could not be loaded. Please try again later.">
            <MapContainer
              title="Interactive Map"
              type="route"
              showControls={true}
              showLegend={true}
            />
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}
