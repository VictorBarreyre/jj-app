export interface MeasurementForm {
  id?: string;
  client: {
    nom: string;
    prenom: string;
    telephone: string;
    email?: string;
  };
  dateCommande: string;
  dateEssai?: string;
  dateLivraison?: string;
  status: 'brouillon' | 'en_production' | 'prete' | 'livree';
  articles: {
    type: string;
    taille: string;
    couleur: string;
    prix: number;
    mesures?: Record<string, number>;
  }[];
  mesures: {
    poitrine?: number;
    taille?: number;
    hanches?: number;
    epaules?: number;
    longueurBras?: number;
    longueurTorse?: number;
    longueurJambe?: number;
    entrejambe?: number;
    tourCou?: number;
    tourTete?: number;
  };
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type CreateMeasurementData = Omit<MeasurementForm, 'id' | 'createdAt' | 'updatedAt'>;