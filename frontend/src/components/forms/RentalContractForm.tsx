import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RentalContract, PaymentMethod } from '@/types/rental-contract';
import { TenueMeasurement, Vendeur } from '@/types/measurement-form';
import { Calendar, Euro, User, FileText, Printer, CreditCard, CheckCircle, MessageSquare } from 'lucide-react';

interface RentalContractFormProps {
  onSubmit: (contract: Omit<RentalContract, 'id' | 'numero' | 'createdAt' | 'updatedAt'>) => void;
  onSaveDraft: (contract: Omit<RentalContract, 'id' | 'numero' | 'createdAt' | 'updatedAt'>) => void;
  onAutoSave?: (contract: Partial<RentalContract>) => void;
  onPrint?: (contractId: string, type: 'jj' | 'client') => void;
  initialData?: Partial<RentalContract>;
  isEditMode?: boolean;
}

export function RentalContractForm({ onSubmit, onSaveDraft, onAutoSave, onPrint, initialData, isEditMode = false }: RentalContractFormProps) {
  const [form, setForm] = useState<Partial<RentalContract>>({
    dateCreation: new Date(),
    dateEvenement: new Date(),
    dateRetrait: new Date(),
    dateRetour: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // +3 jours par défaut
    client: {
      nom: '',
      telephone: '',
      email: ''
    },
    vendeur: 'Sophie' as Vendeur,
    tenue: {},
    tarifLocation: 0,
    depotGarantie: 50,
    arrhes: 0,
    paiementArrhes: {
      date: new Date().toISOString().split('T')[0],
      method: undefined
    },
    status: 'brouillon',
    ...initialData
  });

  const paymentMethods: { value: PaymentMethod; label: string }[] = [
    { value: 'especes', label: 'Espèces' },
    { value: 'carte', label: 'Carte bancaire' },
    { value: 'virement', label: 'Virement' },
    { value: 'cheque', label: 'Chèque' },
    { value: 'autre', label: 'Autre' }
  ];

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
    setForm(prev => ({ ...prev, [field]: value }));
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
    <div className="space-y-6 sm:space-y-8">
      
      {/* 1. Dates importantes */}
      <div className="border-b border-gray-200 pb-8">
        <h2 className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
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
              className="w-40 bg-white/70 border-gray-300 text-gray-900 focus:border-amber-500 focus:ring-amber-500/20 rounded-xl transition-all shadow-sm pl-3 pr-1"
            />
          </div>
          <div>
            <Label className="block text-left text-xs sm:text-sm font-semibold text-gray-700 mb-2">À prendre le</Label>
            <Input
              type="date"
              value={form.dateRetrait?.toISOString().split('T')[0] || ''}
              onChange={(e) => updateForm('dateRetrait', new Date(e.target.value))}
              className="w-40 bg-white/70 border-gray-300 text-gray-900 focus:border-amber-500 focus:ring-amber-500/20 rounded-xl transition-all shadow-sm pl-3 pr-1"
            />
          </div>
          <div>
            <Label className="block text-left text-xs sm:text-sm font-semibold text-gray-700 mb-2">À rendre le</Label>
            <Input
              type="date"
              value={form.dateRetour?.toISOString().split('T')[0] || ''}
              onChange={(e) => updateForm('dateRetour', new Date(e.target.value))}
              className="w-40 bg-white/70 border-gray-300 text-gray-900 focus:border-amber-500 focus:ring-amber-500/20 rounded-xl transition-all shadow-sm pl-3 pr-1"
            />
          </div>
        </div>
      </div>

      {/* 2. Tarification */}
      <div className="border-b border-gray-200 pb-8">
        <h2 className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-2 rounded-lg shadow-md">
            <Euro className="w-5 h-5 text-white" />
          </div>
          2. Tarification
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          <div>
            <Label className="block text-left text-xs sm:text-sm font-semibold text-gray-700 mb-2">Tarif de location (€)</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={form.tarifLocation || 0}
              onChange={(e) => updateForm('tarifLocation', parseFloat(e.target.value) || 0)}
              className="bg-white/70 border-gray-300 text-gray-900 focus:border-amber-500 focus:ring-amber-500/20 rounded-xl transition-all shadow-sm"
            />
          </div>
          <div>
            <Label className="block text-left text-xs sm:text-sm font-semibold text-gray-700 mb-2">Dépôt de garantie (€)</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={form.depotGarantie || 0}
              onChange={(e) => updateForm('depotGarantie', parseFloat(e.target.value) || 0)}
              className="bg-white/70 border-gray-300 text-gray-900 focus:border-amber-500 focus:ring-amber-500/20 rounded-xl transition-all shadow-sm"
            />
          </div>
          <div>
            <Label className="block text-left text-xs sm:text-sm font-semibold text-gray-700 mb-2">Arrhes (€)</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={form.arrhes || 0}
              onChange={(e) => updateForm('arrhes', parseFloat(e.target.value) || 0)}
              className="bg-white/70 border-gray-300 text-gray-900 focus:border-amber-500 focus:ring-amber-500/20 rounded-xl transition-all shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* 3. Paiement des arrhes */}
      {(form.arrhes || 0) > 0 && (
        <div className="border-b border-gray-200 pb-8">
          <h2 className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
            <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-2 rounded-lg shadow-md">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            3. Paiement des arrhes
          </h2>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div>
              <Label className="block text-left text-xs sm:text-sm font-semibold text-gray-700 mb-2">Payé le</Label>
              <Input
                type="date"
                value={form.paiementArrhes?.date ? new Date(form.paiementArrhes.date).toISOString().split('T')[0] : ''}
                onChange={(e) => updatePayment('arrhes', 'date', e.target.value)}
                className="w-40 bg-white/70 border-gray-300 text-gray-900 focus:border-amber-500 focus:ring-amber-500/20 rounded-xl transition-all shadow-sm pl-3 pr-1"
              />
            </div>
            <div>
              <Label className="block text-left text-xs sm:text-sm font-semibold text-gray-700 mb-2">Mode de paiement</Label>
              <Select 
                value={form.paiementArrhes?.method || ''} 
                onValueChange={(value) => updatePayment('arrhes', 'method', value)}
              >
                <SelectTrigger className="w-40 bg-white/70 border-gray-300 text-gray-900 focus:border-amber-500 hover:bg-white/90 transition-all shadow-sm rounded-xl [&>svg]:ml-3">
                  <SelectValue placeholder="Sélectionner un mode de paiement" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-300 text-gray-900">
                  {paymentMethods.map(method => (
                    <SelectItem key={method.value} value={method.value}>{method.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}


      {/* 5. Notes */}
      <div className="border-b border-gray-200 pb-8">
        <h2 className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
          <div className="bg-gradient-to-br from-gray-500 to-gray-600 p-2 rounded-lg shadow-md">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          4. Notes
        </h2>
        <Textarea
          value={form.notes || ''}
          onChange={(e) => updateForm('notes', e.target.value)}
          placeholder="Notes additionnelles sur le bon de location..."
          rows={4}
          className="bg-white/70 border-gray-300 text-gray-900 focus:border-amber-500 focus:ring-amber-500/20 rounded-xl transition-all shadow-sm resize-none"
        />
      </div>

      {/* Actions */}
      <div>
        <div className="flex flex-col sm:flex-row gap-4 justify-end">
          <Button 
            variant="outline" 
            onClick={handleSave} 
            className="px-6 bg-white/70 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl transition-all shadow-sm"
          >
            💾 Sauvegarder brouillon
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!isFormValid}
            className="px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {isEditMode ? "💾 Sauvegarder les modifications" : "📤 Créer le bon de location"}
          </Button>
          
        </div>
        {!isFormValid && (
          <p className="text-sm text-red-600 text-center mt-3">
            ⚠️ Veuillez remplir les champs obligatoires
          </p>
        )}
      </div>
    </div>
  );
}