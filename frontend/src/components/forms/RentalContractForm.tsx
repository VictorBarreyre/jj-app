import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RentalContract, PaymentMethod } from '@/types/rental-contract';
import { TenueMeasurement, Vendeur } from '@/types/measurement-form';
import { Calendar, Euro, User, FileText, Printer, CreditCard, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { calculateDefaultDates } from '@/utils/dateCalculations';

// CSS personnalisé pour réduire l'espacement de l'icône calendrier
const dateInputStyles = `
  .date-input-tight::-webkit-calendar-picker-indicator {
    padding: 0;
    margin: 0;
    width: 16px;
    height: 16px;
    margin-right: 2px;
    margin-left: -2px;
  }
  
  .date-input-tight::-webkit-inner-spin-button,
  .date-input-tight::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`;

interface RentalContractFormProps {
  onSubmit: (contract: Omit<RentalContract, 'id' | 'numero' | 'createdAt' | 'updatedAt'>) => void;
  onSaveDraft: (contract: Omit<RentalContract, 'id' | 'numero' | 'createdAt' | 'updatedAt'>) => void;
  onAutoSave?: (contract: Partial<RentalContract>) => void;
  onPrint?: (contractId: string, type: 'jj' | 'client') => void;
  initialData?: Partial<RentalContract>;
  isEditMode?: boolean;
}

export function RentalContractForm({ onSubmit, onSaveDraft, onAutoSave, onPrint, initialData, isEditMode = false }: RentalContractFormProps) {
  const { user } = useAuth();

  const [form, setForm] = useState<Partial<RentalContract>>(() => {
    const today = new Date();
    const defaultDates = calculateDefaultDates(today);

    const defaultValues = {
      dateCreation: new Date(),
      dateEvenement: today,
      dateRetrait: defaultDates.dateRetrait, // Jeudi avant l'événement
      dateRetour: defaultDates.dateRetour, // Mardi après l'événement
      client: {
        nom: '',
        prenom: '',
        telephone: '',
        email: ''
      },
      vendeur: user?.prenom as Vendeur,
      tenue: {},
      tarifLocation: undefined,
      depotGarantie: 400,
      arrhes: 50,
      paiementArrhes: {
        date: new Date().toISOString().split('T')[0],
        method: undefined
      },
      status: 'brouillon'
    };

    console.log('🔍 RentalContractForm - initialData.client:', initialData?.client);

    const mergedData = {
      ...defaultValues,
      ...initialData,
      // Fusionner le client correctement pour ne pas perdre le prénom
      client: {
        ...defaultValues.client,
        ...(initialData?.client || {})
      },
      // Force les nouvelles valeurs par défaut si elles ne sont pas définies dans initialData
      depotGarantie: initialData?.depotGarantie ?? 400,
      arrhes: initialData?.arrhes ?? 50
    };

    console.log('🔍 RentalContractForm - merged client:', mergedData.client);

    return mergedData;
  });

  const paymentMethods: { value: PaymentMethod; label: string }[] = [
    { value: 'especes', label: 'Espèces' },
    { value: 'carte', label: 'Carte bancaire' },
    { value: 'virement', label: 'Virement' },
    { value: 'cheque', label: 'Chèque' },
    { value: 'autre', label: 'Autre' }
  ];

  // Mettre à jour le vendeur quand l'utilisateur se connecte
  useEffect(() => {
    if (user?.prenom && !form.vendeur) {
      setForm(prev => ({
        ...prev,
        vendeur: user.prenom as Vendeur
      }));
    }
  }, [user, form.vendeur]);

  // Auto-sauvegarde des données quand elles changent
  useEffect(() => {
    if (onAutoSave && form !== initialData) {
      const timeoutId = setTimeout(() => {
        onAutoSave(form);
      }, 500); // Debounce de 500ms pour éviter trop d'appels

      return () => clearTimeout(timeoutId);
    }
  }, [form, onAutoSave, initialData]);

  const updateForm = (field: keyof RentalContract, value: any) => {
    setForm(prev => {
      const updated = { ...prev, [field]: value };
      
      // Si la date d'événement change, recalculer automatiquement les dates de retrait et retour
      if (field === 'dateEvenement' && value instanceof Date) {
        const defaultDates = calculateDefaultDates(value);
        updated.dateRetrait = defaultDates.dateRetrait;
        updated.dateRetour = defaultDates.dateRetour;
      }
      
      return updated;
    });
  };

  const updatePayment = (type: 'arrhes' | 'solde', field: string, value: any) => {
    const paymentField = type === 'arrhes' ? 'paiementArrhes' : 'paiementSolde';
    setForm(prev => ({
      ...prev,
      [paymentField]: { ...prev[paymentField], [field]: value }
    }));
  };

  const handleSubmit = () => {
    onSubmit(form as Omit<RentalContract, 'id' | 'numero' | 'createdAt' | 'updatedAt'>);
  };

  const handleSave = () => {
    onSaveDraft(form as Omit<RentalContract, 'id' | 'numero' | 'createdAt' | 'updatedAt'>);
  };

  const isFormValid = form.client?.nom && form.client?.telephone && form.dateEvenement && form.dateRetrait && form.dateRetour;

  return (
    <>
      <style>{dateInputStyles}</style>
      <div className="space-y-6 sm:space-y-8">
      
      {/* 1. Dates importantes */}
      <div className="border-b border-gray-200 pb-8">
        <h2 className="flex items-center gap-2 sm:gap-3 text-base sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-2 rounded-lg shadow-md">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          1. Dates importantes
        </h2>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 flex-wrap">
          <div>
            <Label className="block text-left text-xs sm:text-sm font-semibold text-gray-700 mb-2">Date de l'événement</Label>
            <Input
              type="date"
              value={form.dateEvenement?.toISOString().split('T')[0] || ''}
              onChange={(e) => updateForm('dateEvenement', new Date(e.target.value))}
              className="w-40 bg-white/70 border-gray-300 text-gray-900 focus:border-amber-500 focus:ring-amber-500/20 rounded-xl transition-all shadow-sm pl-3 pr-1 text-left date-input-tight"
            />
          </div>
          <div>
            <Label className="block text-left text-xs sm:text-sm font-semibold text-gray-700 mb-2">À prendre le</Label>
            <Input
              type="date"
              value={form.dateRetrait?.toISOString().split('T')[0] || ''}
              onChange={(e) => updateForm('dateRetrait', new Date(e.target.value))}
              className="w-40 bg-white/70 border-gray-300 text-gray-900 focus:border-amber-500 focus:ring-amber-500/20 rounded-xl transition-all shadow-sm pl-3 pr-1 text-left date-input-tight"
            />
          </div>
          <div>
            <Label className="block text-left text-xs sm:text-sm font-semibold text-gray-700 mb-2">À rendre le</Label>
            <Input
              type="date"
              value={form.dateRetour?.toISOString().split('T')[0] || ''}
              onChange={(e) => updateForm('dateRetour', new Date(e.target.value))}
              className="w-40 bg-white/70 border-gray-300 text-gray-900 focus:border-amber-500 focus:ring-amber-500/20 rounded-xl transition-all shadow-sm pl-3 pr-1 text-left date-input-tight"
            />
          </div>
        </div>
      </div>

      {/* 2. Tarification */}
      <div className="border-b border-gray-200 pb-8">
        <h2 className="flex items-center gap-2 sm:gap-3 text-base sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-2 rounded-lg shadow-md">
            <Euro className="w-5 h-5 text-white" />
          </div>
          2. Tarification
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {/* Tarif de location */}
          <div>
            <Label className="block text-left text-xs sm:text-sm font-semibold text-gray-700 mb-2">Tarif de location</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={form.tarifLocation || ''}
              onChange={(e) => updateForm('tarifLocation', e.target.value ? parseFloat(e.target.value) : undefined)}
              className="bg-white/70 border-gray-300 text-gray-900 focus:border-amber-500 focus:ring-amber-500/20 rounded-xl transition-all shadow-sm"
            />
            <div className="mt-2">
              <Select
                value={form.paiementSolde?.method || 'none'}
                onValueChange={(value) => updatePayment('solde', 'method', value === 'none' ? undefined : value)}
              >
                <SelectTrigger className="bg-white/70 border-gray-300 text-gray-900 focus:border-amber-500 hover:bg-white/90 transition-all shadow-sm rounded-xl">
                  <SelectValue placeholder="Moyen de paiement" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-300 text-gray-900">
                  <SelectItem value="none">Moyen de paiement</SelectItem>
                  <SelectItem value="carte">Payé en carte</SelectItem>
                  <SelectItem value="cheque">Payé en chèque</SelectItem>
                  <SelectItem value="especes">Payé en espèces</SelectItem>
                  <SelectItem value="virement">Payé en virement</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Dépôt de garantie */}
          <div>
            <Label className="block text-left text-xs sm:text-sm font-semibold text-gray-700 mb-2">Dépôt de garantie</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={form.depotGarantie || 0}
              onChange={(e) => updateForm('depotGarantie', parseFloat(e.target.value) || 0)}
              className="bg-white/70 border-gray-300 text-gray-900 focus:border-amber-500 focus:ring-amber-500/20 rounded-xl transition-all shadow-sm"
            />
            <div className="mt-2">
              <Select
                value={form.paiementDepotGarantie?.method || 'none'}
                onValueChange={(value) => updateForm('paiementDepotGarantie', value === 'none' ? undefined : { method: value })}
              >
                <SelectTrigger className="bg-white/70 border-gray-300 text-gray-900 focus:border-amber-500 hover:bg-white/90 transition-all shadow-sm rounded-xl">
                  <SelectValue placeholder="Non versée" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-300 text-gray-900">
                  <SelectItem value="none">Non versée</SelectItem>
                  <SelectItem value="carte">Faite en carte</SelectItem>
                  <SelectItem value="cheque">Faite en chèque</SelectItem>
                  <SelectItem value="especes">Faite en espèce</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Arrhes */}
          <div>
            <Label className="block text-left text-xs sm:text-sm font-semibold text-gray-700 mb-2">Arrhes</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={form.arrhes || 0}
              onChange={(e) => updateForm('arrhes', parseFloat(e.target.value) || 0)}
              className="bg-white/70 border-gray-300 text-gray-900 focus:border-amber-500 focus:ring-amber-500/20 rounded-xl transition-all shadow-sm"
            />
            <div className="mt-2">
              <Select
                value={form.paiementArrhes?.method || 'none'}
                onValueChange={(value) => updateForm('paiementArrhes', value === 'none' ? undefined : { method: value, date: new Date().toISOString().split('T')[0] })}
              >
                <SelectTrigger className="bg-white/70 border-gray-300 text-gray-900 focus:border-amber-500 hover:bg-white/90 transition-all shadow-sm rounded-xl">
                  <SelectValue placeholder="Non versées" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-300 text-gray-900">
                  <SelectItem value="none">Non versées</SelectItem>
                  <SelectItem value="carte">Payées en carte</SelectItem>
                  <SelectItem value="cheque">Payées en chèque</SelectItem>
                  <SelectItem value="especes">Payées en espèces</SelectItem>
                  <SelectItem value="virement">Payées en virement</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div>
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          {!isFormValid && (
            <p className="text-sm text-red-600 text-left order-last sm:order-first">
              ⚠️ Veuillez remplir les champs obligatoires
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto sm:ml-auto">
            <Button
              variant="outline"
              onClick={handleSave}
              className="px-6 bg-white/70 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl transition-all shadow-sm"
            >
              💾 Sauvegarder brouillon
            </Button>
            <Button
              onClick={isEditMode ? handleSave : handleSubmit}
              disabled={!isFormValid}
              className="px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isEditMode ? "💾 Sauvegarder les modifications" : "📤 Créer le bon de location"}
            </Button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}