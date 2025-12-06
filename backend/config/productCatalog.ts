// Catalogue des produits et références pour Jean Jacques Cérémonie

export interface ProductReference {
  id: string;
  name: string;
  category: 'veste' | 'gilet' | 'pantalon' | 'accessoire';
  subCategory: string;
  availableSizes: string[];
  colors?: string[];
  basePrice: number;
  description?: string;
}

// Tailles pour costumes ville
export const COSTUME_VILLE_SIZES = [
  '34N', '34L', '36N', '36L', '38N', '38L', '40N', '40L',
  '42N', '42L', '42TL', '44N', '44L', '44TL', '46N', '46L', '46TL',
  '48N', '48L', '48TL', '50N', '50L', '50TL', '52N', '52L',
  '54N', '54L', '56N', '60N'
];

// Tailles standards pour jaquettes (identiques aux costumes ville)
export const JAQUETTE_SIZES = [
  '34N', '34L', '36N', '36L', '38N', '38L', '40N', '40L',
  '42N', '42L', '42TL', '44N', '44L', '44TL', '46N', '46L', '46TL',
  '48N', '48L', '48TL', '50N', '50L', '50TL', '52N', '52L',
  '54N', '54L', '56N', '60N'
];

// Tailles pour smoking (format taille + longueur)
export const SMOKING_SIZES = [
  '34 78', '34 82', '36 78', '36 82', '38 78', '38 82', '39 84', '40 80',
  '41 84', '42 78', '42 82', '43 88', '44 78', '44 84', '45 88', '46 80',
  '46 84', '47 88', '48 80', '48 86', '50 82', '50 86', '52 82', '55 82',
  '57 84', '60 82'
];

// Tailles spécifiques pour habit queue de pie (taille + longueur)
export const HABIT_QUEUE_DE_PIE_SIZES = [
  '34 78', '34 82', '36 78', '36 82', '38 78', '38 82', '39 84', '40 80',
  '41 84', '42 78', '42 82', '43 88', '44 78', '44 84', '45 88', '46 80',
  '46 84', '47 88', '48 80', '48 86', '50 82', '50 86', '52 82', '55 82',
  '57 84', '60 82'
];

// Tailles pour gilets classiques (mêmes que costumes ville)
export const GILET_SIZES_CLASSIQUE = [
  '34N', '34L', '36N', '36L', '38N', '38L', '40N', '40L',
  '42N', '42L', '42TL', '44N', '44L', '44TL', '46N', '46L', '46TL',
  '48N', '48L', '48TL', '50N', '50L', '50TL', '52N', '52L',
  '54N', '54L', '56N', '60N'
];

// Tailles pour gilets ficelle (tailles standards)
export const GILET_SIZES_STANDARD = [
  'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'
];

// Tailles pour gilets écru (tailles simplifiées avec L)
export const GILET_SIZES_ECRU = [
  '34', '34L', '36', '36L', '38', '38L', '40', '40L',
  '42', '42L', '44', '44L', '46', '46L', '48', '48L'
];

// Tailles pour gilet blanc habit (tailles spécifiques)
export const GILET_SIZES_BLANC_HABIT = [
  '38', '40', '42', '44', '46', '48', '50'
];

// Tailles pour ceinture scratch (flexible - saisie libre)
export const CEINTURE_SIZES_FLEXIBLE: string[] = [];

// Tailles pour ceintures
export const CEINTURE_SIZES = [
  '34', '36', '38', '40', '42', '44', '46', '48', '50', '52', '55', '57', '60'
];

// Tailles pour pantalons (même format que habit queue de pie : taille + longueur)
export const PANTALON_SIZES = [
  '34 78', '34 82', '36 78', '36 82', '38 78', '38 82', '39 84', '40 80',
  '41 84', '42 78', '42 82', '43 88', '44 78', '44 84', '45 88', '46 80',
  '46 84', '47 88', '48 80', '48 86', '50 82', '50 86', '52 82', '55 82',
  '57 84', '60 82'
];

