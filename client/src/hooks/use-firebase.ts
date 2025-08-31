import { useEffect, useState } from "react";
import { firebaseService } from "@/lib/firebase";

export function useFirebase() {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeFirebase = async () => {
      try {
        await firebaseService.initialize();
        setIsConnected(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Firebase initialization failed");
      }
    };

    initializeFirebase();
  }, []);

  const subscribeToAttendance = (callback: (data: any) => void) => {
    return firebaseService.subscribeToAttendanceUpdates(callback);
  };

  const subscribeToAlerts = (callback: (data: any) => void) => {
    return firebaseService.subscribeToGeofenceAlerts(callback);
  };

  return {
    isConnected,
    error,
    subscribeToAttendance,
    subscribeToAlerts,
    firebaseService
  };
}
