import { Schema, model, Document } from 'mongoose';

// Interface pour les mesures spécifiques par type de produit
export interface VesteMeasurements {
  longueur?: number;
  poitrine?: number;
  taille?: number;
  epaules?: number;
  manches?: number;
  carrure?: number;
  tourDeCol?: number;
  hauteurPoitrine?: number;
  notes?: string;
}

export interface GiletMeasurements {
  longueur?: number;
  poitrine?: number;
  taille?: number;
  carrure?: number;
  hauteurPoitrine?: number;
  croise?: boolean;
  notes?: string;
}

export interface PantalonMeasurements {
  taille?: number;
  longueur?: number;
  entrejambe?: number;
  tour_de_cuisse?: number;
  tour_de_genou?: number;
  tour_de_cheville?: number;
  montant?: number;
  bassin?: number;
  notes?: string;
}

export interface ChapeauMeasurements {
  taille?: string;
  notes?: string;
}

export interface ChaussuresMeasurements {
  pointure?: string;
  largeur?: 'standard' | 'large';
  notes?: string;
}

// Interface pour un item de commande
export interface IOrderItem {
  id: string;
  category: 'veste' | 'gilet' | 'pantalon' | 'chapeau' | 'chaussures';
  reference: string;
  measurements: VesteMeasurements | GiletMeasurements | PantalonMeasurements | ChapeauMeasurements | ChaussuresMeasurements;
  quantity: number;
  unitPrice?: number;
  totalPrice?: number;
  notes?: string;
}

// Interface pour les informations client
export interface IClientInfo {
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

// Interface pour le document MongoDB de commande
export interface IOrderDocument extends Document {
  numero: string;
  client: IClientInfo;
  dateCreation: Date;
  dateLivraison?: Date;
  items: IOrderItem[];
  sousTotal?: number;
  tva?: number;
  total?: number;
  status: 'commandee' | 'livree' | 'rendue';
  type: 'individuel' | 'groupe';
  notes?: string;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Schéma MongoDB pour les mesures
const measurementsSchema = new Schema({}, { strict: false, _id: false });

// Schéma pour les items de commande
const orderItemSchema = new Schema<IOrderItem>({
  id: { type: String, required: true },
  category: {
    type: String,
    enum: ['veste', 'gilet', 'pantalon', 'chapeau', 'chaussures'],
    required: true
  },
  reference: { type: String, required: true },
  measurements: measurementsSchema,
  quantity: { type: Number, required: true, default: 1 },
  unitPrice: { type: Number },
  totalPrice: { type: Number },
  notes: { type: String }
}, { _id: false });

// Schéma pour les informations client
const clientInfoSchema = new Schema<IClientInfo>({
  id: { type: String },
  nom: { type: String, required: true },
  prenom: { type: String },
  telephone: { type: String },
  email: { type: String },
  adresse: {
    rue: { type: String },
    ville: { type: String },
    codePostal: { type: String },
    pays: { type: String }
  }
}, { _id: false });

// Schéma principal pour les commandes
const orderSchema = new Schema<IOrderDocument>({
  numero: { type: String, required: true, unique: true },
  client: { type: clientInfoSchema, required: true },
  dateCreation: { type: Date, required: true, default: Date.now },
  dateLivraison: { type: Date },
  items: [orderItemSchema],
  sousTotal: { type: Number },
  tva: { type: Number },
  total: { type: Number },
  status: {
    type: String,
    enum: ['commandee', 'livree', 'rendue'],
    required: true,
    default: 'commandee'
  },
  type: {
    type: String,
    enum: ['individuel', 'groupe'],
    required: true
  },
  notes: { type: String },
  createdBy: { type: String }
}, {
  timestamps: true
});

// Index pour améliorer les performances
orderSchema.index({ numero: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ type: 1 });
orderSchema.index({ dateCreation: -1 });
orderSchema.index({ 'client.nom': 1 });

export const OrderModel = model<IOrderDocument>('Order', orderSchema);

// Types pour les requêtes
export type CreateOrderData = Omit<IOrderDocument, 'id' | '_id' | 'createdAt' | 'updatedAt' | '__v'>;
export type UpdateOrderData = Partial<CreateOrderData>;