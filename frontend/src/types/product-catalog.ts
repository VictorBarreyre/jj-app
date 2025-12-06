import { ProductCategory } from './product-references';

// Catalogue organisé des références vestes
export const VESTE_CATALOG = {
  JAQUETTES: [
    'Jaquette Fil à Fil Foncé',
    'Jaquette Fil à Fil Clair',
    'Jaquette Bleue',
    'Jaquette Bleue Clair',
    'Jaquette Bordeaux',
    'Jaquette Flanelle',
    'Jaquette Jola'
  ] as const,

  COSTUMES_VILLE: [
    'Costume Bleu',
    'Costume Gris'
  ] as const,

  SMOKING: [
    'Smoking Noir Châle',
    'Smoking Noir Cranté',
    'Smoking Bleu',
    'Smoking Bordeaux',
    'Smoking Gris'
  ] as const,

  HABIT_QUEUE_DE_PIE: [
    'Habit Noir'
  ] as const
} as const;

// Catalogue organisé des références gilets
export const GILET_CATALOG = [
  'Gilet Clair',
  'Gilet Clair Croisé',
  'Gilet Bleu',
  'Gilet Bleu Croisé',
  'Gilet Ficelle Droit',
  'Gilet Ficelle Croisé',
  'Gilet Rose Croisé',
  'Gilet Écru Croisé',
  'Ceinture Scratch'
] as const;

// Catalogue organisé des références pantalons
export const PANTALON_CATALOG = [
  'Pantalon Rayé',
  'Pantalon Bleu',
  'Pantalon Bleu Clair',
  'Pantalon Uni Foncé',
  'Pantalon Gris Ville',
  'Pantalon Bleu Smoking',
  'Pantalon Gris Smoking',
  'Pantalon Bordeaux',
  'Pantalon Noir Smoking',
  'Pantalon SP'
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
          category: 'veste' as ProductCategory
        }))
      ];

    case 'gilet':
      return GILET_CATALOG.map(ref => ({
        value: ref,
        label: ref,
        category: 'gilet' as ProductCategory
      }));

    case 'pantalon':
      return PANTALON_CATALOG.map(ref => ({
        value: ref,
        label: ref,
        category: 'pantalon' as ProductCategory
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
