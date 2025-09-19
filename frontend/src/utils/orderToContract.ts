import { Order } from '@/types/order';
import { RentalContract } from '@/types/rental-contract';

export const convertOrderToRentalContract = (order: Order): RentalContract => {
  // Convertir les items en tenue
  const tenue: any = {};
  order.items?.forEach(item => {
    const category = item.category;
    if (category === 'veste' || category === 'gilet' || category === 'pantalon' || category === 'ceinture') {
      tenue[category] = {
        reference: item.reference,
        taille: item.measurements?.taille || '',
        longueur: item.measurements?.longueur,
        longueurManche: item.measurements?.longueurManche,
        couleur: item.measurements?.couleur || '',
        notes: item.notes || ''
      };
    } else if (category === 'chapeau') {
      tenue.tailleChapeau = item.measurements?.taille || '';
    } else if (category === 'chaussures') {
      tenue.tailleChaussures = item.measurements?.pointure || item.measurements?.taille || '';
    }
  });

  return {
    id: order.id,
    numero: order.numero,
    dateCreation: typeof order.dateCreation === 'string' ? new Date(order.dateCreation) : order.dateCreation || new Date(),
    dateEvenement: typeof order.dateLivraison === 'string' ? new Date(order.dateLivraison) : order.dateLivraison || new Date(),
    dateRetrait: typeof order.dateRetrait === 'string' ? new Date(order.dateRetrait) : order.dateRetrait || new Date(),
    dateRetour: typeof order.dateRetour === 'string' ? new Date(order.dateRetour) : order.dateRetour || new Date(),
    client: {
      nom: order.client.nom,
      telephone: order.client.telephone,
      email: order.client.email,
      isExistingClient: false
    },
    vendeur: order.createdBy || 'N/A',
    tarifLocation: order.total || 0,
    depotGarantie: order.depotGarantie || 50,
    arrhes: order.arrhes || 0,
    paiementArrhes: order.arrhes ? {
      amount: order.arrhes,
      date: order.dateCreation,
      method: 'especes'
    } : undefined,
    notes: order.notes,
    tenue: tenue,
    articlesStock: order.items?.map(item => ({
      stockItemId: item.id,
      reference: item.reference,
      taille: item.measurements?.taille || '',
      couleur: item.measurements?.couleur || '',
      quantiteReservee: item.quantity,
      prix: item.unitPrice || 0
    })) || [],
    status: order.status === 'livree' ? 'confirme' : 'brouillon',
    rendu: order.rendu || false,
    type: order.type || 'individuel',
    isGroup: order.type === 'groupe',
    participantCount: order.participantCount,
    groupDetails: order.groupDetails,
    createdAt: typeof order.dateCreation === 'string' ? new Date(order.dateCreation) : order.dateCreation || new Date(),
    updatedAt: typeof order.dateCreation === 'string' ? new Date(order.dateCreation) : order.dateCreation || new Date()
  };
};