import { useEffect, useState, useCallback } from "react";
import { mapMyIndiaService } from "@/lib/mapmyindia";
import type { Location, RoutePreferences } from "@/types";

export function useMapMyIndia() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const calculateRoute = useCallback(async (start: Location, end: Location, preferences: RoutePreferences) => {
    try {
      return await mapMyIndiaService.calculateRoute(start, end, preferences);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Route calculation failed");
      return [];
    }
  }, []);

  const initializeMap = useCallback(async (containerId: string, options?: any, type?: 'route' | 'geofence' | 'employee') => {
    try {
      return await mapMyIndiaService.initializeMap(containerId, options, type);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Map initialization failed");
      return null;
    }
  }, []);

  const searchPlaces = useCallback(async (query: string) => {
    try {
      return await mapMyIndiaService.searchPlaces(query);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Place search failed");
      return [];
    }
  }, []);

  const createGeofence = useCallback((center: Location, radius: number) => {
    try {
      return mapMyIndiaService.createGeofence(center, radius);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Geofence creation failed");
      return null;
    }
  }, []);

  return {
    isLoaded,
    error,
    calculateRoute,
    initializeMap,
    searchPlaces,
    createGeofence,
    mapMyIndiaService
  };
}
