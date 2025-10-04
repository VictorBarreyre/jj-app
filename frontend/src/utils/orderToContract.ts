import { Order, ChapeauMeasurements, ChaussuresMeasurements } from '@/types/order';
import { RentalContract } from '@/types/rental-contract';
import { calculateDefaultDates } from './dateCalculations';

export const convertOrderToRentalContract = (order: Order): RentalContract => {
  // Convertir les items en tenue
  const tenue: any = {};
  order.items?.forEach(item => {
    const category = item.category;
    if (category === 'veste' || category === 'gilet' || category === 'pantalon' || category === 'ceinture') {
      tenue[category] = {
        reference: item.reference,
        taille: (item.measurements as any)?.taille || item.size || '',
        longueur: (item.measurements as any)?.longueur,
        longueurManche: (item.measurements as any)?.manches, // Corriger manches -> longueurManche
        couleur: (item.measurements as any)?.couleur || item.color || '',
        notes: item.notes || ''
      };
    } else if (category === 'chapeau') {
      tenue.tailleChapeau = (item.measurements as ChapeauMeasurements)?.taille || '';
    } else if (category === 'chaussures') {
      tenue.tailleChaussures = (item.measurements as ChaussuresMeasurements)?.pointure || '';
    }
  });

  // Calculer les dates par défaut basées sur la date d'événement
  const eventDate = typeof order.dateLivraison === 'string' ? new Date(order.dateLivraison) : order.dateLivraison || new Date();
  const defaultDates = calculateDefaultDates(eventDate);

  return {
    id: order.id,
    numero: order.numero,
    dateCreation: typeof order.dateCreation === 'string' ? new Date(order.dateCreation) : order.dateCreation || new Date(),
    dateEvenement: typeof order.dateLivraison === 'string' ? new Date(order.dateLivraison) : order.dateLivraison || new Date(),
    dateRetrait: defaultDates.dateRetrait, // Jeudi avant l'événement
    dateRetour: defaultDates.dateRetour, // Mardi après l'événement
    client: {
      nom: order.client.nom,
      telephone: order.client.telephone || '',
      email: order.client.email || '',
      isExistingClient: false
    },
    vendeur: (order.createdBy || 'N/A') as any,
    tarifLocation: order.total || undefined,
    depotGarantie: 400, // Valeur par défaut
    arrhes: 50, // Valeur par défaut
    paiementArrhes: undefined,
    notes: order.notes,
    tenue: tenue,
    articlesStock: order.items?.map(item => ({
      stockItemId: item.id,
      reference: item.reference,
      taille: (item.measurements as any)?.taille || item.size || '',
      couleur: (item.measurements as any)?.couleur || item.color || '',
      quantiteReservee: item.quantity,
      prix: item.unitPrice || 0
    })) || [],
    status: order.status === 'livree' ? 'confirme' : 'brouillon',
    rendu: false, // Par défaut false
    isGroup: order.type === 'groupe',
    participantCount: order.participantCount,
    groupDetails: order.groupDetails ? {
      participants: order.groupDetails.participants.map(p => ({
        nom: p.nom,
        prenom: p.prenom,
        tenue: p.tenue || {} as any, // Préserver la tenue du participant
        pieces: p.pieces,
        notes: p.notes
      }))
    } : undefined,
    createdAt: typeof order.dateCreation === 'string' ? new Date(order.dateCreation) : order.dateCreation || new Date(),
    updatedAt: typeof order.dateCreation === 'string' ? new Date(order.dateCreation) : order.dateCreation || new Date()
  };
};