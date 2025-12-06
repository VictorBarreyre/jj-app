import { Schema, model, Document } from 'mongoose';

// Interface pour une liste de commandes
export interface IList {
  name: string;
  description?: string;
  color?: string; // Couleur pour identifier visuellement la liste
  contractIds: string[]; // IDs des contrats associés
  createdAt: Date;
  updatedAt: Date;
}

// Interface pour le document MongoDB
export interface IListDocument extends IList, Document {}

// Schéma MongoDB
const listSchema = new Schema<IListDocument>({
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
  }]
}, {
  timestamps: true // Ajoute createdAt et updatedAt automatiquement
});

// Index pour recherche rapide par nom
listSchema.index({ name: 1 });

export const ListModel = model<IListDocument>('List', listSchema);
