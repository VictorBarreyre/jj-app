import axios from 'axios';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '@/types/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const authAPI = axios.create({
  baseURL: `${API_BASE_URL}/auth`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token automatiquement
authAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('jj_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur pour gérer les erreurs d'authentification
authAPI.interceptors.response.use(
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

export const authService = {
  // Connexion
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await authAPI.post<AuthResponse>('/login', credentials);
    return response.data;
  },

  // Inscription
  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    const response = await authAPI.post<AuthResponse>('/register', userData);
    return response.data;
  },

  // Récupérer les informations utilisateur
  me: async (): Promise<User> => {
    const response = await authAPI.get<User>('/me');
    return response.data;
  },

  // Déconnexion
  logout: async (): Promise<void> => {
    await authAPI.post('/logout');
  },

  // Sauvegarder le token
  setToken: (token: string) => {
    localStorage.setItem('jj_auth_token', token);
  },

  // Récupérer le token
  getToken: (): string | null => {
    return localStorage.getItem('jj_auth_token');
  },

  // Supprimer le token
  removeToken: () => {
    localStorage.removeItem('jj_auth_token');
    localStorage.removeItem('jj_user');
  },

  // Sauvegarder les données utilisateur
  setUser: (user: User) => {
    localStorage.setItem('jj_user', JSON.stringify(user));
  },

  // Récupérer les données utilisateur
  getUser: (): User | null => {
    const userData = localStorage.getItem('jj_user');
    return userData ? JSON.parse(userData) : null;
  },
};