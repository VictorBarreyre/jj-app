// Types pour les catégories de produits
export type ProductCategory = 'veste' | 'gilet' | 'pantalon' | 'ceinture' | 'chapeau' | 'chaussures';

// Références spécifiques par catégorie
export type VesteReference = 
  | 'V001' | 'V002' | 'V003' | 'V004' | 'V005'
  | 'V006' | 'V007' | 'V008' | 'V009' | 'V010';

export type GiletReference = 
  | 'G001' | 'G002' | 'G003' | 'G004' | 'G005'
  | 'G006' | 'G007' | 'G008' | 'G009' | 'G010';

export type PantalonReference = 
  | 'P001' | 'P002' | 'P003' | 'P004' | 'P005'
  | 'P006' | 'P007' | 'P008' | 'P009' | 'P010';

export type ChapeauReference = 
  | 'C001' | 'C002' | 'C003' | 'C004' | 'C005'
  | 'C006' | 'C007' | 'C008' | 'C009' | 'C010';

export type ChaussuresReference = 
  | 'CH001' | 'CH002' | 'CH003' | 'CH004' | 'CH005'
  | 'CH006' | 'CH007' | 'CH008' | 'CH009' | 'CH010';

// Type union pour toutes les références
export type ProductReference = 
  | VesteReference 
  | GiletReference 
  | PantalonReference 
  | ChapeauReference 
  | ChaussuresReference;