// Les références sont maintenant des strings (IDs dynamiques depuis l'API)

// Types pour les tailles
export type TailleVetement = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL';
export type LongueurVetement = 'Court' | 'Moyen' | 'Long';
export type TailleChaussure = '38' | '39' | '40' | '41' | '42' | '43' | '44' | '45' | '46' | '47' | '48';
export type TailleChapeau = '54' | '55' | '56' | '57' | '58' | '59' | '60' | '61' | '62';

// Types pour les vendeurs
export type Vendeur = 'Sophie' | 'Olivier' | 'Laurent' | 'Alexis' | 'Mael';

// Interface pour les mesures d'une tenue
export interface TenueMeasurement {
  // Veste
  veste?: {
    reference: string; // ID de la référence depuis l'API
    taille: string; // Taille dynamique depuis l'API
    longueur?: LongueurVetement;
    longueurManche?: string; // Longueur de manche personnalisée
    couleur?: string;
    notes?: string; // Notes spécifiques à la veste
  };
  
  // Gilet
  gilet?: {
    reference: string; // ID de la référence depuis l'API
    taille: string; // Taille dynamique depuis l'API
    couleur?: string;
    notes?: string; // Notes spécifiques au gilet
  };
  
  // Pantalon
  pantalon?: {
    reference: string; // ID de la référence depuis l'API
    taille: string; // Taille dynamique depuis l'API
    longueur?: LongueurVetement;
    couleur?: string;
    notes?: string; // Notes spécifiques au pantalon
  };
  
  // Ceinture
  ceinture?: {
    reference: string; // ID de la référence depuis l'API
    taille: string; // Taille dynamique depuis l'API
    couleur?: string;
  };

  // Autres accessoires
  tailleChapeau?: TailleChapeau;
  tailleChaussures?: TailleChaussure;
}

// Interface pour le client (formulaire de mesure)
export interface MeasurementClientInfo {
  nom: string;
  telephone: string;
  email?: string;
  isExistingClient?: boolean;
  clientId?: string;
}

// Interface principale pour le formulaire de prise de mesure
export interface MeasurementForm {
  // Informations de base
  dateEssai: Date;
  vendeur: Vendeur;
  
  // Client
  client: MeasurementClientInfo;
  
  // Tenue sélectionnée
  tenue: TenueMeasurement;
  
  // Notes du vendeur
  notes?: string;
  
  // Métadonnées
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
  status?: 'brouillon' | 'complete' | 'transmise';
}

// Interface pour l'envoi vers le PC caisse
export interface MeasurementFormSubmission {
  form: MeasurementForm;
  deviceId: string;
  submittedAt: Date;
}