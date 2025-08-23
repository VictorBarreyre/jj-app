// Types pour les articles en stock
export type ArticleCategory = 'veste' | 'gilet' | 'pantalon' | 'accessoire';
export type MovementType = 'entree' | 'sortie' | 'reservation' | 'retour' | 'annulation' | 'destruction' | 'perte';

// Interface pour un article de stock
export interface StockItem {
  id: string;
  category: ArticleCategory;
  reference: string;          // Ex: "Jaquette Traditionnelle"
  taille: string;             // Ex: "M", "L", "52", etc.
  couleur?: string;           // Ex: "Noir", "Bleu marine"
  quantiteStock: number;      // Quantité physique en stock
  quantiteReservee: number;   // Quantité réservée (louée)
  quantiteDisponible: number; // Calculé: stock - réservée
  seuilAlerte: number;        // Seuil en dessous duquel une alerte est déclenchée
  prix: number;               // Prix de location
  createdAt: string;
  updatedAt: string;
}

// Interface pour un mouvement de stock
export interface StockMovement {
  id: string;
  stockItemId: string;        // Référence à l'article concerné
  type: MovementType;
  quantite: number;           // Quantité (positive ou négative)
  dateMovement: string;       // Date du mouvement
  datePrevue?: string;        // Date prévue (pour réservations futures)
  dateRetour?: string;        // Date de retour prévue (pour réservations)
  contractId?: string;        // Lien vers le bon de location
  vendeur: string;            // Vendeur qui a fait le mouvement
  commentaire?: string;       // Commentaire libre
  createdAt: string;
}

// Interface pour les disponibilités à une date donnée
export interface StockAvailability {
  stockItemId: string;
  reference: string;
  taille: string;
  couleur?: string;
  quantiteStock: number;
  quantiteReserveeADate: number;  // Réservations actives à cette date
  quantiteDisponibleADate: number;
  reservationsActives: {
    contractId: string;
    dateDebut: string;
    dateFin: string;
    quantite: number;
  }[];
}

// Interface pour les alertes de stock
export interface StockAlert {
  id: string;
  stockItemId: string;
  reference: string;
  taille: string;
  quantiteActuelle: number;
  seuilAlerte: number;
  dateDetection: string;
  estActive: boolean;
  message: string;
}

// Types pour les requêtes
export type CreateStockItemData = Omit<StockItem, 'id' | 'quantiteReservee' | 'quantiteDisponible' | 'createdAt' | 'updatedAt'>;
export type UpdateStockItemData = Partial<CreateStockItemData>;
export type CreateStockMovementData = Omit<StockMovement, 'id' | 'createdAt'>;