import { List, CreateListRequest, UpdateListRequest } from '@/types/list';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ListsApi {
  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  }

  // Récupérer toutes les listes
  async getAll(): Promise<List[]> {
    const response = await fetch(`${API_BASE}/lists`, {
      headers: this.getHeaders()
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des listes');
    }

    return response.json();
  }

  // Récupérer une liste par ID
  async getById(id: string): Promise<List> {
    const response = await fetch(`${API_BASE}/lists/${id}`, {
      headers: this.getHeaders()
    });

    if (!response.ok) {
      throw new Error('Liste non trouvée');
    }

    return response.json();
  }

  // Créer une nouvelle liste
  async create(data: CreateListRequest): Promise<List> {
    const response = await fetch(`${API_BASE}/lists`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la création de la liste');
    }

    return response.json();
  }

  // Mettre à jour une liste
  async update(id: string, data: UpdateListRequest): Promise<List> {
    const response = await fetch(`${API_BASE}/lists/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la mise à jour de la liste');
    }

    return response.json();
  }

  // Supprimer une liste
  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/lists/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la suppression de la liste');
    }
  }

  // Ajouter un contrat à une liste
  async addContract(listId: string, contractId: string): Promise<List> {
    const response = await fetch(`${API_BASE}/lists/${listId}/contracts/${contractId}`, {
      method: 'POST',
      headers: this.getHeaders()
    });

    if (!response.ok) {
      throw new Error('Erreur lors de l\'ajout du contrat à la liste');
    }

    return response.json();
  }

  // Retirer un contrat d'une liste
  async removeContract(listId: string, contractId: string): Promise<List> {
    const response = await fetch(`${API_BASE}/lists/${listId}/contracts/${contractId}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });

    if (!response.ok) {
      throw new Error('Erreur lors du retrait du contrat de la liste');
    }

    return response.json();
  }

  // Récupérer les listes contenant un contrat spécifique
  async getListsForContract(contractId: string): Promise<List[]> {
    const response = await fetch(`${API_BASE}/lists/contract/${contractId}`, {
      headers: this.getHeaders()
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des listes');
    }

    return response.json();
  }
}

export const listsApi = new ListsApi();
