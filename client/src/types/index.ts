export interface Location {
  lat: number;
  lng: number;
  address?: string;
}

export interface RoutePreferences {
  prioritizeSafety: boolean;
  avoidTolls: boolean;
  fastest: boolean;
  vehicleType: 'car' | 'motorcycle' | 'truck' | 'bus';
}

export interface RouteOption {
  id: string;
  name: string;
  distance: string;
  duration: string;
  safetyScore: number;
  type: 'recommended' | 'fastest' | 'scenic';
}

export interface DashboardStats {
  activeRoutes: number;
  onlineEmployees: number;
  geofenceAlerts: number;
  safetyScore: number;
  presentToday: number;
  lateArrivals: number;
  absent: number;
  onField: number;
}

export interface SystemStatus {
  mapMyIndiaApi: 'online' | 'offline' | 'warning';
  firebaseConnection: 'online' | 'offline' | 'warning';
  aiRouteEngine: 'online' | 'offline' | 'warning';
  geofencingService: 'online' | 'offline' | 'warning';
}

// Speech Recognition types for browser compatibility
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

declare class SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  start(): void;
  stop(): void;
}

interface SpeechRecognitionResult {
  readonly [index: number]: SpeechRecognitionAlternative;
  readonly length: number;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionResultList {
  readonly [index: number]: SpeechRecognitionResult;
  readonly length: number;
}
