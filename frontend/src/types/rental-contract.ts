import { MeasurementClientInfo, TenueMeasurement, Vendeur } from './measurement-form';

// Types pour les modes de paiement
export type PaymentMethod = 'especes' | 'carte' | 'virement' | 'cheque' | 'autre';

// Interface pour le tracking des paiements
export interface PaymentInfo {
  date?: Date;
  method?: PaymentMethod;
  amount: number;
}

// Interface pour le bon de location complet
export interface RentalContract {
  // Identification du bon
  id?: string;
  numero: string; // Format: 2024-00001 ou juste numéroté
  
  // Dates importantes
  dateCreation: Date;
  dateEvenement: Date;
  dateRetrait: Date; // À prendre dès 9h le
  dateRetour: Date;  // À rendre dès 9h le
  
  // Client et vendeur
  client: MeasurementClientInfo;
  vendeur: Vendeur;
  
  // Tenue et mesures
  tenue: TenueMeasurement;
  notes?: string;
  
  // Tarification
  tarifLocation: number;        // Tarif de location en euros
  depotGarantie: number;       // Dépôt de garantie en euros
  arrhes: number;              // Arrhes en euros
  
  // Suivi des paiements
  paiementArrhes?: PaymentInfo;    // Paiement des arrhes
  paiementSolde?: PaymentInfo;     // Paiement du solde
  
  // Suivi du retour
  rendu: boolean;
  dateRendu?: Date;
  
  // Métadonnées
  createdAt: Date;
  updatedAt: Date;
  status: 'brouillon' | 'confirme' | 'retire' | 'rendu' | 'annule';
}

// Interface pour la création d'un bon de location
export type CreateRentalContract = Omit<RentalContract, 'id' | 'numero' | 'createdAt' | 'updatedAt'>;

// Interface pour les données d'impression
export interface PrintData {
  contract: RentalContract;
  printType: 'jj' | 'client'; // JJ avec tailles, client sans tailles
}

// Interface pour les statistiques de numérotation
export interface ContractNumbering {
  year: number;
  lastNumber: number;
  prefix?: string; // Optionnel: "JJ-" ou juste l'année
}