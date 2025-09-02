import { apiClient } from './api-client';
import { RentalContract } from '@/types/rental-contract';

export interface CreateRentalContractRequest {
  dateCreation: Date;
  dateEvenement: Date;
  dateRetrait: Date;
  dateRetour?: Date;
  client: {
    nom: string;
    telephone: string;
    email?: string;
  };
  vendeur: string;
  tenue?: any;
  tarifLocation: number;
  depotGarantie: number;
  arrhes: number;
  paiementArrhes?: {
    date: string;
    method?: string;
    amount?: number;
  };
  paiementSolde?: {
    date?: string;
    method?: string;
    amount?: number;
  };
  notes?: string;
  status?: 'brouillon' | 'confirme' | 'livre' | 'rendu';
  articlesStock?: Array<{
    stockItemId: string;
    reference: string;
    quantiteReservee: number;
  }>;
}

export interface RentalContractResponse {
  success: boolean;
  data: RentalContract;
}

export interface RentalContractsListResponse {
  contracts: RentalContract[];
  total: number;
}

class RentalContractApi {
  private baseUrl = '/contracts';

  async create(data: CreateRentalContractRequest): Promise<RentalContract> {
    const response = await apiClient.post(this.baseUrl, data);
    return response.data;
  }

  async getAll(): Promise<RentalContractsListResponse> {
    const response = await apiClient.get(this.baseUrl);
    return response.data;
  }

  async getById(id: string): Promise<RentalContract> {
    const response = await apiClient.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async update(id: string, data: Partial<CreateRentalContractRequest>): Promise<RentalContract> {
    const response = await apiClient.put(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }

  async recordPayment(id: string, payment: {
    type: 'arrhes' | 'solde';
    amount: number;
    method: string;
    date?: string;
  }): Promise<RentalContract> {
    const response = await apiClient.post(`${this.baseUrl}/${id}/payment`, payment);
    return response.data;
  }

  async markAsReturned(id: string, dateRetour?: string): Promise<RentalContract> {
    const response = await apiClient.post(`${this.baseUrl}/${id}/return`, { dateRetour });
    return response.data;
  }

  async getPrintData(id: string, type: 'jj' | 'client'): Promise<any> {
    const response = await apiClient.get(`${this.baseUrl}/${id}/print/${type}`);
    return response.data;
  }
}

export const rentalContractApi = new RentalContractApi();