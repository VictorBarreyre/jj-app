// Système de tarification par combinaisons pour Jean Jacques Cérémonie

// Interface pour les données de tenue
interface TenueData {
  veste?: { reference?: string };
  gilet?: { reference?: string };
  pantalon?: { reference?: string };
  ceinture?: { reference?: string };
}

// ============================================================================
// NORMALISATION DES RÉFÉRENCES
// ============================================================================

// Mapping des références kebab-case vers Title Case
const REFERENCE_MAPPING: Record<string, string> = {
  // Jaquettes
  'jaquette-fil-a-fil-fonce': 'Jaquette Fil à Fil Foncé',
  'jaquette-fil-a-fil-clair': 'Jaquette Fil à Fil Clair',
  'jaquette-bleue': 'Jaquette Bleue',
  'jaquette-bleue-clair': 'Jaquette Bleue Clair',
  'jaquette-bordeaux': 'Jaquette Bordeaux',
  'jaquette-flanelle': 'Jaquette Flanelle',
  'jaquette-jola': 'Jaquette Jola',
  // Costumes
  'costume-bleu': 'Costume Bleu',
  'costume-gris': 'Costume Gris',
  // Smokings
  'smoking-noir-chale': 'Smoking Noir Châle',
  'smoking-noir-crante': 'Smoking Noir Cranté',
  'smoking-bleu': 'Smoking Bleu',
  'smoking-bordeaux': 'Smoking Bordeaux',
  'smoking-gris': 'Smoking Gris',
  // Habit
  'habit-noir': 'Habit Noir',
  // Gilets
  'gilet-clair': 'Gilet Clair',
  'gilet-clair-croise': 'Gilet Clair Croisé',
  'gilet-bleu': 'Gilet Bleu',
  'gilet-bleu-croise': 'Gilet Bleu Croisé',
  'gilet-ficelle-droit': 'Gilet Ficelle Droit',
  'gilet-ficelle-croise': 'Gilet Ficelle Croisé',
  'gilet-rose-croise': 'Gilet Rose Croisé',
  'gilet-ecru-croise': 'Gilet Écru Croisé',
  'gilet-blanc-habit': 'Gilet Blanc Habit',
  // Pantalons
  'pantalon-raye': 'Pantalon Rayé',
  'pantalon-bleu': 'Pantalon Bleu',
  'pantalon-bleu-clair': 'Pantalon Bleu Clair',
  'pantalon-uni-fonce': 'Pantalon Uni Foncé',
  'pantalon-gris-ville': 'Pantalon Gris Ville',
  'pantalon-bleu-smoking': 'Pantalon Bleu Smoking',
  'pantalon-gris-smoking': 'Pantalon Gris Smoking',
  'pantalon-bordeaux': 'Pantalon Bordeaux',
  'pantalon-noir-smoking': 'Pantalon Noir Smoking',
  'pantalon-sp': 'Pantalon SP',
  // Ceintures
  'ceinture-noire': 'Ceinture Noire',
  'ceinture-marron': 'Ceinture Marron',
  'ceinture-scratch': 'Ceinture Scratch',
};

/**
 * Normalise une référence en format Title Case
 * Supporte les deux formats: kebab-case et Title Case
 */
function normalizeReference(ref?: string): string | undefined {
  if (!ref) return undefined;
  // Si c'est déjà en Title Case (contient des espaces), retourner tel quel
  if (ref.includes(' ')) return ref;
  // Sinon, chercher dans le mapping
  return REFERENCE_MAPPING[ref.toLowerCase()] || ref;
}

// ============================================================================
// CATÉGORIES DE GILETS
// ============================================================================

// Gilets standard (gris clair / gris foncé / bleu)
const GILETS_STANDARD = ['Gilet Clair', 'Gilet Bleu'];

// Gilet clair croisé
const GILETS_STANDARD_CROISE = ['Gilet Clair Croisé'];

// Gilets fancy (ficelle, rose, bleu croisé, écru croisé)
const GILETS_FANCY = [
  'Gilet Ficelle Croisé',
  'Gilet Ficelle Droit',
  'Gilet Rose Croisé',
  'Gilet Bleu Croisé',
  'Gilet Écru Croisé'
];

