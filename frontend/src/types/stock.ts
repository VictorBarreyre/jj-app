// Types pour les catégories d'articles
export type ArticleCategory = 'veste' | 'gilet' | 'pantalon' | 'accessoire';
export type VesteSubCategory = 'jaquette' | 'costume-ville' | 'smoking' | 'habit-queue-de-pie' | 'autre';
export type GiletSubCategory = 'classique-standard' | 'classique-croise' | 'ficelle-droit' | 'ficelle-croise' | 'ecru-croise' | 'habit' | 'ceinture';
export type MovementType = 'entree' | 'sortie' | 'reservation' | 'retour' | 'annulation' | 'destruction' | 'perte';

// Interface pour un article de stock
export interface StockItem {
  id: string;
  category: ArticleCategory;
  subCategory?: VesteSubCategory | GiletSubCategory;
  reference: string;
  taille: string;
  couleur?: string;
  prix?: number;
  quantiteStock: number;
  quantiteReservee: number;
  quantiteDisponible: number;
  seuilAlerte: number;
  createdAt: string;
  updatedAt: string;
}

// Interface pour un mouvement de stock
export interface StockMovement {
  id: string;
  stockItemId: string;
  type: MovementType;
  quantite: number;
  dateMovement: string;
  datePrevue?: string;
  dateRetour?: string;
  contractId?: string;
  vendeur: string;
  commentaire?: string;
  createdAt: string;
}

// Interface pour les disponibilités à une date donnée
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