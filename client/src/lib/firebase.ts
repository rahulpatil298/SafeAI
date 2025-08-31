import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, collection, addDoc, onSnapshot, serverTimestamp, query, orderBy, limit } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}


export class FirebaseService {
  private config: FirebaseConfig;
  private app: FirebaseApp | null = null;
  private db: Firestore | null = null;
  private auth: Auth | null = null;

  constructor() {
    this.config = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
      appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
    };
  }

  async initialize() {
    try {
      if (!this.config.apiKey || !this.config.projectId || !this.config.appId) {
        console.warn("Firebase configuration incomplete, using mock mode");
        return;
      }

      this.app = initializeApp(this.config);
      this.db = getFirestore(this.app);
      this.auth = getAuth(this.app);
      
      // ✅ Added console.log for successful connection
      console.log("✅ Firebase initialized successfully.");
    } catch (error) {
      console.error("❌ Firebase initialization error:", error);
      // ✅ Added console.log for connection failure
      console.log("❌ Failed to connect to Firebase.");
    }
  }

  async subscribeToAttendanceUpdates(callback: (data: any) => void) {
    if (!this.db) {
      console.warn("Firebase not initialized, simulating updates");
      setInterval(() => {
        callback({
          type: 'attendance_update',
          data: { employeeId: 'emp1', status: 'check_in', timestamp: new Date() }
        });
      }, 30000);
      return;
    }

    try {
      const attendanceRef = collection(this.db, 'attendance');
      const q = query(attendanceRef, orderBy('timestamp', 'desc'), limit(10));
      
      return onSnapshot(q, (querySnapshot) => {
        querySnapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            callback({
              type: 'attendance_update',
              data: change.doc.data()
            });
          }
        });
      });
    } catch (error) {
      console.error("Error subscribing to attendance updates:", error);
    }
  }

  async subscribeToGeofenceAlerts(callback: (data: any) => void) {
    if (!this.db) {
      console.warn("Firebase not initialized");
      return;
    }

    try {
      const alertsRef = collection(this.db, 'geofence_alerts');
      const q = query(alertsRef, orderBy('timestamp', 'desc'), limit(5));
      
      return onSnapshot(q, (querySnapshot) => {
        querySnapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            callback({
              type: 'geofence_alert',
              data: change.doc.data()
            });
          }
        });
      });
    } catch (error) {
      console.error("Error subscribing to geofence alerts:", error);
    }
  }

  async saveAttendanceRecord(record: any) {
    if (!this.db) {
      console.log("Firebase not initialized, simulating save:", record);
      return;
    }

    try {
      const attendanceRef = collection(this.db, 'attendance');
      await addDoc(attendanceRef, {
        ...record,
        timestamp: serverTimestamp(),
      });
      console.log("Attendance record saved to Firebase");
    } catch (error) {
      console.error("Error saving attendance record:", error);
    }
  }

  async saveGeofenceViolation(violation: any) {
    if (!this.db) {
      console.log("Firebase not initialized, simulating save:", violation);
      return;
    }

    try {
      const alertsRef = collection(this.db, 'geofence_alerts');
      await addDoc(alertsRef, {
        ...violation,
        timestamp: serverTimestamp(),
      });
      console.log("Geofence violation saved to Firebase");
    } catch (error) {
      console.error("Error saving geofence violation:", error);
    }
  }

  async saveEmergencyAlert(location: any, userId: string, message: string) {
    if (!this.db) {
      console.log("Firebase not initialized, simulating emergency alert save");
      return;
    }

    try {
      const emergencyRef = collection(this.db, 'emergency_alerts');
      await addDoc(emergencyRef, {
        location,
        userId,
        message,
        type: 'sos',
        timestamp: serverTimestamp(),
      });
      console.log("Emergency alert saved to Firebase");
    } catch (error) {
      console.error("Error saving emergency alert:", error);
    }
  }

  async shareLocationWithContacts(location: any, userId: string, contacts: string[]) {
    if (!this.db) {
      console.log("Firebase not initialized, simulating location share");
      return;
    }

    try {
      const locationShareRef = collection(this.db, 'shared_locations');
      await addDoc(locationShareRef, {
        location,
        userId,
        contacts,
        timestamp: serverTimestamp(),
      });
      console.log("Location shared via Firebase");
    } catch (error) {
      console.error("Error sharing location:", error);
    }
  }
}

export const firebaseService = new FirebaseService();