// Gilet habit
const GILETS_HABIT = ['Gilet Blanc Habit'];

// ============================================================================
// CATÉGORIES DE PANTALONS
// ============================================================================

const PANTALONS_RAYES = ['Pantalon Rayé'];
const PANTALONS_UNI_FONCE = ['Pantalon Uni Foncé'];
const PANTALONS_BLEU = ['Pantalon Bleu'];
const PANTALONS_BLEU_CLAIR = ['Pantalon Bleu Clair'];
const PANTALONS_SMOKING = ['Pantalon Noir Smoking', 'Pantalon Bleu Smoking', 'Pantalon Gris Smoking'];
const PANTALONS_VILLE = ['Pantalon Gris Ville'];

// ============================================================================
// FONCTIONS UTILITAIRES
// ============================================================================

function isGiletStandard(ref?: string): boolean {
  return ref ? GILETS_STANDARD.includes(ref) : false;
}

function isGiletStandardCroise(ref?: string): boolean {
  return ref ? GILETS_STANDARD_CROISE.includes(ref) : false;
}

function isGiletFancy(ref?: string): boolean {
  return ref ? GILETS_FANCY.includes(ref) : false;
}

function isGiletHabit(ref?: string): boolean {
  return ref ? GILETS_HABIT.includes(ref) : false;
}

function isPantalonRaye(ref?: string): boolean {
  return ref ? PANTALONS_RAYES.includes(ref) : false;
}

function isPantalonUniFonce(ref?: string): boolean {
  return ref ? PANTALONS_UNI_FONCE.includes(ref) : false;
}

function isPantalonBleu(ref?: string): boolean {
  return ref ? PANTALONS_BLEU.includes(ref) : false;
}

function isPantalonBleuClair(ref?: string): boolean {
  return ref ? PANTALONS_BLEU_CLAIR.includes(ref) : false;
}

function isPantalonSmoking(ref?: string): boolean {
  return ref ? PANTALONS_SMOKING.includes(ref) : false;
}

function isPantalonVille(ref?: string): boolean {
  return ref ? PANTALONS_VILLE.includes(ref) : false;
}

// ============================================================================
// PRIX DES COMBINAISONS
// ============================================================================

/**
 * Calcule le prix pour les Jaquettes Fil à Fil Foncé et Clair
 */
function getPrixJaquetteFFF(gilet?: string, pantalon?: string, isGroup: boolean = false): number | null {
  const hasGiletStandard = isGiletStandard(gilet);
  const hasGiletCroise = isGiletStandardCroise(gilet);
  const hasGiletFancy = isGiletFancy(gilet);
  const hasPantalonRaye = isPantalonRaye(pantalon);
  const hasPantalonUniFonce = isPantalonUniFonce(pantalon);
  const hasPantalon = hasPantalonRaye || hasPantalonUniFonce;

  if (isGroup) {
    // Prix groupe (6+)
    // Veste + gilet fancy + pantalon
    if (hasGiletFancy && hasPantalon) return 187;
    // Veste + gilet croisé + pantalon
    if (hasGiletCroise && hasPantalon) return 178;
    // Veste + gilet standard + pantalon
    if (hasGiletStandard && hasPantalon) return 160;
    // Veste + gilet fancy
    if (hasGiletFancy) return 170;
    // Veste + gilet croisé
    if (hasGiletCroise) return 161;
    // Veste + gilet standard
    if (hasGiletStandard) return 143;
    // Veste + pantalon
    if (hasPantalon) return 147;
  } else {
    // Prix standard
    // Veste + gilet fancy + pantalon
    if (hasGiletFancy && hasPantalon) return 208;
    // Veste + gilet croisé + pantalon
    if (hasGiletCroise && hasPantalon) return 198;
    // Veste + gilet standard + pantalon
    if (hasGiletStandard && hasPantalon) return 178;
    // Veste + gilet fancy
    if (hasGiletFancy) return 189;
    // Veste + gilet croisé
    if (hasGiletCroise) return 179;
    // Veste + gilet standard
    if (hasGiletStandard) return 159;
    // Veste + pantalon
    if (hasPantalon) return 164;
  }

  return null; // Pas de combinaison trouvée
}

