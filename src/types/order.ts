import { ProductCategory, VesteReference, GiletReference, PantalonReference } from './product-references';

// Interface pour les mesures spécifiques par type de produit
export interface VesteMeasurements {
  // Mesures principales
  longueur?: number;
  poitrine?: number;
  taille?: number;
  epaules?: number;
  manches?: number;
  // Mesures complémentaires
  carrure?: number;
  tourDeCol?: number;
  hauteurPoitrine?: number;
  // Notes spécifiques
  notes?: string;
}

export interface GiletMeasurements {
  // Mesures principales
  longueur?: number;
  poitrine?: number;
  taille?: number;
  // Mesures complémentaires
  carrure?: number;
  hauteurPoitrine?: number;
  // Options
  croise?: boolean;
  // Notes spécifiques
  notes?: string;
}

export interface PantalonMeasurements {
  // Mesures principales
  taille?: number;
  longueur?: number;
  entrejambe?: number;
  tour_de_cuisse?: number;
  tour_de_genou?: number;
  tour_de_cheville?: number;
  // Mesures complémentaires
  montant?: number;
  bassin?: number;
  // Notes spécifiques
  notes?: string;
}

// Interface générique pour un item du bon de commande
export interface OrderItem {
  id: string;
  category: ProductCategory;
  reference: VesteReference | GiletReference | PantalonReference;
  measurements: VesteMeasurements | GiletMeasurements | PantalonMeasurements;
  quantity: number;
  unitPrice?: number;
  totalPrice?: number;
  notes?: string;
}

// Interface pour les informations client
export interface ClientInfo {
  id?: string;
  nom: string;
  prenom?: string;
  telephone?: string;
  email?: string;
  adresse?: {
    rue?: string;
    ville?: string;
    codePostal?: string;
    pays?: string;
  };
}

// Interface pour le bon de commande complet
export interface Order {
  id: string;
  numero: string; // Numéro de commande unique
  client: ClientInfo;
  dateCreation: Date;
  dateLivraison?: Date;
  items: OrderItem[];
  sousTotal?: number;
  tva?: number;
  total?: number;
  status: 'brouillon' | 'confirmee' | 'en_production' | 'prete' | 'livree' | 'annulee';
  notes?: string;
  createdBy?: string; // ID de l'utilisateur qui a créé la commande
  updatedAt?: Date;
}

// Interface pour la création d'une nouvelle commande
export interface CreateOrderRequest {
  client: Omit<ClientInfo, 'id'>;
  items: Omit<OrderItem, 'id'>[];
  dateLivraison?: Date;
  notes?: string;
}

// Interface pour la mise à jour d'une commande
export interface UpdateOrderRequest {
  client?: Partial<ClientInfo>;
  items?: OrderItem[];
  dateLivraison?: Date;
  status?: Order['status'];
  notes?: string;
}

// Types pour les filtres de recherche
export interface OrderFilters {
  status?: Order['status'][];
  dateDebut?: Date;
  dateFin?: Date;
  clientNom?: string;
  numero?: string;
}

// Interface pour les statistiques
export interface OrderStats {
  total: number;
  parStatus: Record<Order['status'], number>;
  chiffreAffaires: number;
  commandesMoyennesParMois: number;
}