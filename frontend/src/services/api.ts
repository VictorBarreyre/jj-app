import axios, { AxiosResponse } from 'axios';
import { Order } from '@/types/order';
import { MeasurementForm } from '@/types/measurement-form';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour la gestion d'erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface OrdersResponse {
  orders: Order[];
  total: number;
}

export interface MeasurementsResponse {
  measurements: MeasurementForm[];
  total: number;
}

// Orders API
export const ordersAPI = {
  getAll: async (params?: { status?: string; search?: string }): Promise<OrdersResponse> => {
    const response: AxiosResponse<OrdersResponse> = await api.get('/orders', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Order> => {
    const response: AxiosResponse<Order> = await api.get(`/orders/${id}`);
    return response.data;
  },

  create: async (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> => {
    const response: AxiosResponse<Order> = await api.post('/orders', orderData);
    return response.data;
  },

  update: async (id: string, orderData: Partial<Order>): Promise<Order> => {
    const response: AxiosResponse<Order> = await api.put(`/orders/${id}`, orderData);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/orders/${id}`);
  }
};

// Measurements API
export const measurementsAPI = {
  getAll: async (): Promise<MeasurementsResponse> => {
    const response: AxiosResponse<MeasurementsResponse> = await api.get('/measurements');
    return response.data;
  },

  getById: async (id: string): Promise<MeasurementForm> => {
    const response: AxiosResponse<MeasurementForm> = await api.get(`/measurements/${id}`);
    return response.data;
  },

  create: async (measurementData: Omit<MeasurementForm, 'id' | 'createdAt' | 'updatedAt'>): Promise<MeasurementForm> => {
    const response: AxiosResponse<MeasurementForm> = await api.post('/measurements', measurementData);
    return response.data;
  },

  saveDraft: async (measurementData: Omit<MeasurementForm, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<MeasurementForm>> => {
    const response: AxiosResponse<ApiResponse<MeasurementForm>> = await api.post('/measurements/save-draft', measurementData);
    return response.data;
  },

  submit: async (measurementData: Omit<MeasurementForm, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<MeasurementForm>> => {
    const response: AxiosResponse<ApiResponse<MeasurementForm>> = await api.post('/measurements/submit', measurementData);
    return response.data;
  },

  update: async (id: string, measurementData: Partial<MeasurementForm>): Promise<MeasurementForm> => {
    const response: AxiosResponse<MeasurementForm> = await api.put(`/measurements/${id}`, measurementData);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/measurements/${id}`);
  }
};

// Health check
export const healthCheck = async (): Promise<{ status: string; timestamp: string }> => {
  const response = await api.get('/health');
  return response.data;
};