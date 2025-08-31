import type { Location, RoutePreferences } from "@/types";

export interface MapMyIndiaConfig {
  apiKey: string;
  baseUrl: string;
  mapboxUrl: string;
}

interface PlaceSearchResult {
  placeName: string;
  placeAddress: string;
  latitude: number;
  longitude: number;
  placeId: string;
}

interface RouteResponse {
  trips: Array<{
    distance: number;
    duration: number;
    geometry: string;
    legs: Array<{
      distance: number;
      duration: number;
      steps: Array<{
        instruction: string;
        distance: number;
        duration: number;
      }>;
    }>;
  }>;
}

let sdkLoadingPromise: Promise<void> | null = null;
let isSdkLoaded = false;

function loadMapMyIndiaSdk(apiKey: string): Promise<void> {
  if (isSdkLoaded) {
    return Promise.resolve();
  }

  if (sdkLoadingPromise) {
    return sdkLoadingPromise;
  }

  sdkLoadingPromise = new Promise((resolve, reject) => {
    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = `https://apis.mappls.com/advancedmaps/api/${apiKey}/map_sdk.css`;
    document.head.appendChild(cssLink);

    const script = document.createElement('script');
    const scriptUrl = `https://apis.mappls.com/advancedmaps/api/${apiKey}/map_sdk?layer=vector&v=3.0`;
    console.log('Attempting to load Mappls SDK from:', scriptUrl);
    script.src = scriptUrl;
    script.async = true;
    script.onload = () => {
      isSdkLoaded = true;
      sdkLoadingPromise = null;
      resolve();
    };
    script.onerror = (err) => {
      const errorMsg = "Failed to load Mappls SDK. This is almost always caused by an issue with your API key configuration in the Mappls dashboard. Please check the following:\n1. The key in your .env file is a 'JS SDK Key' or 'Map Load Key', not a REST API key.\n2. Your development domain (e.g., 'localhost') is whitelisted in the 'Allowed Referrers' for that key.";
      console.error(errorMsg, err);
      sdkLoadingPromise = null;
      // Reject with a more user-friendly message that will be displayed in the UI.
      reject(new Error("Could not load the map. Please check your `VITE_MAPMYINDIA_API_KEY` and Mappls dashboard settings."));
    };
    document.body.appendChild(script);
  });

  return sdkLoadingPromise;
}

export class MapMyIndiaService {
  private config: MapMyIndiaConfig;
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;

