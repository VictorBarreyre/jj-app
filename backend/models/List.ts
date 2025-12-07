import { Schema, model, Document } from 'mongoose';

// Interface pour un participant dans une liste
export interface IListParticipant {
  contractId: string;
  role?: string; // Ex: "Marié", "Père du marié", "Témoin"
  order: number; // Position dans la liste (1, 2, 3...)
}

// Interface pour une liste de commandes
export interface IList {
  numero: string; // Numéro unique de la liste (ex: L-2025-001)
  name: string;
  description?: string;
  color?: string; // Couleur pour identifier visuellement la liste
  contractIds: string[]; // IDs des contrats associés (legacy, pour compatibilité)
  participants: IListParticipant[]; // Nouvelle structure avec rôles
  createdAt: Date;
  updatedAt: Date;
}

// Interface pour le document MongoDB
export interface IListDocument extends IList, Document {}

// Schéma pour un participant
const listParticipantSchema = new Schema<IListParticipant>({
  contractId: { type: String, required: true },
  role: { type: String, trim: true },
  order: { type: Number, required: true }
}, { _id: false });

// Schéma MongoDB
const listSchema = new Schema<IListDocument>({
  numero: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  color: {
    type: String,
    default: '#f59e0b' // Amber par défaut
  },
  contractIds: [{
    type: String,
    ref: 'RentalContract'
  }],
  participants: [listParticipantSchema]
}, {
  timestamps: true // Ajoute createdAt et updatedAt automatiquement
});

// Index pour recherche rapide par nom
listSchema.index({ name: 1 });

export const ListModel = model<IListDocument>('List', listSchema);

// Schéma pour la numérotation des listes
const listNumberingSchema = new Schema({
  year: { type: Number, required: true },
  lastNumber: { type: Number, required: true, default: 0 },
  prefix: { type: String, default: 'L' }
}, {
  collection: 'list_numbering'
});

export const ListNumberingModel = model('ListNumbering', listNumberingSchema);
