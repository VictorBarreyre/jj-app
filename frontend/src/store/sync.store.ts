import { create } from 'zustand';

interface SyncStore {
  vendor: string | null;
  deviceType: 'tablet' | 'desktop';
  isOnline: boolean;
  pendingSync: any[];
  setVendor: (vendor: string) => void;
  addPendingSync: (data: any) => void;
}

// hooks/useRealtimeSync.ts
export const useRealtimeSync = () => {
  // WebSocket ou SSE pour sync temps réel
  // Fallback sur polling si nécessaire
};