/**
 * Calcule le prix pour les Jaquettes Bleue et Bordeaux
 */
function getPrixJaquetteBleue(gilet?: string, pantalon?: string, isGroup: boolean = false): number | null {
  const hasGiletStandard = isGiletStandard(gilet);
  const hasGiletCroise = isGiletStandardCroise(gilet);
  const hasGiletFancy = isGiletFancy(gilet);
  const hasPantalonBleu = isPantalonBleu(pantalon);
  const hasPantalonRaye = isPantalonRaye(pantalon);
  const hasPantalonUniFonce = isPantalonUniFonce(pantalon);
  const hasPantalon = hasPantalonBleu || hasPantalonRaye || hasPantalonUniFonce;

  if (isGroup) {
    // Prix groupe (6+)
    // Veste + gilet fancy + pantalon
    if (hasGiletFancy && hasPantalon) return 203;
    // Veste + gilet croisé + pantalon
    if (hasGiletCroise && hasPantalon) return 194;
    // Veste + gilet standard + pantalon
    if (hasGiletStandard && hasPantalon) return 176;
    // Veste + gilet fancy
    if (hasGiletFancy) return 186;
    // Veste + gilet croisé
    if (hasGiletCroise) return 177;
    // Veste + gilet standard
    if (hasGiletStandard) return 159;
    // Veste + pantalon
    if (hasPantalon) return 164;
  } else {
    // Prix standard
    // Veste + gilet fancy + pantalon
    if (hasGiletFancy && hasPantalon) return 226;
    // Veste + gilet croisé + pantalon
    if (hasGiletCroise && hasPantalon) return 216;
    // Veste + gilet standard + pantalon
    if (hasGiletStandard && hasPantalon) return 196;
    // Veste + gilet fancy
    if (hasGiletFancy) return 207;
    // Veste + gilet croisé
    if (hasGiletCroise) return 197;
    // Veste + gilet standard
    if (hasGiletStandard) return 177;
    // Veste + pantalon
    if (hasPantalon) return 182;
  }

  return null;
}

/**
 * Calcule le prix pour les Jaquettes Bleue Clair
 */
function getPrixJaquetteBleueClaire(gilet?: string, pantalon?: string, isGroup: boolean = false): number | null {
  const hasGiletStandard = isGiletStandard(gilet);
  const hasGiletCroise = isGiletStandardCroise(gilet);
  const hasGiletFancy = isGiletFancy(gilet);
  const hasPantalonBleuClair = isPantalonBleuClair(pantalon);
  const hasPantalonRaye = isPantalonRaye(pantalon);
  const hasPantalonUniFonce = isPantalonUniFonce(pantalon);
  const hasPantalon = hasPantalonBleuClair || hasPantalonRaye || hasPantalonUniFonce;

  if (isGroup) {
    // Prix groupe (6+)
    // Veste + gilet fancy + pantalon
    if (hasGiletFancy && hasPantalon) return 207;
    // Veste + gilet croisé + pantalon
    if (hasGiletCroise && hasPantalon) return 198;
    // Veste + gilet standard + pantalon
    if (hasGiletStandard && hasPantalon) return 180;
    // Veste + gilet fancy
    if (hasGiletFancy) return 190;
    // Veste + gilet croisé
    if (hasGiletCroise) return 181;
    // Veste + gilet standard
    if (hasGiletStandard) return 163;
    // Veste + pantalon
    if (hasPantalon) return 167;
  } else {
    // Prix standard
    // Veste + gilet fancy + pantalon
    if (hasGiletFancy && hasPantalon) return 230;
    // Veste + gilet croisé + pantalon
    if (hasGiletCroise && hasPantalon) return 220;
    // Veste + gilet standard + pantalon
    if (hasGiletStandard && hasPantalon) return 200;
    // Veste + gilet fancy
    if (hasGiletFancy) return 211;
    // Veste + gilet croisé
    if (hasGiletCroise) return 201;
    // Veste + gilet standard
    if (hasGiletStandard) return 181;
    // Veste + pantalon
    if (hasPantalon) return 186;
  }

  return null;
}