// Catalogue des références
export const PRODUCT_CATALOG: ProductReference[] = [
  // JAQUETTES
  {
    id: 'Jaquette Fil à Fil Foncé',
    name: 'Jaquette Fil à Fil Foncé',
    category: 'veste',
    subCategory: 'jaquette',
    availableSizes: JAQUETTE_SIZES,
    colors: ['noir'],
    basePrice: 150,
    description: 'Jaquette Fil à Fil Foncé'
  },
  {
    id: 'Jaquette Fil à Fil Clair',
    name: 'Jaquette Fil à Fil Clair',
    category: 'veste',
    subCategory: 'jaquette',
    availableSizes: JAQUETTE_SIZES,
    colors: ['gris clair'],
    basePrice: 150,
    description: 'Jaquette Fil à Fil Clair'
  },
  {
    id: 'Jaquette Bleue',
    name: 'Jaquette Bleue',
    category: 'veste',
    subCategory: 'jaquette',
    availableSizes: JAQUETTE_SIZES,
    colors: ['bleu'],
    basePrice: 150,
    description: 'Jaquette Bleue élégante'
  },
  {
    id: 'Jaquette Bleue Clair',
    name: 'Jaquette Bleue Clair',
    category: 'veste',
    subCategory: 'jaquette',
    availableSizes: JAQUETTE_SIZES,
    colors: ['bleu clair'],
    basePrice: 150,
    description: 'Jaquette Bleue Clair'
  },
  {
    id: 'Jaquette Bordeaux',
    name: 'Jaquette Bordeaux',
    category: 'veste',
    subCategory: 'jaquette',
    availableSizes: JAQUETTE_SIZES,
    colors: ['bordeaux'],
    basePrice: 150,
    description: 'Jaquette Bordeaux distinguée'
  },
  {
    id: 'Jaquette Flanelle',
    name: 'Jaquette Flanelle',
    category: 'veste',
    subCategory: 'jaquette',
    availableSizes: JAQUETTE_SIZES,
    colors: ['noir'],
    basePrice: 160,
    description: 'Jaquette Flanelle premium'
  },
  {
    id: 'Jaquette Jola',
    name: 'Jaquette Jola',
    category: 'veste',
    subCategory: 'jaquette',
    availableSizes: JAQUETTE_SIZES,
    colors: ['noir'],
    basePrice: 150,
    description: 'Jaquette Jola'
  },

  // COSTUMES VILLE
  {
    id: 'Costume Bleu',
    name: 'Costume Bleu',
    category: 'veste',
    subCategory: 'costume-ville',
    availableSizes: COSTUME_VILLE_SIZES,
    colors: ['bleu marine'],
    basePrice: 120,
    description: 'Costume ville Bleu marine classique'
  },
  {
    id: 'Costume Gris',
    name: 'Costume Gris',
    category: 'veste',
    subCategory: 'costume-ville',
    availableSizes: COSTUME_VILLE_SIZES,
    colors: ['gris'],
    basePrice: 120,
    description: 'Costume ville Gris élégant'
  },

  // SMOKING
  {
    id: 'Smoking Noir Châle',
    name: 'Smoking Noir Châle',
    category: 'veste',
    subCategory: 'smoking',
    availableSizes: SMOKING_SIZES,
    colors: ['noir'],
    basePrice: 180,
    description: 'Smoking Noir avec revers Châle'
  },
  {
    id: 'Smoking Noir Cranté',
    name: 'Smoking Noir Cranté',
    category: 'veste',
    subCategory: 'smoking',
    availableSizes: SMOKING_SIZES,
    colors: ['noir'],
    basePrice: 180,
    description: 'Smoking Noir avec revers Cranté'
  },
  {
    id: 'Smoking Bleu',
    name: 'Smoking Bleu',
    category: 'veste',
    subCategory: 'smoking',
    availableSizes: SMOKING_SIZES,
    colors: ['bleu'],
    basePrice: 180,
    description: 'Smoking Bleu élégant'
  },
  {
    id: 'Smoking Bordeaux',
    name: 'Smoking Bordeaux',
    category: 'veste',
    subCategory: 'smoking',
    availableSizes: SMOKING_SIZES,
    colors: ['bordeaux'],
    basePrice: 180,
    description: 'Smoking Bordeaux distingué'
  },
  {
    id: 'Smoking Gris',
    name: 'Smoking Gris',
    category: 'veste',
    subCategory: 'smoking',
    availableSizes: SMOKING_SIZES,
    colors: ['gris'],
    basePrice: 180,
    description: 'Smoking Gris raffiné'
  },

  // HABIT QUEUE DE PIE
  {
    id: 'Habit Noir',
    name: 'Habit Noir',
    category: 'veste',
    subCategory: 'habit-queue-de-pie',
    availableSizes: HABIT_QUEUE_DE_PIE_SIZES,
    colors: ['noir'],
    basePrice: 200,
    description: 'Habit queue de pie Noir traditionnel'
  },

  // GILETS CLASSIQUES
  {
    id: 'Gilet Clair',
    name: 'Gilet Clair',
    category: 'gilet',
    subCategory: 'classique-standard',
    availableSizes: GILET_SIZES_CLASSIQUE,
    colors: ['clair'],
    basePrice: 80,
    description: 'Gilet Clair élégant'
  },
  {
    id: 'Gilet Clair Croisé',
    name: 'Gilet Clair Croisé',
    category: 'gilet',
    subCategory: 'classique-croise',
    availableSizes: GILET_SIZES_CLASSIQUE,
    colors: ['clair'],
    basePrice: 85,
    description: 'Gilet Clair Croisé distingué'
  },
  {
    id: 'Gilet Bleu',
    name: 'Gilet Bleu',
    category: 'gilet',
    subCategory: 'classique-standard',
    availableSizes: GILET_SIZES_CLASSIQUE,
    colors: ['bleu'],
    basePrice: 80,
    description: 'Gilet Bleu classique'
  },

  // GILETS FICELLE (tailles XS-XXXL)
  {
    id: 'Gilet Ficelle Droit',
    name: 'Gilet Ficelle Droit',
    category: 'gilet',
    subCategory: 'ficelle-droit',
    availableSizes: GILET_SIZES_STANDARD,
    colors: ['ficelle'],
    basePrice: 75,
    description: 'Gilet Ficelle coupe Droite'
  },
  {
    id: 'Gilet Ficelle Croisé',
    name: 'Gilet Ficelle Croisé',
    category: 'gilet',
    subCategory: 'ficelle-croise',
    availableSizes: GILET_SIZES_STANDARD,
    colors: ['ficelle'],
    basePrice: 80,
    description: 'Gilet Ficelle Croisé élégant'
  },
  {
    id: 'Gilet Bleu Croisé',
    name: 'Gilet Bleu Croisé',
    category: 'gilet',
    subCategory: 'ficelle-croise',
    availableSizes: GILET_SIZES_STANDARD,
    colors: ['bleu'],
    basePrice: 80,
    description: 'Gilet Bleu Croisé moderne'
  },
  {
    id: 'Gilet Rose Croisé',
    name: 'Gilet Rose Croisé',
    category: 'gilet',
    subCategory: 'ficelle-croise',
    availableSizes: GILET_SIZES_STANDARD,
    colors: ['rose'],
    basePrice: 80,
    description: 'Gilet Rose Croisé original'
  },

  // GILET ÉCRU (tailles spécifiques)
  {
    id: 'Gilet Écru Croisé',
    name: 'Gilet Écru Croisé',
    category: 'gilet',
    subCategory: 'ecru-croise',
    availableSizes: GILET_SIZES_ECRU,
    colors: ['écru'],
    basePrice: 85,
    description: 'Gilet Écru Croisé avec tailles spécifiques'
  },

  // GILET BLANC HABIT
  {
    id: 'Gilet Blanc Habit',
    name: 'Gilet Blanc Habit',
    category: 'gilet',
    subCategory: 'habit',
    availableSizes: GILET_SIZES_BLANC_HABIT,
    colors: ['blanc'],
    basePrice: 90,
    description: 'Gilet Blanc pour habit de cérémonie'
  },

  // CEINTURE SCRATCH (maintenant dans les gilets)
  {
    id: 'Ceinture Scratch',
    name: 'Ceinture Scratch',
    category: 'gilet',
    subCategory: 'ceinture',
    availableSizes: CEINTURE_SIZES_FLEXIBLE,
    colors: ['noir'],
    basePrice: 25,
    description: 'Ceinture Scratch pratique et ajustable - taille libre'
  },

  // PANTALONS
  {
    id: 'Pantalon Rayé',
    name: 'Pantalon Rayé',
    category: 'pantalon',
    subCategory: 'standard',
    availableSizes: PANTALON_SIZES,
    colors: ['rayé'],
    basePrice: 60,
    description: 'Pantalon Rayé classique'
  },
  {
    id: 'Pantalon Bleu',
    name: 'Pantalon Bleu',
    category: 'pantalon',
    subCategory: 'standard',
    availableSizes: PANTALON_SIZES,
    colors: ['bleu'],
    basePrice: 60,
    description: 'Pantalon Bleu élégant'
  },
  {
    id: 'Pantalon Bleu Clair',
    name: 'Pantalon Bleu Clair',
    category: 'pantalon',
    subCategory: 'standard',
    availableSizes: PANTALON_SIZES,
    colors: ['bleu clair'],
    basePrice: 60,
    description: 'Pantalon Bleu Clair moderne'
  },
  {
    id: 'Pantalon Uni Foncé',
    name: 'Pantalon Uni Foncé',
    category: 'pantalon',
    subCategory: 'standard',
    availableSizes: PANTALON_SIZES,
    colors: ['uni foncé'],
    basePrice: 60,
    description: 'Pantalon Uni Foncé classique'
  },
  {
    id: 'Pantalon Gris Ville',
    name: 'Pantalon Gris Ville',
    category: 'pantalon',
    subCategory: 'ville',
    availableSizes: PANTALON_SIZES,
    colors: ['gris'],
    basePrice: 65,
    description: 'Pantalon Gris Ville chic'
  },
  {
    id: 'Pantalon Bleu Smoking',
    name: 'Pantalon Bleu Smoking',
    category: 'pantalon',
    subCategory: 'smoking',
    availableSizes: PANTALON_SIZES,
    colors: ['bleu'],
    basePrice: 70,
    description: 'Pantalon Bleu pour Smoking'
  },
  {
    id: 'Pantalon Gris Smoking',
    name: 'Pantalon Gris Smoking',
    category: 'pantalon',
    subCategory: 'smoking',
    availableSizes: PANTALON_SIZES,
    colors: ['gris'],
    basePrice: 70,
    description: 'Pantalon Gris pour Smoking'
  },
  {
    id: 'Pantalon Bordeaux',
    name: 'Pantalon Bordeaux',
    category: 'pantalon',
    subCategory: 'standard',
    availableSizes: PANTALON_SIZES,
    colors: ['bordeaux'],
    basePrice: 65,
    description: 'Pantalon Bordeaux distingué'
  },
  {
    id: 'Pantalon Noir Smoking',
    name: 'Pantalon Noir Smoking',
    category: 'pantalon',
    subCategory: 'smoking',
    availableSizes: PANTALON_SIZES,
    colors: ['noir'],
    basePrice: 70,
    description: 'Pantalon Noir pour Smoking'
  },
  {
    id: 'Pantalon SP',
    name: 'Pantalon SP',
    category: 'pantalon',
    subCategory: 'standard',
    availableSizes: PANTALON_SIZES,
    colors: ['noir'],
    basePrice: 60,
    description: 'Pantalon SP'
  }
];

// Fonctions utilitaires
export const getProductByCategory = (category: string) => {
  return PRODUCT_CATALOG.filter(product => product.category === category);
};

export const getProductBySubCategory = (subCategory: string) => {
  return PRODUCT_CATALOG.filter(product => product.subCategory === subCategory);
};

export const getProductById = (id: string) => {
  return PRODUCT_CATALOG.find(product => product.id === id);
};

export const getAllSizesForCategory = (category: string) => {
  const products = getProductByCategory(category);
  const allSizes = new Set<string>();
  products.forEach(product => {
    product.availableSizes.forEach(size => allSizes.add(size));
  });
  return Array.from(allSizes).sort();
};

export const getAllReferencesForCategory = (category: string) => {
  return getProductByCategory(category).map(product => ({
    id: product.id,
    name: product.name,
    subCategory: product.subCategory
  }));
};
