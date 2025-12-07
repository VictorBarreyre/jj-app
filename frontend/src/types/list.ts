// Interface pour une liste de commandes
export interface List {
  _id: string;
  numero: string; // Numéro unique de la liste (ex: L-2025-001)
  name: string;
  description?: string;
  color: string;
  contractIds: string[];
  createdAt: string;
  updatedAt: string;
}

// Interface pour créer une liste
export interface CreateListRequest {
  name: string;
  description?: string;
  color?: string;
}

// Interface pour mettre à jour une liste
export interface UpdateListRequest {
  name?: string;
  description?: string;
  color?: string;
}
