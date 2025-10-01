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
export const CEINTURE_SIZES_FLEXIBLE = [];

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
    id: 'jaquette-fff',
    name: 'Jaquette FFF',
    category: 'veste',
    subCategory: 'jaquette',
    availableSizes: JAQUETTE_SIZES,
    colors: ['noir'],
    basePrice: 150,
    description: 'Jaquette traditionnelle française'
  },
  {
    id: 'jaquette-bleue',
    name: 'Jaquette bleue',
    category: 'veste',
    subCategory: 'jaquette',
    availableSizes: JAQUETTE_SIZES,
    colors: ['bleu'],
    basePrice: 150,
    description: 'Jaquette bleue élégante'
  },
  {
    id: 'jaquette-bleue-clair',
    name: 'Jaquette bleue clair',
    category: 'veste',
    subCategory: 'jaquette',
    availableSizes: JAQUETTE_SIZES,
    colors: ['bleu clair'],
    basePrice: 150,
    description: 'Jaquette bleu clair'
  },
  {
    id: 'jaquette-bordeaux',
    name: 'Jaquette bordeaux',
    category: 'veste',
    subCategory: 'jaquette',
    availableSizes: JAQUETTE_SIZES,
    colors: ['bordeaux'],
    basePrice: 150,
    description: 'Jaquette bordeaux distinguée'
  },
  {
    id: 'jaquette-jola',
    name: 'Jaquette Jola',
    category: 'veste',
    subCategory: 'jaquette',
    availableSizes: JAQUETTE_SIZES,
    colors: ['noir'],
    basePrice: 160,
    description: 'Jaquette Jola premium'
  },
  {
    id: 'jaquette-ff-clair',
    name: 'Jaquette FF clair',
    category: 'veste',
    subCategory: 'jaquette',
    availableSizes: JAQUETTE_SIZES,
    colors: ['gris clair'],
    basePrice: 150,
    description: 'Jaquette française claire'
  },

  // COSTUMES VILLE
  {
    id: 'costume-bleu',
    name: 'Costume bleu',
    category: 'veste',
    subCategory: 'costume-ville',
    availableSizes: COSTUME_VILLE_SIZES,
    colors: ['bleu marine'],
    basePrice: 120,
    description: 'Costume ville bleu marine classique'
  },
  {
    id: 'costume-gris',
    name: 'Costume gris',
    category: 'veste',
    subCategory: 'costume-ville',
    availableSizes: COSTUME_VILLE_SIZES,
    colors: ['gris'],
    basePrice: 120,
    description: 'Costume ville gris élégant'
  },

  // SMOKING
  {
    id: 'smoking-noir-chale',
    name: 'Smoking noir châle',
    category: 'veste',
    subCategory: 'smoking',
    availableSizes: SMOKING_SIZES,
    colors: ['noir'],
    basePrice: 180,
    description: 'Smoking noir avec revers châle'
  },
  {
    id: 'smoking-noir-crante',
    name: 'Smoking noir cranté',
    category: 'veste',
    subCategory: 'smoking',
    availableSizes: SMOKING_SIZES,
    colors: ['noir'],
    basePrice: 180,
    description: 'Smoking noir avec revers cranté'
  },
  {
    id: 'smoking-bleu',
    name: 'Smoking bleu',
    category: 'veste',
    subCategory: 'smoking',
    availableSizes: SMOKING_SIZES,
    colors: ['bleu'],
    basePrice: 180,
    description: 'Smoking bleu élégant'
  },
  {
    id: 'smoking-bordeaux',
    name: 'Smoking bordeaux',
    category: 'veste',
    subCategory: 'smoking',
    availableSizes: SMOKING_SIZES,
    colors: ['bordeaux'],
    basePrice: 180,
    description: 'Smoking bordeaux distingué'
  },
  {
    id: 'smoking-gris',
    name: 'Smoking gris',
    category: 'veste',
    subCategory: 'smoking',
    availableSizes: SMOKING_SIZES,
    colors: ['gris'],
    basePrice: 180,
    description: 'Smoking gris raffiné'
  },

  // HABIT QUEUE DE PIE
  {
    id: 'habit-noir',
    name: 'Habit queue de pie noir',
    category: 'veste',
    subCategory: 'habit-queue-de-pie',
    availableSizes: HABIT_QUEUE_DE_PIE_SIZES,
    colors: ['noir'],
    basePrice: 200,
    description: 'Habit queue de pie noir traditionnel'
  },

  // GILETS CLASSIQUES
  {
    id: 'gilet-clair',
    name: 'Gilet clair',
    category: 'gilet',
    subCategory: 'classique-standard',
    availableSizes: GILET_SIZES_CLASSIQUE,
    colors: ['clair'],
    basePrice: 80,
    description: 'Gilet clair élégant'
  },
  {
    id: 'gilet-clair-croise',
    name: 'Gilet clair croisé',
    category: 'gilet',
    subCategory: 'classique-croise',
    availableSizes: GILET_SIZES_CLASSIQUE,
    colors: ['clair'],
    basePrice: 85,
    description: 'Gilet clair croisé distingué'
  },
  {
    id: 'gilet-bleu',
    name: 'Gilet bleu',
    category: 'gilet',
    subCategory: 'classique-standard',
    availableSizes: GILET_SIZES_CLASSIQUE,
    colors: ['bleu'],
    basePrice: 80,
    description: 'Gilet bleu classique'
  },

  // GILETS FICELLE (tailles XS-XXXL)
  {
    id: 'gilet-ficelle-droit',
    name: 'Gilet ficelle droit',
    category: 'gilet',
    subCategory: 'ficelle-droit',
    availableSizes: GILET_SIZES_STANDARD,
    colors: ['ficelle'],
    basePrice: 75,
    description: 'Gilet ficelle coupe droite'
  },
  {
    id: 'gilet-ficelle-croise',
    name: 'Gilet ficelle croisé',
    category: 'gilet',
    subCategory: 'ficelle-croise',
    availableSizes: GILET_SIZES_STANDARD,
    colors: ['ficelle'],
    basePrice: 80,
    description: 'Gilet ficelle croisé élégant'
  },
  {
    id: 'gilet-bleu-croise',
    name: 'Gilet bleu croisé',
    category: 'gilet',
    subCategory: 'ficelle-croise',
    availableSizes: GILET_SIZES_STANDARD,
    colors: ['bleu'],
    basePrice: 80,
    description: 'Gilet bleu croisé moderne'
  },
  {
    id: 'gilet-rose-croise',
    name: 'Gilet rose croisé',
    category: 'gilet',
    subCategory: 'ficelle-croise',
    availableSizes: GILET_SIZES_STANDARD,
    colors: ['rose'],
    basePrice: 80,
    description: 'Gilet rose croisé original'
  },

  // GILET ÉCRU (tailles spécifiques)
  {
    id: 'gilet-ecru-croise',
    name: 'Gilet écru croisé',
    category: 'gilet',
    subCategory: 'ecru-croise',
    availableSizes: GILET_SIZES_ECRU,
    colors: ['écru'],
    basePrice: 85,
    description: 'Gilet écru croisé avec tailles spécifiques'
  },

  // GILET BLANC HABIT
  {
    id: 'gilet-blanc-habit',
    name: 'Gilet blanc habit',
    category: 'gilet',
    subCategory: 'habit',
    availableSizes: GILET_SIZES_BLANC_HABIT,
    colors: ['blanc'],
    basePrice: 90,
    description: 'Gilet blanc pour habit de cérémonie'
  },

  // CEINTURE SCRATCH (maintenant dans les gilets)
  {
    id: 'ceinture-scratch',
    name: 'Ceinture scratch',
    category: 'gilet',
    subCategory: 'ceinture',
    availableSizes: CEINTURE_SIZES_FLEXIBLE,
    colors: ['noir'],
    basePrice: 25,
    description: 'Ceinture scratch pratique et ajustable - taille libre'
  },


  // PANTALONS
  {
    id: 'pantalon-sp',
    name: 'Pantalon SP',
    category: 'pantalon',
    subCategory: 'standard',
    availableSizes: PANTALON_SIZES,
    colors: ['SP'],
    basePrice: 60,
    description: 'Pantalon SP classique'
  },
  {
    id: 'pantalon-bleu',
    name: 'Pantalon bleu',
    category: 'pantalon',
    subCategory: 'standard',
    availableSizes: PANTALON_SIZES,
    colors: ['bleu'],
    basePrice: 60,
    description: 'Pantalon bleu élégant'
  },
  {
    id: 'pantalon-bleu-clair',
    name: 'Pantalon bleu clair',
    category: 'pantalon',
    subCategory: 'standard',
    availableSizes: PANTALON_SIZES,
    colors: ['bleu clair'],
    basePrice: 60,
    description: 'Pantalon bleu clair moderne'
  },
  {
    id: 'pantalon-uni-fonce',
    name: 'Pantalon uni foncé',
    category: 'pantalon',
    subCategory: 'standard',
    availableSizes: PANTALON_SIZES,
    colors: ['uni foncé'],
    basePrice: 60,
    description: 'Pantalon uni foncé classique'
  },
  {
    id: 'pantalon-gris-ville',
    name: 'Pantalon gris ville',
    category: 'pantalon',
    subCategory: 'ville',
    availableSizes: PANTALON_SIZES,
    colors: ['gris'],
    basePrice: 65,
    description: 'Pantalon gris ville chic'
  },
  {
    id: 'pantalon-bleu-smok',
    name: 'Pantalon bleu smok',
    category: 'pantalon',
    subCategory: 'smoking',
    availableSizes: PANTALON_SIZES,
    colors: ['bleu'],
    basePrice: 70,
    description: 'Pantalon bleu pour smoking'
  },
  {
    id: 'pantalon-gris-smok',
    name: 'Pantalon gris smok',
    category: 'pantalon',
    subCategory: 'smoking',
    availableSizes: PANTALON_SIZES,
    colors: ['gris'],
    basePrice: 70,
    description: 'Pantalon gris pour smoking'
  },
  {
    id: 'pantalon-bordeaux',
    name: 'Pantalon bordeaux',
    category: 'pantalon',
    subCategory: 'standard',
    availableSizes: PANTALON_SIZES,
    colors: ['bordeaux'],
    basePrice: 65,
    description: 'Pantalon bordeaux distingué'
  },
  {
    id: 'pantalon-noir-smok',
    name: 'Pantalon noir smok',
    category: 'pantalon',
    subCategory: 'smoking',
    availableSizes: PANTALON_SIZES,
    colors: ['noir'],
    basePrice: 70,
    description: 'Pantalon noir pour smoking'
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