import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { contractsAPI } from '@/services/api';
import { RentalContract } from '@/types/rental-contract';
import toast from 'react-hot-toast';

export const useOrders = (params?: { status?: string; search?: string }) => {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: async () => {
      const response = await contractsAPI.getAll(params);
      // Transformer les contrats en format compatible avec l'interface existante
      return {
        orders: response.contracts.map((contract: RentalContract) => {
          // Transformer la tenue en items
          const items = [];
          
          if (contract.tenue?.veste) {
            items.push({
              id: `veste-${contract._id}`,
              category: 'veste',
              reference: contract.tenue.veste.reference,
              quantity: 1,
              measurements: { taille: contract.tenue.veste.taille },
              notes: ''
            });
          }
          
          if (contract.tenue?.gilet) {
            items.push({
              id: `gilet-${contract._id}`,
              category: 'gilet',
              reference: contract.tenue.gilet.reference,
              quantity: 1,
              measurements: { taille: contract.tenue.gilet.taille },
              notes: ''
            });
          }
          
          if (contract.tenue?.pantalon) {
            items.push({
              id: `pantalon-${contract._id}`,
              category: 'pantalon',
              reference: contract.tenue.pantalon.reference,
              quantity: 1,
              measurements: { taille: contract.tenue.pantalon.taille },
              notes: ''
            });
          }
          
          if (contract.tenue?.chapeau) {
            items.push({
              id: `chapeau-${contract._id}`,
              category: 'chapeau',
              reference: contract.tenue.chapeau.reference,
              quantity: 1,
              measurements: { taille: contract.tenue.chapeau.taille },
              notes: ''
            });
          }
          
          if (contract.tenue?.chaussures) {
            items.push({
              id: `chaussures-${contract._id}`,
              category: 'chaussures',
              reference: contract.tenue.chaussures.reference,
              quantity: 1,
              measurements: { pointure: contract.tenue.chaussures.taille },
              notes: ''
            });
          }
          
          // Ajouter les articles de stock s'il y en a
          if (contract.articlesStock?.length > 0) {
            contract.articlesStock.forEach((stockItem, index) => {
              items.push({
                id: `stock-${contract._id}-${index}`,
                category: 'stock',
                reference: stockItem.reference,
                quantity: stockItem.quantiteReservee,
                measurements: { taille: stockItem.taille },
                unitPrice: stockItem.prix,
                notes: stockItem.couleur ? `Couleur: ${stockItem.couleur}` : ''
              });
            });
          }
          
          // Calculer le total à partir des articles si tarifLocation n'existe pas
          let calculatedTotal = contract.tarifLocation || 0;
          
          // Si pas de tarif de location, essayer de calculer depuis les articles de stock
          if (!calculatedTotal && contract.articlesStock?.length > 0) {
            calculatedTotal = contract.articlesStock.reduce((sum: number, item: any) => {
              return sum + (item.prix * item.quantiteReservee);
            }, 0);
          }
          
          console.log('Contract pricing info:', {
            numero: contract.numero,
            tarifLocation: contract.tarifLocation,
            articlesStock: contract.articlesStock?.length || 0,
            calculatedTotal
          });
          
          return {
            ...contract,
            id: contract._id, // Utiliser _id de MongoDB
            numero: contract.numero,
            type: contract.type || 'individuel',
            // Mapper les champs nécessaires
            client: {
              nom: contract.client.nom,
              prenom: contract.client.prenom || '', // Ajouté au cas où
              telephone: contract.client.telephone || '',
              email: contract.client.email || '',
              adresse: contract.client.adresse || {}
            },
            dateCreation: contract.dateCreation,
            dateLivraison: contract.dateEvenement,
            status: contract.rendu ? 'rendue' : (contract.status === 'confirme' ? 'livree' : 'commandee'),
            items: items,
            sousTotal: calculatedTotal,
            total: calculatedTotal,
            notes: contract.notes,
            createdBy: contract.vendeur || 'N/A'
          };
        }),
        total: response.total
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useOrder = (id: string) => {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => contractsAPI.getById(id),
    enabled: !!id,
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (contractData: any) => 
      contractsAPI.create(contractData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Bon de location créé avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erreur lors de la création du bon de location');
    },
  });
};

export const useUpdateOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      contractsAPI.update(id, data),
    onSuccess: (updatedContract) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.setQueryData(['order', updatedContract.id], updatedContract);
      toast.success('Bon de location mis à jour avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erreur lors de la mise à jour du bon de location');
    },
  });
};

export const useDeleteOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => contractsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Bon de location supprimé avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erreur lors de la suppression du bon de location');
    },
  });
};