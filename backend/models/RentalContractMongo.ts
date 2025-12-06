import { Schema, model, Document } from 'mongoose';
import { PaymentMethod, ChaussuresType, ClientInfo, TenueInfo, ContractStockItem, PaymentInfo } from './RentalContract';

// Interface pour le document MongoDB
export interface IRentalContractDocument extends Document {
  numero: string;
  
  // Dates
  dateCreation: Date;
  dateEvenement: Date;
  dateRetrait: Date;
  dateRetour: Date;
  
  // Personnes
  client: ClientInfo;
  vendeur: string;
  
  // Produits
  tenue?: TenueInfo;
  articlesStock?: ContractStockItem[];
  notes?: string;
  
  // Financier
  tarifLocation: number;
  depotGarantie: number;
  arrhes: number;
  
  // Paiements
  paiementArrhes?: PaymentInfo;
  paiementSolde?: PaymentInfo;
  paiementDepotGarantie?: PaymentInfo;

  // Retour
  rendu: boolean;
  dateRendu?: Date;
  
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
      rendu?: boolean;
    }>;
  };
  
  // Métadonnées
  createdAt: Date;
  updatedAt: Date;
}

// Schéma pour les informations client
const clientInfoSchema = new Schema<ClientInfo>({
  nom: { type: String, required: true },
  prenom: { type: String },
  telephone: { type: String, required: true },
  email: { type: String },
  isExistingClient: { type: Boolean, default: false },
  clientId: { type: String }
});

// Schéma pour une pièce de tenue
const teenuePieceSchema = new Schema({
  reference: { type: String, required: true },
  taille: { type: String, required: true },
  longueur: { type: String },
  longueurManche: { type: String },
  couleur: { type: String },
  notes: { type: String }
});

// Schéma pour la tenue complète
const tenueSchema = new Schema<TenueInfo>({
  veste: teenuePieceSchema,
  gilet: teenuePieceSchema,
  pantalon: teenuePieceSchema,
  ceinture: teenuePieceSchema, // Ajout de la ceinture
  tailleChapeau: { type: String },
  tailleChaussures: { type: String },
  chaussuresType: {
    type: String,
    enum: ['V', 'NV'] as ChaussuresType[] // V = Vernies, NV = Non Vernies
  }
});

// Schéma pour un article de stock dans le contrat
const contractStockItemSchema = new Schema<ContractStockItem>({
  stockItemId: { type: String, required: true },
  reference: { type: String, required: true },
  taille: { type: String, required: true },
  couleur: { type: String },
  quantiteReservee: { type: Number, required: true },
  prix: { type: Number, required: true }
});

// Schéma pour les informations de paiement
const paymentInfoSchema = new Schema<PaymentInfo>({
  date: { type: String },
  method: {
    type: String,
    enum: ['especes', 'carte', 'virement', 'cheque', 'autre'] as PaymentMethod[]
  },
  amount: { type: Number, required: false }
});

// Schéma principal pour les contrats de location
const rentalContractSchema = new Schema<IRentalContractDocument>({
  numero: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
  
  // Dates
  dateCreation: { type: Date, required: true },
  dateEvenement: { type: Date, required: true },
  dateRetrait: { type: Date, required: true },
  dateRetour: { type: Date, required: true },
  
  // Personnes
  client: { type: clientInfoSchema, required: true },
  vendeur: { type: String, required: true },
  
  // Produits
  tenue: tenueSchema,
  articlesStock: [contractStockItemSchema],
  notes: { type: String },
  
  // Financier
  tarifLocation: { type: Number, required: false, min: 0 },
  depotGarantie: { type: Number, required: false, min: 0, default: 400 },
  arrhes: { type: Number, required: false, min: 0, default: 50 },
  
  // Paiements
  paiementArrhes: paymentInfoSchema,
  paiementSolde: paymentInfoSchema,
  paiementDepotGarantie: paymentInfoSchema,

  // Retour
  rendu: { type: Boolean, default: false },
  dateRendu: { type: Date },
  
  // Statut
  status: {
    type: String,
    enum: ['brouillon', 'confirme', 'rendu', 'livree'],
    default: 'brouillon'
  },
  
  // Type d'événement
  type: {
    type: String,
    enum: ['individuel', 'groupe'],
    default: 'individuel'
  },
  
  // Informations de groupe (si applicable)
  isGroup: { type: Boolean, default: false },
  participantCount: { type: Number },
  groupDetails: {
    participants: [{
      nom: { type: String, required: true },
      prenom: { type: String },
      tenue: tenueSchema,
      pieces: [{ type: String }],
      notes: { type: String },
      rendu: { type: Boolean, default: false }
    }]
  }
}, {
  timestamps: true, // Ajoute automatiquement createdAt et updatedAt
  collection: 'rental_contracts'
});

// Index pour les recherches fréquentes
rentalContractSchema.index({ 'client.nom': 'text', 'client.telephone': 'text' });
rentalContractSchema.index({ dateEvenement: 1 });
rentalContractSchema.index({ status: 1 });
rentalContractSchema.index({ type: 1 });
rentalContractSchema.index({ vendeur: 1 });

// Modèle MongoDB
export const RentalContractModel = model<IRentalContractDocument>('RentalContract', rentalContractSchema);

// Schéma pour la numérotation des contrats
const contractNumberingSchema = new Schema({
  year: { type: Number, required: true },
  lastNumber: { type: Number, required: true, default: 0 },
  prefix: { type: String, default: 'JJ' }
}, {
  collection: 'contract_numbering'
});

export const ContractNumberingModel = model('ContractNumbering', contractNumberingSchema);