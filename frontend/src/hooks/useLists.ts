import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listsApi } from '@/services/lists.api';
import { CreateListRequest, UpdateListRequest, ListParticipant } from '@/types/list';
import toast from 'react-hot-toast';

// Hook pour récupérer toutes les listes
export function useLists() {
  return useQuery({
    queryKey: ['lists'],
    queryFn: () => listsApi.getAll(),
    staleTime: 1000 * 60 * 5 // 5 minutes
  });
}

// Hook pour récupérer une liste par ID
export function useList(id: string) {
  return useQuery({
    queryKey: ['lists', id],
    queryFn: () => listsApi.getById(id),
    enabled: !!id
  });
}

// Hook pour créer une liste
export function useCreateList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateListRequest) => listsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
      toast.success('Liste créée avec succès');
    },
    onError: () => {
      toast.error('Erreur lors de la création de la liste');
    }
  });
}

// Hook pour mettre à jour une liste
export function useUpdateList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateListRequest }) =>
      listsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
      toast.success('Liste mise à jour');
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour de la liste');
    }
  });
}

// Hook pour supprimer une liste
export function useDeleteList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => listsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
      toast.success('Liste supprimée');
    },
    onError: () => {
      toast.error('Erreur lors de la suppression de la liste');
    }
  });
}

// Hook pour ajouter un contrat à une liste
export function useAddContractToList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ listId, contractId }: { listId: string; contractId: string }) =>
      listsApi.addContract(listId, contractId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
      toast.success('Commande ajoutée à la liste');
    },
    onError: () => {
      toast.error('Erreur lors de l\'ajout de la commande');
    }
  });
}

// Hook pour retirer un contrat d'une liste
export function useRemoveContractFromList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ listId, contractId }: { listId: string; contractId: string }) =>
      listsApi.removeContract(listId, contractId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
      toast.success('Commande retirée de la liste');
    },
    onError: () => {
      toast.error('Erreur lors du retrait de la commande');
    }
  });
}

// Hook pour récupérer les listes d'un contrat
export function useListsForContract(contractId: string) {
  return useQuery({
    queryKey: ['lists', 'contract', contractId],
    queryFn: () => listsApi.getListsForContract(contractId),
    enabled: !!contractId
  });
}

// Hook pour mettre à jour le rôle d'un participant
export function useUpdateParticipantRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ listId, contractId, role }: { listId: string; contractId: string; role: string }) =>
      listsApi.updateParticipantRole(listId, contractId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour du rôle');
    }
  });
}

// Hook pour mettre à jour tous les participants d'une liste
export function useUpdateParticipants() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ listId, participants }: { listId: string; participants: ListParticipant[] }) =>
      listsApi.updateParticipants(listId, participants),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
      toast.success('Liste mise à jour');
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour des participants');
    }
  });
}
