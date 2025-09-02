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
        orders: response.contracts.map((contract: RentalContract) => ({
          ...contract,
          id: contract.id || contract._id, // Assurer compatibilité avec MongoDB _id
          type: contract.type || 'individuel',
          // Mapper les champs nécessaires
          client: {
            nom: contract.client.nom,
            prenom: '', // Les contrats n'ont pas de prénom séparé
            telephone: contract.client.telephone || '',
            email: contract.client.email
          },
          dateCommande: contract.dateCreation,
          dateLivraison: contract.dateEvenement,
          status: contract.rendu ? 'rendue' : (contract.status === 'confirme' ? 'livree' : 'commandee'),
          articles: contract.articlesStock || [],
          items: contract.articlesStock || [], // Pour compatibilité avec OrdersList
          montantTotal: contract.tarifLocation,
          notes: contract.notes,
          createdBy: contract.vendeur || 'N/A'
        })),
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