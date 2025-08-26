import { apiClient } from './api-client';
import { GroupRentalInfo } from '@/types/group-rental';

export interface CreateGroupRentalRequest {
  groupName: string;
  telephone: string;
  email?: string;
  dateEssai: string; // ISO string
  vendeur: string;
  clients: Array<{
    nom: string;
    telephone?: string; // Optionnel maintenant
    email?: string;
    isExistingClient?: boolean;
    clientId?: string;
    tenue: any;
    notes?: string;
  }>;
  groupNotes?: string;
}

export interface UpdateGroupRentalRequest extends Partial<CreateGroupRentalRequest> {}

export interface GroupRentalResponse {
  success: boolean;
  data: GroupRentalInfo;
}

export interface GroupRentalsListResponse {
  success: boolean;
  data: GroupRentalInfo[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface GroupRentalFilters {
  status?: 'brouillon' | 'complete' | 'transmise';
  vendeur?: string;
  limit?: number;
  page?: number;
}

class GroupRentalApi {
  private baseUrl = '/api/group-rentals';

  async create(data: CreateGroupRentalRequest): Promise<GroupRentalResponse> {
    const response = await apiClient.post(this.baseUrl, data);
    return response.data;
  }

  async getAll(filters: GroupRentalFilters = {}): Promise<GroupRentalsListResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
    
    const response = await apiClient.get(url);
    return response.data;
  }

  async getById(id: string): Promise<GroupRentalResponse> {
    const response = await apiClient.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async update(id: string, data: UpdateGroupRentalRequest): Promise<GroupRentalResponse> {
    const response = await apiClient.put(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async updateStatus(id: string, status: 'brouillon' | 'complete' | 'transmise'): Promise<GroupRentalResponse> {
    const response = await apiClient.patch(`${this.baseUrl}/${id}/status`, { status });
    return response.data;
  }
}

export const groupRentalApi = new GroupRentalApi();