import { Schema, model, Document } from 'mongoose';

// Types pour les articles en stock
export type ArticleCategory = 'veste' | 'gilet' | 'pantalon' | 'accessoire';
export type VesteSubCategory = 'jaquette' | 'costume-ville' | 'smoking' | 'habit-queue-de-pie' | 'autre';
export type GiletSubCategory = 'classique-standard' | 'classique-croise' | 'ficelle-droit' | 'ficelle-croise' | 'ecru-croise' | 'habit';
export type MovementType = 'entree' | 'sortie' | 'reservation' | 'retour' | 'annulation' | 'destruction' | 'perte';

// Interface pour un article de stock
export interface IStockItem extends Document {
  category: ArticleCategory;
  subCategory?: VesteSubCategory | GiletSubCategory; // Sous-catégorie pour les vestes et gilets
  reference: string;          // Ex: "Jaquette FFF", "Costume bleu"
  taille: string;             // Ex: "52", "46N", "48L", etc.
  couleur?: string;           // Ex: "Noir", "Bleu marine"
  quantiteStock: number;      // Quantité physique en stock
  quantiteReservee: number;   // Quantité réservée (louée)
  quantiteDisponible: number; // Calculé: stock - réservée
  seuilAlerte: number;        // Seuil en dessous duquel une alerte est déclenchée
  createdAt: Date;
  updatedAt: Date;
}

const stockItemSchema = new Schema<IStockItem>({
  category: {
    type: String,
    enum: ['veste', 'gilet', 'pantalon', 'accessoire'],
    required: true
  },
  subCategory: {
    type: String,
    enum: ['jaquette', 'costume-ville', 'smoking', 'habit-queue-de-pie', 'autre', 'classique-standard', 'classique-croise', 'ficelle-droit', 'ficelle-croise', 'ecru-croise', 'habit'],
    required: function() {
      return this.category === 'veste' || this.category === 'gilet';
    }
  },
  reference: {
    type: String,
    required: true,
    trim: true
  },
  taille: {
    type: String,
    required: true,
    trim: true
  },
  couleur: {
    type: String,
    trim: true
  },
  quantiteStock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  quantiteReservee: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  quantiteDisponible: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  seuilAlerte: {
    type: Number,
    required: true,
    min: 0,
    default: 5
  }
}, {
  timestamps: true
});

stockItemSchema.pre('save', function(next) {
  this.quantiteDisponible = this.quantiteStock - this.quantiteReservee;
  next();
});

export const StockItem = model<IStockItem>('StockItem', stockItemSchema);

// Interface pour un mouvement de stock
export interface IStockMovement extends Document {
  stockItemId: Schema.Types.ObjectId;        // Référence à l'article concerné
  type: MovementType;
  quantite: number;           // Quantité (positive ou négative)
  dateMovement: Date;       // Date du mouvement
  datePrevue?: Date;        // Date prévue (pour réservations futures)
  dateRetour?: Date;        // Date de retour prévue (pour réservations)
  contractId?: string;        // Lien vers le bon de location
  vendeur: string;            // Vendeur qui a fait le mouvement
  commentaire?: string;       // Commentaire libre
  createdAt: Date;
  updatedAt: Date;
}

const stockMovementSchema = new Schema<IStockMovement>({
  stockItemId: {
    type: Schema.Types.ObjectId,
    ref: 'StockItem',
    required: true
  },
  type: {
    type: String,
    enum: ['entree', 'sortie', 'reservation', 'retour', 'annulation', 'destruction', 'perte'],
    required: true
  },
  quantite: {
    type: Number,
    required: true
  },
  dateMovement: {
    type: Date,
    required: true,
    default: Date.now
  },
  datePrevue: {
    type: Date
  },
  dateRetour: {
    type: Date
  },
  contractId: {
    type: String,
    trim: true
  },
  vendeur: {
    type: String,
    required: true,
    trim: true
  },
  commentaire: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

export const StockMovement = model<IStockMovement>('StockMovement', stockMovementSchema);

// Interface pour les alertes de stock
export interface IStockAlert extends Document {
  stockItemId: Schema.Types.ObjectId;
  reference: string;
  taille: string;
  quantiteActuelle: number;
  seuilAlerte: number;
  dateDetection: Date;
  estActive: boolean;
  message: string;
  createdAt: Date;
  updatedAt: Date;
}

const stockAlertSchema = new Schema<IStockAlert>({
  stockItemId: {
    type: Schema.Types.ObjectId,
    ref: 'StockItem',
    required: true
  },
  reference: {
    type: String,
    required: true,
    trim: true
  },
  taille: {
    type: String,
    required: true,
    trim: true
  },
  quantiteActuelle: {
    type: Number,
    required: true,
    min: 0
  },
  seuilAlerte: {
    type: Number,
    required: true,
    min: 0
  },
  dateDetection: {
    type: Date,
    required: true,
    default: Date.now
  },
  estActive: {
    type: Boolean,
    required: true,
    default: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

export const StockAlert = model<IStockAlert>('StockAlert', stockAlertSchema);

// Types pour les requêtes
export type CreateStockItemData = Omit<IStockItem, '_id' | 'quantiteReservee' | 'quantiteDisponible' | 'createdAt' | 'updatedAt'>;
export type UpdateStockItemData = Partial<CreateStockItemData>;
export type CreateStockMovementData = Omit<IStockMovement, '_id' | 'createdAt' | 'updatedAt'>;

// Interface pour les disponibilités à une date donnée (non persistée en DB)
export interface StockAvailability {
  stockItemId: string;
  reference: string;
  taille: string;
  couleur?: string;
  quantiteStock: number;
  quantiteReserveeADate: number;  
  quantiteDisponibleADate: number;
  reservationsActives: {
    contractId: string;
    dateDebut: Date;
    dateFin: Date;
    quantite: number;
  }[];
}