import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMapMyIndia } from "@/hooks/use-mapmyindia";
import { Expand, Layers, Loader2, AlertTriangle } from "lucide-react";
import type { Geofence } from "@shared/schema";

interface MapContainerProps {
  title: string;
  height?: string;
  showControls?: boolean;
  showLegend?: boolean;
  type?: "route" | "geofence" | "employee";
  geofences?: Geofence[];
}

export function MapContainer({ 
  title, 
  height = "500px", 
  showControls = true,
  showLegend = true,
  type = "route",
  geofences
}: MapContainerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const { isLoaded, initializeMap, error, geocodeEloc } = useMapMyIndia();
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [mapId] = useState(() => `map-container-${Math.random().toString(36).slice(2)}`);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const geofenceLayersRef = useRef<any[]>([]);

  useEffect(() => {
    // This effect handles creating and re-creating the map.
    async function setupMap() {
      if (isLoaded && mapRef.current) {
        setIsMapLoading(true);
        try {
          const mapOptions =
            type === "geofence"
              ? {
                  center: [72.8777, 19.0760], // Mumbai [lng, lat]
                  zoom: 11,
                }
              : {};
          const newMap = await initializeMap(mapId, mapOptions, type);
          setMapInstance(newMap);
        } catch (e) {
          // error is already set by the hook
          console.error("Failed to initialize map:", e);
        } finally {
          setIsMapLoading(false);
        }
      }
    }

    setupMap();

  }, [isLoaded, initializeMap, type, mapId]);

  useEffect(() => {
    // This effect handles cleaning up the map instance when it's replaced or the component unmounts.
    return () => {
      // Cleanup function to remove the map instance when the component unmounts or dependencies change
      if (mapInstance && typeof mapInstance.remove === "function") {
        mapInstance.remove();
      }
    };
  }, [mapInstance]);

  // This effect handles drawing geofences on the map
  useEffect(() => {
    if (!mapInstance || !isLoaded || !geofences) {
      return;
    }

    const geofenceLayers = geofenceLayersRef.current;
    // Clear any existing geofence layers to prevent duplicates
    geofenceLayers.forEach(layer => layer.remove());
    geofenceLayersRef.current = [];

    if (geofences.length === 0) {
      return;
    }

    const drawGeofences = async () => {
        try {
            // @ts-ignore
            const bounds = new window.mappls.LngLatBounds();

            for (const geofence of geofences) {
              if (!geofence.isActive || geofence.radius == null) {
                continue;
              }

              let lat: number | undefined;
              let lng: number | undefined;

              if (geofence.eloc) {
                try {
                  const location = await geocodeEloc(geofence.eloc);
                  if (location) {
                    lat = location.lat;
                    lng = location.lng;
                  }
                } catch (e) {
                  console.error(`Failed to geocode eloc ${geofence.eloc} for geofence "${geofence.name}"`, e);
                  continue;
                }
              } else if (geofence.centerLat != null && geofence.centerLng != null) {
                lat = parseFloat(geofence.centerLat);
                lng = parseFloat(geofence.centerLng);
              }

              const radius = parseFloat(String(geofence.radius));

              if (lat == null || lng == null || isNaN(lat) || isNaN(lng) || isNaN(radius)) {
                console.warn(`Skipping geofence "${geofence.name}" due to invalid coordinates or radius.`);
                continue;
              }

              const boundsCenter: [number, number] = [lng, lat]; // LngLatBounds can take an array

              // @ts-ignore
              const circle = new window.mappls.Circle({
                center: { lat: lat, lng: lng },
                radius: radius,
                color: '#4CAF50',
                fillColor: '#4CAF50',
                fillOpacity: 0.2,
                stroke: true,
                weight: 2
              });

              circle.addTo(mapInstance);
              geofenceLayersRef.current.push(circle);
              bounds.extend(boundsCenter);
            }

            if (!bounds.isEmpty()) {
                mapInstance.fitBounds(bounds, { padding: 80 });
            }
        } catch (e: any) {
            console.error("An error occurred while drawing geofences on the map. The map will be displayed, but geofence data may be missing.", e);
        }
    };

    drawGeofences();
  }, [mapInstance, geofences, isLoaded, geocodeEloc]);

  const legendItems = {
    route: [
      { color: "bg-primary", label: "Recommended Route" },
      { color: "bg-secondary", label: "Alternative Routes" },
      { color: "bg-warning", label: "Safety Alerts" },
      { color: "bg-accent", label: "Geofence Zones" }
    ],
    geofence: [
      { color: "bg-accent", label: "Active Geofences" },
      { color: "bg-primary", label: "Employee Locations" },
      { color: "bg-warning", label: "Violation Zones" },
      { color: "bg-secondary", label: "Safe Areas" }
    ],
    employee: [
      { color: "bg-success", label: "Online Employees" },
      { color: "bg-warning", label: "Late Arrivals" },
      { color: "bg-muted-foreground", label: "Offline" },
      { color: "bg-accent", label: "Office Zones" }
    ]
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground">{title}</CardTitle>
          {showControls && (
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                data-testid="map-fullscreen-button"
              >
                <Expand className="h-4 w-4 mr-1" />
                Fullscreen
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                data-testid="map-layers-button"
              >
                <Layers className="h-4 w-4 mr-1" />
                Layers
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative" style={{ height }}>
          {/* Map Container: This div is exclusively for the map library */}
          <div 
            ref={mapRef}
            id={mapId}
            className="map-container h-full w-full bg-muted"
            data-testid="map-container"
          />
          {/* Overlay for Loading/Error states, managed by React */}
          {(isMapLoading || error) && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10" data-testid="map-overlay">
              <div className="text-center p-4 rounded-lg">
                {error ? (
                  <div data-testid="map-error-message">
                    <AlertTriangle className="h-12 w-12 text-destructive mb-4 mx-auto" />
                    <h4 className="text-lg font-medium text-destructive-foreground mb-2">Map Error</h4>
                    <p className="text-muted-foreground max-w-xs">{error}</p>
                  </div>
                ) : (
                  <div data-testid="map-loading-spinner">
                    <Loader2 className="h-12 w-12 text-primary mb-4 mx-auto animate-spin" />
                    <h4 className="text-lg font-medium text-foreground mb-2">Loading Map...</h4>
                    <p className="text-muted-foreground">Initializing interactive map</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Map Legend */}
        {showLegend && (
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            {legendItems[type].map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className={`w-3 h-3 ${item.color} rounded-full`}></div>
                <span className="text-muted-foreground">{item.label}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
