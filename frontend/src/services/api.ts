import axios, { AxiosResponse } from 'axios';
import { MeasurementForm } from '@/types/measurement-form';
import { RentalContract } from '@/types/rental-contract';

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

export interface MeasurementsResponse {
  measurements: MeasurementForm[];
  total: number;
}

export interface ContractsResponse {
  contracts: RentalContract[];
  total: number;
  numbering: {
    year: number;
    lastNumber: number;
    prefix?: string;
  };
}

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

// Rental Contracts API
export const contractsAPI = {
  getAll: async (params?: { status?: string; search?: string; dateStart?: string; dateEnd?: string }): Promise<ContractsResponse> => {
    const response: AxiosResponse<ContractsResponse> = await api.get('/contracts', { params });
    return response.data;
  },

  getById: async (id: string): Promise<RentalContract> => {
    const response: AxiosResponse<RentalContract> = await api.get(`/contracts/${id}`);
    return response.data;
  },

  create: async (contractData: Omit<RentalContract, 'id' | 'numero' | 'createdAt' | 'updatedAt'>): Promise<RentalContract> => {
    const response: AxiosResponse<RentalContract> = await api.post('/contracts', contractData);
    return response.data;
  },

  update: async (id: string, contractData: Partial<RentalContract>): Promise<RentalContract> => {
    const response: AxiosResponse<RentalContract> = await api.put(`/contracts/${id}`, contractData);
    return response.data;
  },

  recordPayment: async (id: string, paymentData: { type: 'arrhes' | 'solde'; amount: number; method: string; date?: string }): Promise<RentalContract> => {
    const response: AxiosResponse<RentalContract> = await api.post(`/contracts/${id}/payment`, paymentData);
    return response.data;
  },

  markAsReturned: async (id: string, dateRetour?: string): Promise<RentalContract> => {
    const response: AxiosResponse<RentalContract> = await api.post(`/contracts/${id}/return`, { dateRetour });
    return response.data;
  },

  getPrintData: async (id: string, type: 'jj' | 'client'): Promise<{ contract: RentalContract; printType: string; printedAt: string }> => {
    const response = await api.get(`/contracts/${id}/print/${type}`);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/contracts/${id}`);
  }
};

// Health check
export const healthCheck = async (): Promise<{ status: string; timestamp: string }> => {
  const response = await api.get('/health');
  return response.data;
};