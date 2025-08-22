export interface Order {
  id: string;
  numero: string;
  client: {
    nom: string;
    prenom: string;
    telephone: string;
    email?: string;
  };
  dateCommande: string;
  dateEssai?: string;
  dateLivraison?: string;
  status: 'brouillon' | 'en_production' | 'prete' | 'livree';
  articles: {
    type: string;
    taille: string;
    couleur: string;
    prix: number;
    mesures?: Record<string, number>;
  }[];
  montantTotal: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateOrderData = Omit<Order, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateOrderData = Partial<CreateOrderData>;