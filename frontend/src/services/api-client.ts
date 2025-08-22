import axios, { AxiosError } from 'axios'
import toast from 'react-hot-toast'
import { useAppStore } from '@/store/app.store'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add vendor info to headers if available
    const vendor = useAppStore.getState().currentVendor
    if (vendor) {
      config.headers['X-Vendor-Id'] = vendor.id
    }

    // Add auth token if available
    const token = localStorage.getItem('auth-token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const isOnline = useAppStore.getState().isOnline

    if (!isOnline) {
      // Handle offline mode
      toast.error('Action enregistrée pour synchronisation ultérieure')
      // TODO: Add to offline queue
      return Promise.reject(error)
    }

    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Handle unauthorized
          localStorage.removeItem('auth-token')
          window.location.href = '/login'
          break
        case 403:
          toast.error('Accès non autorisé')
          break
        case 404:
          toast.error('Ressource non trouvée')
          break
        case 500:
          toast.error('Erreur serveur')
          break
        default:
          toast.error('Une erreur est survenue')
      }
    } else if (error.request) {
      toast.error('Impossible de contacter le serveur')
    } else {
      toast.error('Une erreur inattendue est survenue')
    }

    return Promise.reject(error)
  }
)