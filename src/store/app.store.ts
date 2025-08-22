import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type DeviceType = 'mobile' | 'tablet' | 'desktop'
export type UserRole = 'vendor' | 'cashier' | 'admin'

interface Vendor {
  id: string
  name: string
}

interface AppState {
  // Device & User
  deviceType: DeviceType
  currentVendor: Vendor | null
  userRole: UserRole
  
  // App State
  isOnline: boolean
  isSyncing: boolean
  lastSyncTime: Date | null
  
  // Actions
  setDeviceType: (type: DeviceType) => void
  setCurrentVendor: (vendor: Vendor | null) => void
  setUserRole: (role: UserRole) => void
  setOnlineStatus: (status: boolean) => void
  setSyncStatus: (status: boolean) => void
  updateLastSyncTime: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial state
      deviceType: 'desktop',
      currentVendor: null,
      userRole: 'vendor',
      isOnline: true,
      isSyncing: false,
      lastSyncTime: null,
      
      // Actions
      setDeviceType: (type) => set({ deviceType: type }),
      setCurrentVendor: (vendor) => set({ currentVendor: vendor }),
      setUserRole: (role) => set({ userRole: role }),
      setOnlineStatus: (status) => set({ isOnline: status }),
      setSyncStatus: (status) => set({ isSyncing: status }),
      updateLastSyncTime: () => set({ lastSyncTime: new Date() }),
    }),
    {
      name: 'jj-app-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentVendor: state.currentVendor,
        userRole: state.userRole,
      }),
    }
  )
)