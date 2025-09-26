import { Order, ChapeauMeasurements, ChaussuresMeasurements } from '@/types/order';
import { RentalContract } from '@/types/rental-contract';

export const convertOrderToRentalContract = (order: Order): RentalContract => {
  // Convertir les items en tenue
  const tenue: any = {};
  order.items?.forEach(item => {
    const category = item.category;
    if (category === 'veste' || category === 'gilet' || category === 'pantalon' || category === 'ceinture') {
      tenue[category] = {
        reference: item.reference,
        taille: (item.measurements as any)?.taille || '',
        longueur: (item.measurements as any)?.longueur,
        longueurManche: (item.measurements as any)?.longueurManche,
        couleur: (item.measurements as any)?.couleur || '',
        notes: item.notes || ''
      };
    } else if (category === 'chapeau') {
      tenue.tailleChapeau = (item.measurements as ChapeauMeasurements)?.taille || '';
    } else if (category === 'chaussures') {
      tenue.tailleChaussures = (item.measurements as ChaussuresMeasurements)?.pointure || '';
    }
  });

  return {
    id: order.id,
    numero: order.numero,
    dateCreation: typeof order.dateCreation === 'string' ? new Date(order.dateCreation) : order.dateCreation || new Date(),
    dateEvenement: typeof order.dateLivraison === 'string' ? new Date(order.dateLivraison) : order.dateLivraison || new Date(),
    dateRetrait: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), // 7 jours après création par défaut
    dateRetour: new Date(new Date().getTime() + 14 * 24 * 60 * 60 * 1000), // 14 jours après création par défaut
    client: {
      nom: order.client.nom,
      telephone: order.client.telephone || '',
      email: order.client.email || '',
      isExistingClient: false
    },
    vendeur: (order.createdBy || 'N/A') as any,
    tarifLocation: order.total || 0,
    depotGarantie: 50, // Valeur par défaut
    arrhes: 0, // Valeur par défaut
    paiementArrhes: undefined,
    notes: order.notes,
    tenue: tenue,
    articlesStock: order.items?.map(item => ({
      stockItemId: item.id,
      reference: item.reference,
      taille: (item.measurements as any)?.taille || '',
      couleur: (item.measurements as any)?.couleur || '',
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
        tenue: {} as any, // Tenue vide par défaut
        pieces: p.pieces,
        notes: p.notes
      }))
    } : undefined,
    createdAt: typeof order.dateCreation === 'string' ? new Date(order.dateCreation) : order.dateCreation || new Date(),
    updatedAt: typeof order.dateCreation === 'string' ? new Date(order.dateCreation) : order.dateCreation || new Date()
  };
};