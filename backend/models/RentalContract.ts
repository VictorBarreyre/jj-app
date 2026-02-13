// Types pour les modes de paiement
export type PaymentMethod = 'especes' | 'carte' | 'virement' | 'cheque' | 'autre';

// Type pour les chaussures
export type ChaussuresType = 'V' | 'NV'; // Vernies ou Non Vernies

// Interface pour les articles de stock utilisés dans un contrat
export interface ContractStockItem {
  stockItemId: string;
  reference: string;
  taille: string;
  couleur?: string;
  quantiteReservee: number;
  prix: number;
}

// Interface pour le client
export interface ClientInfo {
  nom: string;
  prenom?: string;
  telephone: string;
  email?: string;
  isExistingClient?: boolean;
  clientId?: string;
}

// Interface pour une tenue avec toutes ses pièces
export interface TenueInfo {
  veste?: {
    reference: string;
    taille: string;
    longueur?: string; // Optionnel comme dans le frontend
    longueurManche?: string;
    couleur?: string;
    notes?: string;
  };
  gilet?: {
    reference: string;
    taille: string;
    couleur?: string;
    notes?: string;
  };
  pantalon?: {
    reference: string;
    taille: string;
    longueur?: string; // Optionnel comme dans le frontend
    couleur?: string;
    notes?: string;
  };
  ceinture?: {
    reference: string;
    taille: string;
    couleur?: string;
  };
  tailleChapeau?: string;
  tailleChaussures?: string;
  chaussuresType?: ChaussuresType; // V = Vernies, NV = Non Vernies
}

// Interface pour le tracking des paiements
export interface PaymentInfo {
  date?: string;
  method?: PaymentMethod;
  amount?: number;
}

// Interface pour le bon de location
export interface RentalContract {
  id: string;
  numero: string;
  
  // Dates
  dateCreation: string;
  dateEvenement: string;
  dateRetrait: string;
  dateRetour: string;
  
  // Personnes
  client: ClientInfo;
  vendeur: string;
  
  // Produits
  tenue: TenueInfo;
  articlesStock?: ContractStockItem[];  // Articles de stock réservés
  notes?: string;
  
  // Financier
  tarifLocation: number;
  depotGarantie: number;
  arrhes: number;

  // Journées supplémentaires
  journeesSupplementaires?: {
    nombre: number;
    articles: string;  // 'chemise' | 'chemise_bm' | 'chemise_bm_ndpap' | 'chemise_ndpap'
    prix: number;
  };
  
  // Paiements
  paiementArrhes?: PaymentInfo;
  paiementSolde?: PaymentInfo;
  paiementDepotGarantie?: PaymentInfo;

  // Retour
  rendu: boolean;
  dateRendu?: string;
  
  // Statut
  status: 'brouillon' | 'confirme' | 'rendu' | 'livree';
  
  // Type d'événement
  type: 'individuel' | 'groupe';
  
  // Informations de groupe (si applicable)
  isGroup?: boolean;
  participantCount?: number;
  groupDetails?: {
    participants: Array<{
      nom: string;
      prenom?: string;
      tenue: TenueInfo;
      pieces: string[];
      notes?: string;
    }>;
  };
  
  // Métadonnées
  createdAt: string;
  updatedAt: string;
}

export type CreateRentalContractData = Omit<RentalContract, 'id' | 'numero' | 'createdAt' | 'updatedAt'>;
export type UpdateRentalContractData = Partial<CreateRentalContractData>;

// Interface pour la numérotation
export interface ContractNumbering {
  year: number;
  lastNumber: number;
  prefix?: string;
}