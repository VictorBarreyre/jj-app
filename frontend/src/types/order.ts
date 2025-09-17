import { ProductCategory, VesteReference, GiletReference, PantalonReference, ChapeauReference, ChaussuresReference } from './product-references';

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

export interface ChapeauMeasurements {
  // Mesure principale
  taille?: string; // 54, 55, 56, etc.
  // Notes spécifiques
  notes?: string;
}

export interface ChaussuresMeasurements {
  // Mesure principale
  pointure?: string; // 38, 39, 40, etc.
  // Options
  largeur?: 'standard' | 'large';
  // Notes spécifiques
  notes?: string;
}

// Interface générique pour un item du bon de commande
export interface OrderItem {
  id: string;
  category: ProductCategory;
  reference: VesteReference | GiletReference | PantalonReference | ChapeauReference | ChaussuresReference;
  measurements: VesteMeasurements | GiletMeasurements | PantalonMeasurements | ChapeauMeasurements | ChaussuresMeasurements;
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
  dateCreation: Date | string;
  dateLivraison?: Date | string;
  items: OrderItem[];
  sousTotal?: number;
  tva?: number;
  total?: number;
  status: 'commandee' | 'livree' | 'rendue';
  type: 'individuel' | 'groupe'; // Type de commande
  notes?: string;
  
  // Informations supplémentaires pour les groupes
  participantCount?: number; // Nombre de participants dans le groupe
  groupDetails?: {
    participants: Array<{
      nom: string;
      pieces: string[]; // Liste des pièces de tenue pour ce participant
      notes?: string;
      rendu?: boolean; // Statut de rendu pour ce participant
    }>;
  };
  createdBy?: string; // ID de l'utilisateur qui a créé la commande
  updatedAt?: Date | string;
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