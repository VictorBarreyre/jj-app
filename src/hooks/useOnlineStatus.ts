import { useEffect } from 'react'
import { useAppStore } from '@/store/app.store'
import toast from 'react-hot-toast'

export const useOnlineStatus = () => {
  const setOnlineStatus = useAppStore((state) => state.setOnlineStatus)
  const isOnline = useAppStore((state) => state.isOnline)

  useEffect(() => {
    const handleOnline = () => {
      setOnlineStatus(true)
      toast.success('Connexion rétablie')
    }

    const handleOffline = () => {
      setOnlineStatus(false)
      toast.error('Connexion perdue - Mode hors ligne activé')
    }

    // Set initial state
    setOnlineStatus(navigator.onLine)

    // Listen for changes
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [setOnlineStatus])

  return isOnline
}