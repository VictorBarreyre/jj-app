import { Schema, model, Document } from 'mongoose';

// Types pour les vendeurs
export type Vendeur = 'Sophie' | 'Olivier' | 'Laurent';

// Interface pour une tenue dans le groupe
export interface ITenueMeasurement {
  veste?: {
    reference: string;
    taille: string;
    longueur?: string;
    couleur?: string;
  };
  gilet?: {
    reference: string;
    taille: string;
    couleur?: string;
  };
  pantalon?: {
    reference: string;
    taille: string;
    longueur?: string;
    couleur?: string;
  };
  ceinture?: {
    reference: string;
    taille: string;
    couleur?: string;
  };
  tailleChapeau?: string;
  tailleChaussures?: string;
}

// Interface pour un client dans le groupe
export interface IGroupClient {
  nom: string;
  telephone?: string; // Optionnel, peut être au niveau du groupe
  email?: string; // Optionnel, peut être au niveau du groupe
  isExistingClient?: boolean;
  clientId?: string;
  tenue: ITenueMeasurement;
  notes?: string;
}

// Interface principale pour un groupe de location
export interface IGroupRental extends Document {
  groupName: string;
  telephone: string;
  email?: string;
  dateEssai: Date;
  vendeur: Vendeur;
  clients: IGroupClient[];
  groupNotes?: string;
  status: 'brouillon' | 'complete' | 'transmise';
  createdAt: Date;
  updatedAt: Date;
}

// Schéma pour une tenue
const tenueSchema = new Schema({
  veste: {
    reference: { type: String },
    taille: { type: String },
    longueur: { type: String },
    couleur: { type: String }
  },
  gilet: {
    reference: { type: String },
    taille: { type: String },
    couleur: { type: String }
  },
  pantalon: {
    reference: { type: String },
    taille: { type: String },
    longueur: { type: String },
    couleur: { type: String }
  },
  ceinture: {
    reference: { type: String },
    taille: { type: String },
    couleur: { type: String }
  },
  tailleChapeau: { type: String },
  tailleChaussures: { type: String }
}, { _id: false });

// Schéma pour un client dans le groupe
const groupClientSchema = new Schema({
  nom: {
    type: String,
    required: true,
    trim: true
  },
  telephone: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true
  },
  isExistingClient: {
    type: Boolean,
    default: false
  },
  clientId: {
    type: String,
    trim: true
  },
  tenue: {
    type: tenueSchema,
    required: true
  },
  notes: {
    type: String,
    trim: true
  }
}, { _id: false });

// Schéma principal pour le groupe de location
const groupRentalSchema = new Schema<IGroupRental>({
  groupName: {
    type: String,
    required: true,
    trim: true
  },
  telephone: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    trim: true
  },
  dateEssai: {
    type: Date,
    required: true
  },
  vendeur: {
    type: String,
    enum: ['Sophie', 'Olivier', 'Laurent'],
    required: true
  },
  clients: {
    type: [groupClientSchema],
    required: true,
    validate: {
      validator: function(clients: IGroupClient[]) {
        return clients.length > 0;
      },
      message: 'Un groupe doit contenir au moins un client'
    }
  },
  groupNotes: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['brouillon', 'complete', 'transmise'],
    default: 'brouillon'
  }
}, {
  timestamps: true
});

// Index pour optimiser les recherches
groupRentalSchema.index({ dateEssai: 1 });
groupRentalSchema.index({ vendeur: 1 });
groupRentalSchema.index({ status: 1 });
groupRentalSchema.index({ 'clients.nom': 1 });
groupRentalSchema.index({ 'clients.telephone': 1 });

// Middleware pour générer automatiquement le nom du groupe si nécessaire
groupRentalSchema.pre('save', function(this: IGroupRental) {
  if (this.clients.length === 1 && this.groupName === `Groupe de ${this.clients.length} personnes`) {
    this.groupName = this.clients[0].nom;
  }
});

export const GroupRental = model<IGroupRental>('GroupRental', groupRentalSchema);

// Types d'export pour la création et la mise à jour
export type CreateGroupRentalData = Omit<IGroupRental, '_id' | 'createdAt' | 'updatedAt' | 'status'>;
export type UpdateGroupRentalData = Partial<CreateGroupRentalData>;