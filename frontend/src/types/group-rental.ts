// Types pour les groupes de locations
import { TenueMeasurement, Vendeur } from './measurement-form';

// Interface pour un client dans un groupe
export interface GroupClientInfo {
  id?: string; // ID temporaire pour la gestion dans le formulaire
  nom: string;
  telephone: string;
  email?: string;
  isExistingClient?: boolean;
  clientId?: string;
  // Tenue spécifique à ce client
  tenue: TenueMeasurement;
  // Notes spécifiques à ce client
  notes?: string;
}

// Interface pour les informations de base du groupe
export interface GroupRentalInfo {
  // Nom du groupe (automatique si une seule personne)
  groupName: string;
  
  // Informations de base communes
  dateEssai: Date;
  vendeur: Vendeur;
  
  // Liste des clients dans le groupe
  clients: GroupClientInfo[];
  
  // Notes générales pour le groupe
  groupNotes?: string;
  
  // Métadonnées
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
  status?: 'brouillon' | 'complete' | 'transmise';
}

// Interface pour créer un nouveau groupe
export interface CreateGroupRentalData {
  groupName: string;
  dateEssai: Date;
  vendeur: Vendeur;
  clients: Omit<GroupClientInfo, 'id'>[];
  groupNotes?: string;
}

// Interface pour les données de soumission
export interface GroupRentalSubmission {
  group: GroupRentalInfo;
  deviceId: string;
  submittedAt: Date;
}

// Fonction utilitaire pour générer automatiquement le nom du groupe
export const generateGroupName = (clients: GroupClientInfo[]): string => {
  if (clients.length === 0) return '';
  if (clients.length === 1) return clients[0].nom;
  return `Groupe de ${clients.length} personnes`;
};

// Fonction utilitaire pour créer un nouveau client vide
export const createEmptyClient = (): GroupClientInfo => ({
  id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  nom: '',
  telephone: '',
  email: '',
  isExistingClient: false,
  tenue: {},
  notes: ''
});