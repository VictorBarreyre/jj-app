// Interface pour un participant dans une liste
export interface ListParticipant {
  contractId: string;
  role?: string; // Ex: "Marié", "Père du marié", "Témoin"
  order: number; // Position dans la liste (1, 2, 3...)
}

// Interface pour une liste de commandes
export interface List {
  _id: string;
  numero: string; // Numéro unique de la liste (ex: L-2025-001)
  name: string;
  description?: string;
  telephone?: string; // Numéro de téléphone de contact
  dateEvenement?: string; // Date de l'événement
  color: string;
  contractIds: string[];
  participants?: ListParticipant[]; // Structure avec rôles
  createdAt: string;
  updatedAt: string;
}

// Interface pour créer une liste
export interface CreateListRequest {
  name: string;
  description?: string;
  telephone?: string;
  dateEvenement?: string;
  color?: string;
}

// Interface pour mettre à jour une liste
export interface UpdateListRequest {
  name?: string;
  description?: string;
  telephone?: string;
  dateEvenement?: string;
  color?: string;
  participants?: ListParticipant[];
}
