import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const stockAPI = axios.create({
  baseURL: `${API_BASE_URL}/stock`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token automatiquement
stockAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('jj_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur pour gérer les erreurs d'authentification
stockAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      localStorage.removeItem('jj_auth_token');
      localStorage.removeItem('jj_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const stockService = {
  // Récupérer les éléments de stock groupés
  getGroupedItems: async (category?: string, limit?: number) => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (limit) params.append('limit', limit.toString());
    
    const response = await stockAPI.get(`/items/grouped?${params}`);
    return response.data;
  },

  // Récupérer les alertes de stock
  getAlerts: async () => {
    const response = await stockAPI.get('/alerts');
    return response.data;
  },

  // Récupérer les compteurs par catégorie
  getCategoryCounts: async () => {
    const response = await stockAPI.get('/items/counts');
    return response.data;
  },

  // Récupérer les mouvements de stock
  getMovements: async (stockItemId?: string, limit?: number) => {
    const params = new URLSearchParams();
    if (stockItemId) params.append('stockItemId', stockItemId);
    if (limit) params.append('limit', limit.toString());
    
    const response = await stockAPI.get(`/movements?${params}`);
    return response.data;
  },

  // Récupérer la disponibilité à une date
  getAvailability: async (date: string, category?: string, searchTerm?: string) => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (searchTerm) params.append('reference', searchTerm);
    
    const response = await stockAPI.get(`/availability/${date}?${params}`);
    return response.data;
  },

  // Créer un élément de stock
  createItem: async (data: any) => {
    const response = await stockAPI.post('/items', data);
    return response.data;
  },

  // Mettre à jour un élément de stock
  updateItem: async (itemId: string, data: any) => {
    const response = await stockAPI.put(`/items/${itemId}`, data);
    return response.data;
  },

  // Supprimer un élément de stock
  deleteItem: async (itemId: string) => {
    const response = await stockAPI.delete(`/items/${itemId}`);
    return response.data;
  },

  // Ajouter un mouvement de stock
  addMovement: async (data: any) => {
    const response = await stockAPI.post('/movements', data);
    return response.data;
  },
};