/**
 * Calcule le prix pour les Jaquettes Flanelle
 */
function getPrixJaquetteFlanelle(gilet?: string, pantalon?: string, isGroup: boolean = false): number | null {
  const hasGiletStandard = isGiletStandard(gilet);
  const hasGiletCroise = isGiletStandardCroise(gilet);
  const hasGiletFancy = isGiletFancy(gilet);
  const hasPantalonRaye = isPantalonRaye(pantalon);
  const hasPantalonUniFonce = isPantalonUniFonce(pantalon);
  const hasPantalon = hasPantalonRaye || hasPantalonUniFonce;

  if (isGroup) {
    // Prix groupe (6+)
    // Veste + gilet fancy + pantalon
    if (hasGiletFancy && hasPantalon) return 180;
    // Veste + gilet croisé + pantalon
    if (hasGiletCroise && hasPantalon) return 171;
    // Veste + gilet standard + pantalon
    if (hasGiletStandard && hasPantalon) return 153;
    // Veste + gilet fancy
    if (hasGiletFancy) return 162;
    // Veste + gilet croisé
    if (hasGiletCroise) return 153;
    // Veste + gilet standard
    if (hasGiletStandard) return 135;
    // Veste + pantalon
    if (hasPantalon) return 140;
  } else {
    // Prix standard
    // Veste + gilet fancy + pantalon
    if (hasGiletFancy && hasPantalon) return 200;
    // Veste + gilet croisé + pantalon
    if (hasGiletCroise && hasPantalon) return 190;
    // Veste + gilet standard + pantalon
    if (hasGiletStandard && hasPantalon) return 170;
    // Veste + gilet fancy
    if (hasGiletFancy) return 180;
    // Veste + gilet croisé
    if (hasGiletCroise) return 170;
    // Veste + gilet standard
    if (hasGiletStandard) return 150;
    // Veste + pantalon
    if (hasPantalon) return 155;
  }

  return null;
}

/**
 * Calcule le prix pour l'Habit Queue de Pie
 */
function getPrixHabit(gilet?: string, pantalon?: string): number | null {
  const hasGiletHabit = isGiletHabit(gilet);
  const hasPantalonSmoking = isPantalonSmoking(pantalon);

  // Veste + gilet + pantalon
  if (hasGiletHabit && hasPantalonSmoking) return 172;
  // Veste + pantalon
  if (hasPantalonSmoking) return 157;
  // Veste + gilet
  if (hasGiletHabit) return 152;

  return null;
}

/**
 * Calcule le prix pour le Smoking Noir
 */
function getPrixSmokingNoir(pantalon?: string, hasCeinture?: boolean, isGroup: boolean = false): number | null {
  const hasPantalonSmoking = isPantalonSmoking(pantalon);

  if (isGroup) {
    // Prix groupe (6+)
    // Veste + pantalon + ceinture
    if (hasPantalonSmoking) return 104;
    // Veste seule (+ ceinture optionnelle qui est à 0€)
    return 85;
  } else {
    // Prix standard
    // Veste + pantalon + ceinture
    if (hasPantalonSmoking) return 115;
    // Veste seule (+ ceinture optionnelle qui est à 0€)
    return 95;
  }
}

/**
 * Calcule le prix pour les Smokings Bleu, Bordeaux, Gris
 */
function getPrixSmokingCouleur(pantalon?: string, hasCeinture?: boolean, isGroup: boolean = false): number | null {
  const hasPantalonSmoking = isPantalonSmoking(pantalon);

  if (isGroup) {
    // Prix groupe (6+) - même prix que smoking noir groupe
    // Veste + pantalon + ceinture
    if (hasPantalonSmoking) return 104;
    // Veste seule (+ ceinture optionnelle qui est à 0€)
    return 85;
  } else {
    // Prix standard
    // Veste + pantalon + ceinture
    if (hasPantalonSmoking) return 125;
    // Veste seule (+ ceinture optionnelle qui est à 0€)
    return 110;
  }
}

/**
 * Calcule le prix pour les Costumes Ville
 */