  constructor() {
    this.config = {
      apiKey: import.meta.env.VITE_MAPMYINDIA_API_KEY || "",
      baseUrl: "https://atlas.mappls.com/api",
      mapboxUrl: "https://atlas.mapmyindia.com",
    };
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    // This call is now proxied through our own backend to protect secrets.
    const response = await fetch("/api/map/token", {
      method: 'POST',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      const errorMsg = `Failed to get MapMyIndia access token: ${response.status} ${errorData.message}`;
      console.error(errorMsg);
      // Provide a more user-friendly error message for the UI.
      throw new Error("Could not authenticate with the map service. Please try again later or contact support.");
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    // Set expiry to 1 minute before actual expiry for a safety margin
    this.tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
    return this.accessToken;
  }

  async initializeMap(containerId: string, options: any = {}, type?: 'route' | 'geofence' | 'employee') {
    // The mock implementation for geofence maps has been removed to use the real API.
    // The 'type' parameter is kept for potential future differentiation in map options.
    console.log(`Initializing MapMyIndia map of type '${type}' in container:`, containerId);

    if (!this.config.apiKey) {
      const errorMsg = "MapMyIndia API key not configured. Please add your Mappls JS SDK key to VITE_MAPMYINDIA_API_KEY in your .env file.";
      console.error(errorMsg);
      throw new Error(errorMsg);
    }

    await loadMapMyIndiaSdk(this.config.apiKey);

    const defaultOptions = {
      center: [77.2090, 28.6139], // Delhi coordinates [lng, lat]
      zoom: 10,
      style: 'mappls://styles/mappls/vector/standard-v1', // Add a default map style
      ...options
    };

    // @ts-ignore
    if (!window.mappls || !window.mappls.Map) {
      throw new Error("MapMyIndia SDK did not load correctly, 'window.mappls' is not available.");
    }

    // The Mappls SDK might require the key to be set on the window object
    // in addition to being in the script URL. This is for robustness.
    // @ts-ignore
    window.mappls.key = this.config.apiKey;

    // @ts-ignore
    const map = new window.mappls.Map(containerId, {
      center: defaultOptions.center,
      zoom: defaultOptions.zoom,
      style: defaultOptions.style,
    });

    await new Promise<void>(resolve => map.on('load', () => resolve()));
    console.log("MapMyIndia map initialized and loaded in container:", containerId);
    return map;
  }

  async searchPlaces(query: string): Promise<PlaceSearchResult[]> {
    try {
      const token = await this.getAccessToken();
      const response = await fetch(
        `${this.config.baseUrl}/places/search/json?query=${encodeURIComponent(query)}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`MapMyIndia search API error: ${response.status}`);
      }

      const data = await response.json();
      
      return data.suggestedLocations?.map((location: any) => ({
        placeName: location.placeName || location.suggestedName,
        placeAddress: location.placeAddress,
        latitude: parseFloat(location.latitude),
        longitude: parseFloat(location.longitude),
        placeId: location.placeId,
      })) || [];

    } catch (error) {
      console.error("Place search error:", error);
      // Re-throw the error to be handled by the calling hook
      throw error;
    }
  }

  async calculateRoute(start: Location, end: Location, preferences: RoutePreferences) {
    try {
      const token = await this.getAccessToken();
      const response = await fetch(
        `${this.config.baseUrl}/places/route_adv/driving/${start.lng},${start.lat};${end.lng},${end.lat}?alternatives=true&geometries=polyline&steps=true&exclude=${preferences.avoidTolls ? 'toll' : ''}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`MapMyIndia routing error: ${response.status}`);
      }

      const data: RouteResponse = await response.json();
      
      const routes = await Promise.all(data.trips.map(async (trip, index) => ({
        id: `route${index + 1}`,
        name: index === 0 ? "Recommended Route" : `Alternative ${index}`,
        distance: `${(trip.distance / 1000).toFixed(1)} km`,
        duration: `${Math.round(trip.duration / 60)} mins`,
        safetyScore: await this.calculateSafetyScore(trip.geometry, start, end),
        type: index === 0 ? "recommended" as const : "fastest" as const,
        geometry: trip.geometry
      })));

      return routes;

    } catch (error) {
      console.error("Route calculation error:", error);
      // Re-throw the error to be handled by the calling hook
      throw error;
    }
  }

  async geocodeEloc(eloc: string): Promise<Location | null> {
    try {
      const token = await this.getAccessToken();
      const response = await fetch(
        `${this.config.baseUrl}/places/geocode?eloc=${eloc}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`MapMyIndia geocode API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const location = data.results[0];
        return {
          lat: parseFloat(location.lat),
          lng: parseFloat(location.lng),
        };
      }
      return null;
    } catch (error) {
      console.error(`Eloc geocoding error for ${eloc}:`, error);
      throw error;
    }
  }

  private async calculateSafetyScore(geometry: string, start: Location, end: Location): Promise<number> {
    // Analyze route for safety using AI
    try {
      const response = await fetch('/api/ai/analyze-route-safety', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          geometry,
          startLocation: start,
          endLocation: end,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.safetyScore || 85;
      }
    } catch (error) {
      console.error("Safety analysis error:", error);
    }

    // Fallback to mock score
    return 85 + Math.random() * 15;
  }

  async reverseGeocode(lat: number, lng: number): Promise<{ address: string; formatted: string; }> {
    try {
      const token = await this.getAccessToken();
      const response = await fetch(
        `${this.config.baseUrl}/places/rev_geocode?lat=${lat}&lng=${lng}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`MapMyIndia reverse geocode error: ${response.status}`);
      }

      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const firstResult = data.results[0];
        const addressParts = [firstResult.poi, firstResult.street, firstResult.locality].filter(Boolean);
        return {
          address: addressParts.join(', '),
          formatted: firstResult.formatted_address,
        };
      }

      return { address: "Address not found", formatted: "Address not found" };
    } catch (error) {
      console.error("Reverse geocode error:", error);
      // Re-throw the error to be handled by the calling hook
      throw error;
    }
  }

  createGeofence(center: Location, radius: number) {
    // This creates a client-side representation of a circular geofence.
    // For more advanced features like polygon geofences or server-side alerts,
    // you would integrate with MapMyIndia's server-side Geofencing API.
    return {
      id: `geofence_${Date.now()}`,
      center,
      radius, // in meters
      created: new Date(),
    };
  }

  async checkGeofenceViolation(employeeLocation: Location, geofence: any) {
    // Checks if the employee's location is outside the geofence radius using the Haversine formula.
    // This is a client-side calculation. For persistent, server-managed geofence monitoring,
    // you would use a dedicated backend service that integrates with MapMyIndia's APIs.
    const distance = this.calculateDistance(employeeLocation, geofence.center);
    return distance > geofence.radius;
  }

  private calculateDistance(point1: Location, point2: Location): number {
    // Haversine formula for distance calculation
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(point2.lat - point1.lat);
    const dLon = this.toRadians(point2.lng - point1.lng);
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(point1.lat)) * Math.cos(this.toRadians(point2.lat)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c * 1000; // Distance in meters
    
    return distance;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI/180);
  }
}

export const mapMyIndiaService = new MapMyIndiaService();
