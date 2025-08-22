import React, { useState } from 'react';
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
  onPrint?: (contractId: string, type: 'jj' | 'client') => void;
  initialData?: Partial<RentalContract>;
}

export function RentalContractForm({ onSubmit, onSaveDraft, onPrint, initialData }: RentalContractFormProps) {
  const [form, setForm] = useState<Partial<RentalContract>>({
    dateCreation: new Date(),
    dateEvenement: new Date(),
    dateRetrait: new Date(),
    dateRetour: new Date(),
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
    status: 'brouillon',
    rendu: false,
    ...initialData
  });

  const paymentMethods: { value: PaymentMethod; label: string }[] = [
    { value: 'especes', label: 'Espèces' },
    { value: 'carte', label: 'Carte bancaire' },
    { value: 'virement', label: 'Virement' },
    { value: 'cheque', label: 'Chèque' },
    { value: 'autre', label: 'Autre' }
  ];

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
    <div className="space-y-8">
      
      {/* 1. Dates importantes */}
      <div className="border-b border-gray-200 pb-8">
        <h2 className="flex items-center gap-3 text-xl font-bold text-gray-900 mb-6">
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-2 rounded-lg shadow-md">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          1. Dates importantes
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label className="block text-left text-sm font-semibold text-gray-700 mb-2">Date de l'événement</Label>
            <Input
              type="date"
              value={form.dateEvenement?.toISOString().split('T')[0] || ''}
              onChange={(e) => updateForm('dateEvenement', new Date(e.target.value))}
              className="bg-white/70 border-gray-300 text-gray-900 focus:border-amber-500 focus:ring-amber-500/20 rounded-xl transition-all shadow-sm"
            />
          </div>
          <div>
            <Label className="block text-left text-sm font-semibold text-gray-700 mb-2">À prendre dès 9h le</Label>
            <Input
              type="date"
              value={form.dateRetrait?.toISOString().split('T')[0] || ''}
              onChange={(e) => updateForm('dateRetrait', new Date(e.target.value))}
              className="bg-white/70 border-gray-300 text-gray-900 focus:border-amber-500 focus:ring-amber-500/20 rounded-xl transition-all shadow-sm"
            />
          </div>
          <div>
            <Label className="block text-left text-sm font-semibold text-gray-700 mb-2">À rendre dès 9h le</Label>
            <Input
              type="date"
              value={form.dateRetour?.toISOString().split('T')[0] || ''}
              onChange={(e) => updateForm('dateRetour', new Date(e.target.value))}
              className="bg-white/70 border-gray-300 text-gray-900 focus:border-amber-500 focus:ring-amber-500/20 rounded-xl transition-all shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* 2. Tarification */}
      <div className="border-b border-gray-200 pb-8">
        <h2 className="flex items-center gap-3 text-xl font-bold text-gray-900 mb-6">
          <div className="bg-gradient-to-br from-green-500 to-green-600 p-2 rounded-lg shadow-md">
            <Euro className="w-5 h-5 text-white" />
          </div>
          2. Tarification
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label className="block text-left text-sm font-semibold text-gray-700 mb-2">Tarif de location (€)</Label>
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
            <Label className="block text-left text-sm font-semibold text-gray-700 mb-2">Dépôt de garantie (€)</Label>
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
            <Label className="block text-left text-sm font-semibold text-gray-700 mb-2">Arrhes (€)</Label>
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
          <h2 className="flex items-center gap-3 text-xl font-bold text-gray-900 mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-lg shadow-md">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            3. Paiement des arrhes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="block text-left text-sm font-semibold text-gray-700 mb-2">Payé le</Label>
              <Input
                type="date"
                value={form.paiementArrhes?.date ? new Date(form.paiementArrhes.date).toISOString().split('T')[0] : ''}
                onChange={(e) => updatePayment('arrhes', 'date', e.target.value)}
                className="bg-white/70 border-gray-300 text-gray-900 focus:border-amber-500 focus:ring-amber-500/20 rounded-xl transition-all shadow-sm"
              />
            </div>
            <div>
              <Label className="block text-left text-sm font-semibold text-gray-700 mb-2">Mode de paiement</Label>
              <Select 
                value={form.paiementArrhes?.method || ''} 
                onValueChange={(value) => updatePayment('arrhes', 'method', value)}
              >
                <SelectTrigger className="bg-white/70 border-gray-300 text-gray-900 focus:border-amber-500 hover:bg-white/90 transition-all shadow-sm rounded-xl">
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

      {/* 4. Retour de la tenue */}
      <div className="border-b border-gray-200 pb-8">
        <h2 className="flex items-center gap-3 text-xl font-bold text-gray-900 mb-6">
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-2 rounded-lg shadow-md">
            <CheckCircle className="w-5 h-5 text-white" />
          </div>
          4. Retour de la tenue
        </h2>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.rendu || false}
              onChange={(e) => updateForm('rendu', e.target.checked)}
              className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500 rounded-md"
            />
            <span className="text-sm font-semibold text-gray-700">Tenue rendue</span>
          </label>
          
          {form.rendu && (
            <div className="flex-1 max-w-xs">
              <Input
                type="date"
                value={form.dateRendu ? new Date(form.dateRendu).toISOString().split('T')[0] : ''}
                onChange={(e) => updateForm('dateRendu', e.target.value)}
                className="bg-white/70 border-gray-300 text-gray-900 focus:border-amber-500 focus:ring-amber-500/20 rounded-xl transition-all shadow-sm"
                placeholder="Date de retour"
              />
            </div>
          )}
        </div>
      </div>

      {/* 5. Notes */}
      <div className="border-b border-gray-200 pb-8">
        <h2 className="flex items-center gap-3 text-xl font-bold text-gray-900 mb-6">
          <div className="bg-gradient-to-br from-gray-500 to-gray-600 p-2 rounded-lg shadow-md">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          5. Notes
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
        <div className="flex gap-4 justify-end">
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
            📤 Créer le bon de location
          </Button>
          
          {initialData?.id && onPrint && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => onPrint(initialData.id!, 'jj')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100 rounded-xl transition-all"
              >
                <Printer className="w-4 h-4" />
                Imprimer JJ
              </Button>
              
              <Button
                variant="outline"
                onClick={() => onPrint(initialData.id!, 'client')}
                className="flex items-center gap-2 px-4 py-2 bg-green-50 border-green-300 text-green-700 hover:bg-green-100 rounded-xl transition-all"
              >
                <Printer className="w-4 h-4" />
                Imprimer Client
              </Button>
            </div>
          )}
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