function getPrixCostumeVille(gilet?: string, pantalon?: string, isGroup: boolean = false): number | null {
  const hasGiletStandard = isGiletStandard(gilet);
  const hasGiletCroise = isGiletStandardCroise(gilet);
  const hasGiletFancy = isGiletFancy(gilet);
  const hasPantalonVille = isPantalonVille(pantalon);
  const hasPantalonBleu = isPantalonBleu(pantalon);
  const hasPantalon = hasPantalonVille || hasPantalonBleu;

  if (isGroup) {
    // Prix groupe (6+)
    // Veste + gilet fancy + pantalon
    if (hasGiletFancy && hasPantalon) return 153;
    // Veste + gilet croisé + pantalon
    if (hasGiletCroise && hasPantalon) return 144;
    // Veste + gilet standard + pantalon
    if (hasGiletStandard && hasPantalon) return 126;
    // Veste + pantalon
    if (hasPantalon) return 110;
  } else {
    // Prix standard
    // Veste + gilet fancy + pantalon
    if (hasGiletFancy && hasPantalon) return 170;
    // Veste + gilet croisé + pantalon
    if (hasGiletCroise && hasPantalon) return 160;
    // Veste + gilet standard + pantalon
    if (hasGiletStandard && hasPantalon) return 140;
    // Veste + pantalon
    if (hasPantalon) return 125;
  }

  return null;
}

// ============================================================================
// PRIX INDIVIDUELS (fallback)
// ============================================================================

const VESTE_PRICES: Record<string, number> = {
  'Jaquette Fil à Fil Foncé': 150,
  'Jaquette Fil à Fil Clair': 150,
  'Jaquette Bleue': 150,
  'Jaquette Bleue Clair': 150,
  'Jaquette Bordeaux': 150,
  'Jaquette Flanelle': 160,
  'Jaquette Jola': 150,
  'Costume Bleu': 120,
  'Costume Gris': 120,
  'Smoking Noir Châle': 95,
  'Smoking Noir Cranté': 95,
  'Smoking Bleu': 110,
  'Smoking Bordeaux': 110,
  'Smoking Gris': 110,
  'Habit Noir': 200,
};

const GILET_PRICES: Record<string, number> = {
  'Gilet Clair': 80,
  'Gilet Clair Croisé': 85,
  'Gilet Bleu': 80,
  'Gilet Bleu Croisé': 80,
  'Gilet Ficelle Droit': 75,
  'Gilet Ficelle Croisé': 80,
  'Gilet Rose Croisé': 80,
  'Gilet Écru Croisé': 85,
  'Gilet Blanc Habit': 90,
  'Ceinture Scratch': 0, // Gratuit avec les smokings
};

const PANTALON_PRICES: Record<string, number> = {
  'Pantalon Rayé': 60,
  'Pantalon Bleu': 60,
  'Pantalon Bleu Clair': 60,
  'Pantalon Uni Foncé': 60,
  'Pantalon Gris Ville': 65,
  'Pantalon Bleu Smoking': 70,
  'Pantalon Gris Smoking': 70,
  'Pantalon Bordeaux': 65,
  'Pantalon Noir Smoking': 70,
  'Pantalon SP': 60,
};

const CEINTURE_PRICES: Record<string, number> = {
  'Ceinture Noire': 15,
  'Ceinture Marron': 15,
  'Ceinture Scratch': 0, // Gratuit avec les smokings
};

// ============================================================================
// FONCTION PRINCIPALE DE CALCUL
// ============================================================================

// Seuil pour les prix de groupe
const GROUP_THRESHOLD = 6;

/**
 * Calcule le prix total d'une tenue en utilisant les combinaisons de prix
 * @param tenue Les données de la tenue avec les références
 * @param groupSize Taille du groupe (si >= 6, applique les prix groupe)
 * @returns Le prix total calculé ou undefined si aucun article n'est sélectionné
 */
