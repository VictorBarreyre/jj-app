// Références pour les vestes
export type VesteReference = 
  // JAQUETTES
  | 'Jaquette FFF'
  | 'Jaquette Bleue'
  | 'Jaquette Bleue Clair'
  | 'Jaquette BORDEAUX'
  | 'Jaquette JOLA'
  | 'Jaquette FF Clair'
  // COSTUMES VILLE
  | 'Costume bleu'
  | 'Costume gris'
  // SMOKING
  | 'Smoking noir châle'
  | 'Smoking noir cranté'
  | 'Smoking bleu'
  | 'Smoking Bordeaux'
  | 'Smoking gris'
  // HABIT QUEUE DE PIE
  | 'Habit noir';

// Références pour les gilets
export type GiletReference = 
  | 'Clair'
  | 'Clair croisé'
  | 'Ficelle droit'
  | 'Ficelle croisé'
  | 'Écru croisé'
  | 'Bleu'
  | 'Bleu croisé'
  | 'Rose croisé'
  | 'Ceinture smok';

// Références pour les pantalons
export type PantalonReference = 
  | 'SP'
  | 'Bleu'
  | 'Bleu clair'
  | 'Uni foncé'
  | 'Gris ville'
  | 'Bleu smok'
  | 'Gris smok'
  | 'Bordeaux'
  | 'Noir smok';

// Références pour les chapeaux
export type ChapeauReference = 
  | 'Haut-de-forme noir'
  | 'Haut-de-forme gris'
  | 'Chapeau melon'
  | 'Casquette cérémonie';

// Références pour les chaussures
export type ChaussuresReference = 
  | 'Chaussures noires vernies'
  | 'Chaussures marron cuir'
  | 'Chaussures blanches'
  | 'Chaussures de sport élégantes';

// Catégories de produits
export enum ProductCategory {
  VESTE = 'veste',
  GILET = 'gilet',
  PANTALON = 'pantalon',
  CHAPEAU = 'chapeau',
  CHAUSSURES = 'chaussures'
}

// Interface pour un produit avec sa référence
export interface ProductReference {
  category: ProductCategory;
  reference: VesteReference | GiletReference | PantalonReference | ChapeauReference | ChaussuresReference;
  label: string;
}

// Interface pour les mesures d'un produit
export interface ProductMeasurement {
  category: ProductCategory;
  reference: VesteReference | GiletReference | PantalonReference;
  measurements: Record<string, number | string>;
}

// Interface pour un bon de commande
export interface OrderForm {
  id: string;
  clientName: string;
  clientContact?: string;
  date: Date;
  products: ProductMeasurement[];
  notes?: string;
  status: 'draft' | 'confirmed' | 'in_production' | 'completed';
}