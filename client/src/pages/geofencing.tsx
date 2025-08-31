import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GeofenceForm } from "@/components/geofencing/geofence-form";
import { ErrorBoundary } from "@/components/error-boundary";
import { MapContainer } from "@/components/maps/map-container";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  CheckCircle, 
  TriangleAlert, 
  Info,
  AlertTriangle,
  MapPinXInside,
  Eye
} from "lucide-react";
import type { Geofence, InsertGeofence } from "@shared/schema";

export default function Geofencing() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: geofences, isLoading } = useQuery<Geofence[]>({
    queryKey: ["/api/geofences"],
  });

  const { data: alerts } = useQuery({
    queryKey: ["/api/alerts"],
  });

  const createGeofenceMutation = useMutation({
    mutationFn: async (data: InsertGeofence) => {
      return await apiRequest("POST", "/api/geofences", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/geofences"] });
      toast({
        title: "Geofence Created",
        description: "New geofence has been created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create geofence. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGeofenceSubmit = (data: any) => {
    createGeofenceMutation.mutate({
      ...data,
      centerLat: data.centerLat || "19.0760", // Default to Mumbai coordinates
      centerLng: data.centerLng || "72.8777",
    });
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge variant="default" className="bg-success text-success-foreground">Active</Badge>
    ) : (
      <Badge variant="secondary">Inactive</Badge>
    );
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "geofence_violation":
        return <TriangleAlert className="h-4 w-4 text-warning" />;
      case "system_update":
        return <Info className="h-4 w-4 text-primary" />;
      default:
        return <CheckCircle className="h-4 w-4 text-accent" />;
    }
  };

  const getAlertBgColor = (type: string) => {
    switch (type) {
      case "geofence_violation":
        return "bg-warning/10";
      case "system_update":
        return "bg-primary/10";
      default:
        return "bg-accent/10";
    }
  };

  if (isLoading) {
    return (
      <div className="fade-in">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">Geofencing Management</h2>
          <p className="text-muted-foreground">Loading geofencing data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Geofencing Management</h2>
        <p className="text-muted-foreground">Create and manage geofenced zones for workforce tracking</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Geofence Creation Panel */}
        <div className="lg:col-span-1 space-y-6">
          <GeofenceForm 
            onSubmit={handleGeofenceSubmit}
            onLocationSelect={() => console.log("Select location on map")}
          />

          {/* Existing Geofences */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">Active Geofences</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {geofences?.length === 0 ? (
                  <div className="text-center py-4">
                    <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No geofences created yet</p>
                  </div>
                ) : (
                  geofences?.map((geofence: Geofence) => (
                    <Card 
                      key={geofence.id} 
                      className="hover:bg-muted/50 transition-colors cursor-pointer"
                      data-testid={`geofence-card-${geofence.id}`}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-foreground">{geofence.name}</span>
                          {getStatusBadge(geofence.isActive)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <p>Radius: {geofence.radius}m • Type: {geofence.type}</p>
                          <p>Active: {geofence.startTime} - {geofence.endTime}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Map and Analytics */}
        <div className="lg:col-span-2 space-y-6">
          {/* Geofence Map */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-foreground">Geofence Map</CardTitle>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" data-testid="draw-zone-button">
                    <MapPinXInside className="h-4 w-4 mr-1" />
                    Draw Zone
                  </Button>
                  <Button variant="outline" size="sm" data-testid="toggle-view-button">
                    <Eye className="h-4 w-4 mr-1" />
                    Toggle View
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ErrorBoundary fallbackMessage="The map could not be loaded. Please check your API key and network connection.">
                <MapContainer
                  title=""
                  type="geofence"
                  showControls={false}
                  showLegend={true}
                  geofences={geofences}
                />
              </ErrorBoundary>
            </CardContent>
          </Card>

          {/* Geofence Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-foreground">Zone Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Entries Today</span>
                    <span className="font-bold text-xl text-foreground" data-testid="total-entries-today">156</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Exits Today</span>
                    <span className="font-bold text-xl text-foreground" data-testid="total-exits-today">142</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Currently Inside</span>
                    <span className="font-bold text-xl text-accent" data-testid="currently-inside">14</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Violations</span>
                    <span className="font-bold text-xl text-warning" data-testid="violations-count">3</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-foreground">Recent Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {alerts?.slice(0, 3).map((alert: any, index: number) => (
                    <div 
                      key={alert.id || index} 
                      className={`flex items-start space-x-3 p-2 rounded-lg ${getAlertBgColor(alert.type)}`}
                      data-testid={`alert-${index}`}
                    >
                      {getAlertIcon(alert.type)}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{alert.title}</p>
                        <p className="text-xs text-muted-foreground">{alert.message}</p>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-4">
                      <Info className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No recent alerts</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
