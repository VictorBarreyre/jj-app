import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { GroupRentalInfo, GroupClientInfo, createEmptyClient, generateGroupName } from '@/types/group-rental';
import { Vendeur } from '@/types/measurement-form';
import { 
  Calendar, 
  User, 
  Users, 
  Plus, 
  Trash2, 
  MessageSquare,
  AlertTriangle 
} from 'lucide-react';

interface GroupSetupFormProps {
  onSubmit: (groupData: Omit<GroupRentalInfo, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => void;
  onSave?: (groupData: Omit<GroupRentalInfo, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => void;
  initialData?: Partial<GroupRentalInfo>;
}

const VENDEURS: Vendeur[] = ['Sophie', 'Olivier', 'Laurent'];

export function GroupSetupForm({ onSubmit, onSave, initialData }: GroupSetupFormProps) {
  const [formData, setFormData] = useState<Partial<GroupRentalInfo>>({
    groupName: '',
    telephone: '',
    email: '',
    dateEssai: new Date(),
    vendeur: undefined,
    clients: [createEmptyClient()],
    groupNotes: '',
    ...initialData
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.vendeur) {
      newErrors.vendeur = 'Veuillez sélectionner un vendeur';
    }

    if (!formData.dateEssai) {
      newErrors.dateEssai = 'Veuillez sélectionner une date d\'essai';
    }

    if (!formData.telephone?.trim()) {
      newErrors.telephone = 'Le téléphone est obligatoire';
    }

    if (!formData.clients || formData.clients.length === 0) {
      newErrors.clients = 'Veuillez ajouter au moins une personne';
    } else {
      formData.clients.forEach((client, index) => {
        if (!client.nom.trim()) {
          newErrors[`client_${index}_nom`] = 'Le nom est obligatoire';
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const updateBasicInfo = (field: keyof GroupRentalInfo, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-générer le nom du groupe si nécessaire
    if (field === 'clients') {
      const clients = value as GroupClientInfo[];
      setFormData(prev => ({
        ...prev,
        [field]: value,
        groupName: generateGroupName(clients)
      }));
    }
  };

  const updateClient = (index: number, field: keyof GroupClientInfo, value: any) => {
    const updatedClients = [...(formData.clients || [])];
    if (updatedClients[index]) {
      updatedClients[index] = { ...updatedClients[index], [field]: value };
      updateBasicInfo('clients', updatedClients);
    }
  };

  const addClient = () => {
    const newClient = createEmptyClient();
    updateBasicInfo('clients', [...(formData.clients || []), newClient]);
  };

  const removeClient = (index: number) => {
    if (formData.clients && formData.clients.length > 1) {
      const updatedClients = formData.clients.filter((_, i) => i !== index);
      updateBasicInfo('clients', updatedClients);
    }
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData as Omit<GroupRentalInfo, 'id' | 'createdAt' | 'updatedAt' | 'status'>);
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave(formData as Omit<GroupRentalInfo, 'id' | 'createdAt' | 'updatedAt' | 'status'>);
    }
  };

  const isFormValid = formData.vendeur && 
                     formData.dateEssai && 
                     formData.telephone?.trim() &&
                     formData.clients && 
                     formData.clients.length > 0 && 
                     formData.clients.every(c => c.nom.trim());

  return (
    <div className="space-y-6 sm:space-y-8">
      
      {/* 1. Informations de base du groupe */}
      <div className="border-b border-gray-200 pb-8">
        <h2 className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-2 rounded-lg shadow-md">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          1. Informations du groupe
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="dateEssai" className="block text-left text-sm font-semibold text-gray-700 mb-2">
              Date d'essai *
            </Label>
            <Input
              id="dateEssai"
              type="date"
              value={formData.dateEssai?.toISOString().split('T')[0] || ''}
              onChange={(e) => updateBasicInfo('dateEssai', new Date(e.target.value))}
              className="bg-white/70 border-gray-300 text-gray-900 focus:border-amber-500 focus:ring-amber-500/20 rounded-xl transition-all shadow-sm"
            />
            {errors.dateEssai && (
              <p className="text-red-500 text-xs mt-1">{errors.dateEssai}</p>
            )}
          </div>

          <div>
            <Label htmlFor="vendeur" className="block text-left text-sm font-semibold text-gray-700 mb-2">
              Vendeur *
            </Label>
            <Select value={formData.vendeur || ''} onValueChange={(value) => updateBasicInfo('vendeur', value as Vendeur)}>
              <SelectTrigger className="bg-white/70 border-gray-300 text-gray-900 focus:border-amber-500 hover:bg-white/90 transition-all shadow-sm rounded-xl">
                <SelectValue placeholder="Sélectionner un vendeur" />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-300 text-gray-900">
                {VENDEURS.map(vendeur => (
                  <SelectItem key={vendeur} value={vendeur}>{vendeur}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.vendeur && (
              <p className="text-red-500 text-xs mt-1">{errors.vendeur}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <Label htmlFor="telephone" className="block text-left text-sm font-semibold text-gray-700 mb-2">
              Téléphone de contact *
            </Label>
            <Input
              id="telephone"
              type="tel"
              value={formData.telephone || ''}
              onChange={(e) => updateBasicInfo('telephone', e.target.value)}
              placeholder="06 12 34 56 78"
              className="bg-white/70 border-gray-300 text-gray-900 focus:border-amber-500 focus:ring-amber-500/20 rounded-xl transition-all shadow-sm"
            />
            {errors.telephone && (
              <p className="text-red-500 text-xs mt-1">{errors.telephone}</p>
            )}
          </div>

          <div>
            <Label htmlFor="email" className="block text-left text-sm font-semibold text-gray-700 mb-2">
              Email de contact
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email || ''}
              onChange={(e) => updateBasicInfo('email', e.target.value)}
              placeholder="contact@exemple.com"
              className="bg-white/70 border-gray-300 text-gray-900 focus:border-amber-500 focus:ring-amber-500/20 rounded-xl transition-all shadow-sm"
            />
          </div>
        </div>

        <div className="mt-4">
          <Label htmlFor="groupName" className="block text-left text-sm font-semibold text-gray-700 mb-2">
            Nom du groupe
          </Label>
          <Input
            id="groupName"
            value={formData.groupName || ''}
            onChange={(e) => updateBasicInfo('groupName', e.target.value)}
            placeholder="Nom automatique basé sur les clients"
            className="bg-white/70 border-gray-300 text-gray-900 focus:border-amber-500 focus:ring-amber-500/20 rounded-xl transition-all shadow-sm"
          />
          <p className="text-xs text-gray-500 mt-1">
            Le nom sera automatiquement généré si vous le laissez vide
          </p>
        </div>
      </div>

      {/* 2. Gestion des clients */}
      <div className="border-b border-gray-200 pb-8">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl font-bold text-gray-900">
            <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-2 rounded-lg shadow-md">
              <Users className="w-5 h-5 text-white" />
            </div>
            2. Personnes du groupe ({formData.clients?.length || 0})
          </h2>
          
          <Button
            type="button"
            onClick={addClient}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter
          </Button>
        </div>

        {errors.clients && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-3 mb-4">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <span className="text-sm text-red-700">{errors.clients}</span>
          </div>
        )}

        <div className="space-y-4">
          {formData.clients?.map((client, index) => (
            <div key={client.id} className="border-2 border-gray-200 rounded-lg p-4 sm:p-6 bg-gray-50/50">
              <div className="flex items-center justify-between mb-4">
                <h4 className="flex items-center gap-2 text-lg font-bold text-gray-800">
                  <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 text-sm font-bold">
                    {index + 1}
                  </div>
                  Personne {index + 1}
                </h4>
                
                {formData.clients && formData.clients.length > 1 && (
                  <Button
                    type="button"
                    onClick={() => removeClient(index)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label className="flex items-center justify-start gap-1 text-sm font-semibold text-gray-700 mb-2">
                    <User className="w-3 h-3" />
                    Nom *
                  </Label>
                  <Input
                    value={client.nom}
                    onChange={(e) => updateClient(index, 'nom', e.target.value)}
                    placeholder="Nom de la personne"
                    className="bg-white/70 border-gray-300 text-gray-900 focus:border-amber-500 focus:ring-amber-500/20 rounded-xl transition-all shadow-sm"
                  />
                  {errors[`client_${index}_nom`] && (
                    <p className="text-red-500 text-xs mt-1">{errors[`client_${index}_nom`]}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Notes du groupe */}
      <div className="border-b border-gray-200 pb-8">
        <h2 className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-2 rounded-lg shadow-md">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          3. Notes du groupe
        </h2>
        <Textarea
          value={formData.groupNotes || ''}
          onChange={(e) => updateBasicInfo('groupNotes', e.target.value)}
          placeholder="Notes générales pour ce groupe de location..."
          rows={3}
          className="bg-white/70 border-gray-300 text-gray-900 focus:border-amber-500 focus:ring-amber-500/20 rounded-xl transition-all shadow-sm"
        />
      </div>

      {/* 4. Actions */}
      <div>
        <div className="flex flex-col sm:flex-row gap-4 justify-end">
          {onSave && (
            <Button
              type="button"
              variant="outline"
              onClick={handleSave}
              className="px-6 bg-white/70 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl transition-all shadow-sm"
            >
              💾 Sauvegarder brouillon
            </Button>
          )}
          <Button
            onClick={handleSubmit}
            disabled={!isFormValid}
            className="px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            ➡️ Continuer vers les mesures
          </Button>
        </div>
        
        {!isFormValid && (
          <p className="text-sm text-red-600 text-center mt-3">
            ⚠️ Veuillez remplir tous les champs obligatoires
          </p>
        )}
      </div>
    </div>
  );
}