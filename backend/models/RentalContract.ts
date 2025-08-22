// Types pour les modes de paiement
export type PaymentMethod = 'especes' | 'carte' | 'virement' | 'cheque' | 'autre';

// Interface pour le client
export interface ClientInfo {
  nom: string;
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
    longueur: string;
  };
  gilet?: {
    reference: string;
    taille: string;
  };
  pantalon?: {
    reference: string;
    taille: string;
    longueur: string;
  };
  tailleChapeau?: string;
  tailleChaussures?: string;
}

// Interface pour le tracking des paiements
export interface PaymentInfo {
  date?: string;
  method?: PaymentMethod;
  amount: number;
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
  notes?: string;
  
  // Financier
  tarifLocation: number;
  depotGarantie: number;
  arrhes: number;
  
  // Paiements
  paiementArrhes?: PaymentInfo;
  paiementSolde?: PaymentInfo;
  
  // Retour
  rendu: boolean;
  dateRendu?: string;
  
  // Statut
  status: 'brouillon' | 'confirme' | 'retire' | 'rendu' | 'annule';
  
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