export function calculateTenuePrice(tenue?: TenueData, groupSize: number = 1): number | undefined {
  if (!tenue) return undefined;

  // Normaliser les références (supporte kebab-case et Title Case)
  const veste = normalizeReference(tenue.veste?.reference);
  const gilet = normalizeReference(tenue.gilet?.reference);
  const pantalon = normalizeReference(tenue.pantalon?.reference);
  const ceinture = normalizeReference(tenue.ceinture?.reference);
  const isGroup = groupSize >= GROUP_THRESHOLD;

  // Si pas de veste, calculer avec les prix individuels
  if (!veste) {
    return calculateIndividualPrices(tenue);
  }

  let combinationPrice: number | null = null;

  // Jaquettes Fil à Fil
  if (veste === 'Jaquette Fil à Fil Foncé' || veste === 'Jaquette Fil à Fil Clair') {
    combinationPrice = getPrixJaquetteFFF(gilet, pantalon, isGroup);
  }
  // Jaquettes Bleue et Bordeaux
  else if (veste === 'Jaquette Bleue' || veste === 'Jaquette Bordeaux') {
    combinationPrice = getPrixJaquetteBleue(gilet, pantalon, isGroup);
  }
  // Jaquette Bleue Clair
  else if (veste === 'Jaquette Bleue Clair') {
    combinationPrice = getPrixJaquetteBleueClaire(gilet, pantalon, isGroup);
  }
  // Jaquette Flanelle
  else if (veste === 'Jaquette Flanelle') {
    combinationPrice = getPrixJaquetteFlanelle(gilet, pantalon, isGroup);
  }
  // Habit Queue de Pie (pas de prix groupe)
  else if (veste === 'Habit Noir') {
    combinationPrice = getPrixHabit(gilet, pantalon);
  }
  // Smoking Noir
  else if (veste === 'Smoking Noir Châle' || veste === 'Smoking Noir Cranté') {
    combinationPrice = getPrixSmokingNoir(pantalon, !!ceinture, isGroup);
  }
  // Smokings Couleur (Bleu, Bordeaux, Gris)
  else if (veste === 'Smoking Bleu' || veste === 'Smoking Bordeaux' || veste === 'Smoking Gris') {
    combinationPrice = getPrixSmokingCouleur(pantalon, !!ceinture, isGroup);
  }
  // Costumes Ville
  else if (veste === 'Costume Bleu' || veste === 'Costume Gris') {
    combinationPrice = getPrixCostumeVille(gilet, pantalon, isGroup);
  }

  // Si une combinaison a été trouvée, la retourner
  if (combinationPrice !== null) {
    return combinationPrice;
  }

  // Sinon, calculer avec les prix individuels
  return calculateIndividualPrices(tenue);
}

/**
 * Calcule le prix avec les prix individuels (fallback)
 */
function calculateIndividualPrices(tenue: TenueData): number | undefined {
  let total = 0;
  let hasItems = false;

  if (tenue.veste?.reference) {
    const normalizedRef = normalizeReference(tenue.veste.reference);
    const price = normalizedRef ? VESTE_PRICES[normalizedRef] : undefined;
    if (price) {
      total += price;
      hasItems = true;
    }
  }

  if (tenue.gilet?.reference) {
    const normalizedRef = normalizeReference(tenue.gilet.reference);
    const price = normalizedRef ? GILET_PRICES[normalizedRef] : undefined;
    if (price !== undefined) {
      total += price;
      hasItems = true;
    }
  }

  if (tenue.pantalon?.reference) {
    const normalizedRef = normalizeReference(tenue.pantalon.reference);
    const price = normalizedRef ? PANTALON_PRICES[normalizedRef] : undefined;
    if (price) {
      total += price;
      hasItems = true;
    }
  }

  if (tenue.ceinture?.reference) {
    const normalizedRef = normalizeReference(tenue.ceinture.reference);
    const price = normalizedRef ? (CEINTURE_PRICES[normalizedRef] ?? GILET_PRICES[normalizedRef]) : undefined;
    if (price !== undefined) {
      total += price;
      hasItems = true;
    }
  }

  return hasItems ? total : undefined;
}

/**
 * Obtient le prix d'un article par sa référence (prix individuel)
 * @param reference La référence du produit
 * @returns Le prix ou undefined si non trouvé
 */
