import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { measurementsAPI } from '@/services/api';
import { MeasurementForm } from '@/types/measurement-form';
import toast from 'react-hot-toast';

export const useMeasurements = () => {
  return useQuery({
    queryKey: ['measurements'],
    queryFn: () => measurementsAPI.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useMeasurement = (id: string) => {
  return useQuery({
    queryKey: ['measurement', id],
    queryFn: () => measurementsAPI.getById(id),
    enabled: !!id,
  });
};

export const useCreateMeasurement = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (measurementData: Omit<MeasurementForm, 'id' | 'createdAt' | 'updatedAt'>) => 
      measurementsAPI.create(measurementData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['measurements'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Prise de mesure créée avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erreur lors de la création de la prise de mesure');
    },
  });
};

export const useSaveMeasurementDraft = () => {
  return useMutation({
    mutationFn: (measurementData: Omit<MeasurementForm, 'id' | 'createdAt' | 'updatedAt'>) => 
      measurementsAPI.saveDraft(measurementData),
    onSuccess: (response) => {
      toast.success(response.message || 'Brouillon sauvegardé avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erreur lors de la sauvegarde du brouillon');
    },
  });
};

export const useSubmitMeasurement = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (measurementData: Omit<MeasurementForm, 'id' | 'createdAt' | 'updatedAt'>) => 
      measurementsAPI.submit(measurementData),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['measurements'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success(response.message || 'Formulaire transmis avec succès au PC caisse');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erreur lors de la transmission du formulaire');
    },
  });
};

export const useUpdateMeasurement = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<MeasurementForm> }) => 
      measurementsAPI.update(id, data),
    onSuccess: (updatedMeasurement) => {
      queryClient.invalidateQueries({ queryKey: ['measurements'] });
      queryClient.setQueryData(['measurement', updatedMeasurement.id], updatedMeasurement);
      toast.success('Prise de mesure mise à jour avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erreur lors de la mise à jour de la prise de mesure');
    },
  });
};

export const useDeleteMeasurement = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => measurementsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['measurements'] });
      toast.success('Prise de mesure supprimée avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erreur lors de la suppression de la prise de mesure');
    },
  });
};