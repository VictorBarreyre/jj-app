import { useEffect } from 'react'
import { useAppStore } from '@/store/app.store'

export const useDeviceDetection = () => {
  const setDeviceType = useAppStore((state) => state.setDeviceType)
  const deviceType = useAppStore((state) => state.deviceType)

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth
      
      if (width < 768) {
        setDeviceType('mobile')
      } else if (width < 1024) {
        setDeviceType('tablet')
      } else {
        setDeviceType('desktop')
      }
    }

    // Check on mount
    checkDevice()

    // Check on resize
    window.addEventListener('resize', checkDevice)
    
    return () => {
      window.removeEventListener('resize', checkDevice)
    }
  }, [setDeviceType])

  return deviceType
}