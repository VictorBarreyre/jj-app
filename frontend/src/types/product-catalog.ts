import { ProductCategory } from './product-references';

// Catalogue organisé des références vestes
export const VESTE_CATALOG = {
  JAQUETTES: [
    'Jaquette FFF',
    'Jaquette Bleue',
    'Jaquette Bleue Clair',
    'Jaquette BORDEAUX',
    'Jaquette JOLA',
    'Jaquette FF Clair'
  ] as const,
  
  COSTUMES_VILLE: [
    'Costume bleu',
    'Costume gris'
  ] as const,
  
  SMOKING: [
    'Smoking noir châle',
    'Smoking noir cranté',
    'Smoking bleu',
    'Smoking Bordeaux',
    'Smoking gris'
  ] as const,
  
  HABIT_QUEUE_DE_PIE: [
    'Habit noir'
  ] as const
} as const;

// Catalogue organisé des références gilets
export const GILET_CATALOG = [
  'Clair',
  'Clair croisé',
  'Ficelle droit',
  'Ficelle croisé',
  'Écru croisé',
  'Bleu',
  'Bleu croisé',
  'Rose croisé',
  'Ceinture smok'
] as const;

// Catalogue organisé des références pantalons
export const PANTALON_CATALOG = [
  'SP',
  'Bleu',
  'Bleu clair',
  'Uni foncé',
  'Gris ville',
  'Bleu smok',
  'Gris smok',
  'Bordeaux',
  'Noir smok'
] as const;

// Interface pour les options de sélection
export interface ProductOption {
  value: string;
  label: string;
  category: ProductCategory;
}

// Fonction utilitaire pour obtenir toutes les références par catégorie
export function getReferencesByCategory(category: ProductCategory): ProductOption[] {
  switch (category) {
    case 'veste':
      return [
        ...Object.values(VESTE_CATALOG).flat().map(ref => ({
          value: ref,
          label: ref,
          category: 'veste'
        }))
      ];
    
    case 'gilet':
      return GILET_CATALOG.map(ref => ({
        value: ref,
        label: ref,
        category: 'gilet'
      }));
    
    case 'pantalon':
      return PANTALON_CATALOG.map(ref => ({
        value: ref,
        label: ref,
        category: 'pantalon'
      }));
    
    default:
      return [];
  }
}

// Fonction utilitaire pour obtenir les sous-catégories de vestes
export function getVesteSubcategories() {
  return [
    { key: 'JAQUETTES', label: 'Jaquettes', items: VESTE_CATALOG.JAQUETTES },
    { key: 'COSTUMES_VILLE', label: 'Costumes Ville', items: VESTE_CATALOG.COSTUMES_VILLE },
    { key: 'SMOKING', label: 'Smoking', items: VESTE_CATALOG.SMOKING },
    { key: 'HABIT_QUEUE_DE_PIE', label: 'Habit Queue de Pie', items: VESTE_CATALOG.HABIT_QUEUE_DE_PIE }
  ];
}