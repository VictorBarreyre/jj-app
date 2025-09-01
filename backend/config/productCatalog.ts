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
    colors: ['Noir'],
    basePrice: 150,
    description: 'Jaquette traditionnelle française'
  },
  {
    id: 'jaquette-bleue',
    name: 'Jaquette Bleue',
    category: 'veste',
    subCategory: 'jaquette',
    availableSizes: JAQUETTE_SIZES,
    colors: ['Bleu'],
    basePrice: 150,
    description: 'Jaquette bleue élégante'
  },
  {
    id: 'jaquette-bleue-clair',
    name: 'Jaquette Bleue Clair',
    category: 'veste',
    subCategory: 'jaquette',
    availableSizes: JAQUETTE_SIZES,
    colors: ['Bleu clair'],
    basePrice: 150,
    description: 'Jaquette bleu clair'
  },
  {
    id: 'jaquette-bordeaux',
    name: 'Jaquette BORDEAUX',
    category: 'veste',
    subCategory: 'jaquette',
    availableSizes: JAQUETTE_SIZES,
    colors: ['Bordeaux'],
    basePrice: 150,
    description: 'Jaquette bordeaux distinguée'
  },
  {
    id: 'jaquette-jola',
    name: 'Jaquette JOLA',
    category: 'veste',
    subCategory: 'jaquette',
    availableSizes: JAQUETTE_SIZES,
    colors: ['Noir'],
    basePrice: 160,
    description: 'Jaquette JOLA premium'
  },
  {
    id: 'jaquette-ff-clair',
    name: 'Jaquette FF Clair',
    category: 'veste',
    subCategory: 'jaquette',
    availableSizes: JAQUETTE_SIZES,
    colors: ['Gris clair'],
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
    colors: ['Bleu marine'],
    basePrice: 120,
    description: 'Costume ville bleu marine classique'
  },
  {
    id: 'costume-gris',
    name: 'Costume gris',
    category: 'veste',
    subCategory: 'costume-ville',
    availableSizes: COSTUME_VILLE_SIZES,
    colors: ['Gris'],
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
    colors: ['Noir'],
    basePrice: 180,
    description: 'Smoking noir avec revers châle'
  },
  {
    id: 'smoking-noir-crante',
    name: 'Smoking noir cranté',
    category: 'veste',
    subCategory: 'smoking',
    availableSizes: SMOKING_SIZES,
    colors: ['Noir'],
    basePrice: 180,
    description: 'Smoking noir avec revers cranté'
  },
  {
    id: 'smoking-bleu',
    name: 'Smoking bleu',
    category: 'veste',
    subCategory: 'smoking',
    availableSizes: SMOKING_SIZES,
    colors: ['Bleu'],
    basePrice: 180,
    description: 'Smoking bleu élégant'
  },
  {
    id: 'smoking-bordeaux',
    name: 'Smoking Bordeaux',
    category: 'veste',
    subCategory: 'smoking',
    availableSizes: SMOKING_SIZES,
    colors: ['Bordeaux'],
    basePrice: 180,
    description: 'Smoking bordeaux distingué'
  },
  {
    id: 'smoking-gris',
    name: 'Smoking gris',
    category: 'veste',
    subCategory: 'smoking',
    availableSizes: SMOKING_SIZES,
    colors: ['Gris'],
    basePrice: 180,
    description: 'Smoking gris raffiné'
  },

  // HABIT QUEUE DE PIE
  {
    id: 'habit-noir',
    name: 'Habit Queue de Pie noir',
    category: 'veste',
    subCategory: 'habit-queue-de-pie',
    availableSizes: HABIT_QUEUE_DE_PIE_SIZES,
    colors: ['Noir'],
    basePrice: 200,
    description: 'Habit queue de pie noir traditionnel'
  },

  // GILETS CLASSIQUES
  {
    id: 'gilet-clair',
    name: 'Gilet Clair',
    category: 'gilet',
    subCategory: 'classique-standard',
    availableSizes: GILET_SIZES_CLASSIQUE,
    colors: ['Clair'],
    basePrice: 80,
    description: 'Gilet clair élégant'
  },
  {
    id: 'gilet-clair-croise',
    name: 'Gilet Clair croisé',
    category: 'gilet',
    subCategory: 'classique-croise',
    availableSizes: GILET_SIZES_CLASSIQUE,
    colors: ['Clair'],
    basePrice: 85,
    description: 'Gilet clair croisé distingué'
  },
  {
    id: 'gilet-bleu',
    name: 'Gilet Bleu',
    category: 'gilet',
    subCategory: 'classique-standard',
    availableSizes: GILET_SIZES_CLASSIQUE,
    colors: ['Bleu'],
    basePrice: 80,
    description: 'Gilet bleu classique'
  },

  // GILETS FICELLE (tailles XS-XXXL)
  {
    id: 'gilet-ficelle-droit',
    name: 'Gilet Ficelle droit',
    category: 'gilet',
    subCategory: 'ficelle-droit',
    availableSizes: GILET_SIZES_STANDARD,
    colors: ['Ficelle'],
    basePrice: 75,
    description: 'Gilet ficelle coupe droite'
  },
  {
    id: 'gilet-ficelle-croise',
    name: 'Gilet Ficelle croisé',
    category: 'gilet',
    subCategory: 'ficelle-croise',
    availableSizes: GILET_SIZES_STANDARD,
    colors: ['Ficelle'],
    basePrice: 80,
    description: 'Gilet ficelle croisé élégant'
  },
  {
    id: 'gilet-bleu-croise',
    name: 'Gilet Bleu croisé',
    category: 'gilet',
    subCategory: 'ficelle-croise',
    availableSizes: GILET_SIZES_STANDARD,
    colors: ['Bleu'],
    basePrice: 80,
    description: 'Gilet bleu croisé moderne'
  },
  {
    id: 'gilet-rose-croise',
    name: 'Gilet Rose croisé',
    category: 'gilet',
    subCategory: 'ficelle-croise',
    availableSizes: GILET_SIZES_STANDARD,
    colors: ['Rose'],
    basePrice: 80,
    description: 'Gilet rose croisé original'
  },

  // GILET ÉCRU (tailles spécifiques)
  {
    id: 'gilet-ecru-croise',
    name: 'Gilet Écru croisé',
    category: 'gilet',
    subCategory: 'ecru-croise',
    availableSizes: GILET_SIZES_ECRU,
    colors: ['Écru'],
    basePrice: 85,
    description: 'Gilet écru croisé avec tailles spécifiques'
  },

  // CEINTURES
  {
    id: 'ceinture-scratch',
    name: 'Ceinture Scratch',
    category: 'accessoire',
    subCategory: 'ceinture',
    availableSizes: CEINTURE_SIZES,
    colors: ['Noir'],
    basePrice: 25,
    description: 'Ceinture scratch pratique et ajustable'
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
    name: 'Pantalon Bleu',
    category: 'pantalon',
    subCategory: 'standard',
    availableSizes: PANTALON_SIZES,
    colors: ['Bleu'],
    basePrice: 60,
    description: 'Pantalon bleu élégant'
  },
  {
    id: 'pantalon-bleu-clair',
    name: 'Pantalon Bleu clair',
    category: 'pantalon',
    subCategory: 'standard',
    availableSizes: PANTALON_SIZES,
    colors: ['Bleu clair'],
    basePrice: 60,
    description: 'Pantalon bleu clair moderne'
  },
  {
    id: 'pantalon-uni-fonce',
    name: 'Pantalon Uni foncé',
    category: 'pantalon',
    subCategory: 'standard',
    availableSizes: PANTALON_SIZES,
    colors: ['Uni foncé'],
    basePrice: 60,
    description: 'Pantalon uni foncé classique'
  },
  {
    id: 'pantalon-gris-ville',
    name: 'Pantalon Gris ville',
    category: 'pantalon',
    subCategory: 'ville',
    availableSizes: PANTALON_SIZES,
    colors: ['Gris'],
    basePrice: 65,
    description: 'Pantalon gris ville chic'
  },
  {
    id: 'pantalon-bleu-smok',
    name: 'Pantalon Bleu smok',
    category: 'pantalon',
    subCategory: 'smoking',
    availableSizes: PANTALON_SIZES,
    colors: ['Bleu'],
    basePrice: 70,
    description: 'Pantalon bleu pour smoking'
  },
  {
    id: 'pantalon-gris-smok',
    name: 'Pantalon Gris smok',
    category: 'pantalon',
    subCategory: 'smoking',
    availableSizes: PANTALON_SIZES,
    colors: ['Gris'],
    basePrice: 70,
    description: 'Pantalon gris pour smoking'
  },
  {
    id: 'pantalon-bordeaux',
    name: 'Pantalon Bordeaux',
    category: 'pantalon',
    subCategory: 'standard',
    availableSizes: PANTALON_SIZES,
    colors: ['Bordeaux'],
    basePrice: 65,
    description: 'Pantalon bordeaux distingué'
  },
  {
    id: 'pantalon-noir-smok',
    name: 'Pantalon Noir smok',
    category: 'pantalon',
    subCategory: 'smoking',
    availableSizes: PANTALON_SIZES,
    colors: ['Noir'],
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