export function getProductPrice(reference: string): number | undefined {
  const normalizedRef = normalizeReference(reference);
  if (!normalizedRef) return undefined;

  const price =
    VESTE_PRICES[normalizedRef] ??
    GILET_PRICES[normalizedRef] ??
    PANTALON_PRICES[normalizedRef] ??
    CEINTURE_PRICES[normalizedRef];

  return price;
}

/**
 * Obtient le détail des prix d'une tenue (avec prix de combinaison)
 * @param tenue Les données de la tenue
 * @param groupSize Taille du groupe (si >= 6, applique les prix groupe)
 * @returns Un objet avec le détail des prix par catégorie
 */
export function getTenuePriceDetails(tenue?: TenueData, groupSize: number = 1): {
  veste?: { reference: string; prix: number };
  gilet?: { reference: string; prix: number };
  pantalon?: { reference: string; prix: number };
  ceinture?: { reference: string; prix: number };
  total: number;
  isCombinaison: boolean;
  isGroupPrice: boolean;
} {
  const isGroup = groupSize >= GROUP_THRESHOLD;
  const details: ReturnType<typeof getTenuePriceDetails> = { total: 0, isCombinaison: false, isGroupPrice: isGroup };

  if (!tenue) return details;

  // Calculer le prix total avec combinaison (et prix groupe si applicable)
  const totalPrice = calculateTenuePrice(tenue, groupSize);

  // Calculer le prix individuel pour comparaison
  const individualPrice = calculateIndividualPrices(tenue);

  // Si le prix combinaison est différent du prix individuel, c'est une combinaison
  details.isCombinaison = totalPrice !== individualPrice;
  details.total = totalPrice || 0;

  // Afficher les prix individuels pour le détail
  if (tenue.veste?.reference) {
    const normalizedRef = normalizeReference(tenue.veste.reference);
    const prix = normalizedRef ? VESTE_PRICES[normalizedRef] : undefined;
    if (prix !== undefined) {
      details.veste = { reference: normalizedRef || tenue.veste.reference, prix };
    }
  }

  if (tenue.gilet?.reference) {
    const normalizedRef = normalizeReference(tenue.gilet.reference);
    const prix = normalizedRef ? GILET_PRICES[normalizedRef] : undefined;
    if (prix !== undefined) {
      details.gilet = { reference: normalizedRef || tenue.gilet.reference, prix };
    }
  }

  if (tenue.pantalon?.reference) {
    const normalizedRef = normalizeReference(tenue.pantalon.reference);
    const prix = normalizedRef ? PANTALON_PRICES[normalizedRef] : undefined;
    if (prix !== undefined) {
      details.pantalon = { reference: normalizedRef || tenue.pantalon.reference, prix };
    }
  }

  if (tenue.ceinture?.reference) {
    const normalizedRef = normalizeReference(tenue.ceinture.reference);
    const prix = normalizedRef ? (CEINTURE_PRICES[normalizedRef] ?? GILET_PRICES[normalizedRef]) : undefined;
    if (prix !== undefined) {
      details.ceinture = { reference: normalizedRef || tenue.ceinture.reference, prix };
    }
  }

  return details;
}

/**
 * Exporte le seuil de groupe pour utilisation externe
 */
export { GROUP_THRESHOLD };

/**
 * Calcule le prix total pour un groupe de tenues
 * Applique automatiquement les prix de groupe si >= 6 participants
 * @param tenues Liste des tenues
 * @returns Le prix total du groupe
 */
export function calculateGroupPrice(tenues: TenueData[]): {
  totalStandard: number;
  totalGroup: number;
  savings: number;
  isGroupPricing: boolean;
  participantCount: number;
} {
  const participantCount = tenues.length;
  const isGroupPricing = participantCount >= GROUP_THRESHOLD;

  let totalStandard = 0;
  let totalGroup = 0;

  for (const tenue of tenues) {
    const priceStandard = calculateTenuePrice(tenue, 1) || 0;
    const priceGroup = calculateTenuePrice(tenue, participantCount) || 0;
    totalStandard += priceStandard;
    totalGroup += priceGroup;
  }

  return {
    totalStandard,
    totalGroup: isGroupPricing ? totalGroup : totalStandard,
    savings: isGroupPricing ? totalStandard - totalGroup : 0,
    isGroupPricing,
    participantCount
  };
}
