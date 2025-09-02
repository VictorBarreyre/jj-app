import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, User, Phone, Mail, Shirt, MessageSquare } from 'lucide-react';
import { MeasurementForm as MeasurementFormType, Vendeur, TailleChaussure, TailleChapeau } from '@/types/measurement-form';
import { DynamicProductSelector } from '@/components/stock/DynamicProductSelector';
import { StockIndicator } from '@/components/stock/StockIndicator';

interface MeasurementFormProps {
  onSubmit: (form: MeasurementFormType) => void;
  onSave: (form: MeasurementFormType) => void;
  initialData?: Partial<MeasurementFormType>;
}

const VENDEURS: Vendeur[] = ['Sophie', 'Olivier', 'Laurent', 'Alexis', 'Mael'];
const TAILLES_CHAUSSURES: TailleChaussure[] = ['38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48'];
const TAILLES_CHAPEAUX: TailleChapeau[] = ['54', '55', '56', '57', '58', '59', '60', '61', '62'];

export function MeasurementForm({ onSubmit, onSave, initialData }: MeasurementFormProps) {
  const [form, setForm] = useState<Partial<MeasurementFormType>>({
    dateEssai: new Date(),
    vendeur: undefined,
    client: {
      nom: '',
      telephone: '',
      email: '',
      isExistingClient: false
    },
    tenue: {},
    notes: '',
    ...initialData
  });
  const [vesteReferences, setVesteReferences] = useState<any[]>([]);

  // Charger les références de veste au montage
  useEffect(() => {
    const fetchVesteReferences = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/stock/references/veste');
        if (response.ok) {
          const data = await response.json();
          setVesteReferences(data.references || []);
        }
      } catch (error) {
        console.warn('Erreur lors du chargement des références veste:', error);
      }
    };
    fetchVesteReferences();
  }, []);

  // Fonction pour vérifier si la veste sélectionnée est un smoking
  const isSmokingSelected = () => {
    const vesteRef = form.tenue?.veste?.reference;
    if (!vesteRef || vesteReferences.length === 0) return false;
    
    const reference = vesteReferences.find(ref => ref.id === vesteRef);
    return reference?.subCategory === 'smoking';
  };

  const updateForm = (field: keyof MeasurementFormType, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const updateClient = (field: keyof MeasurementFormType['client'], value: any) => {
    setForm(prev => ({
      ...prev,
      client: { ...prev.client!, [field]: value }
    }));
  };

  const updateTenue = (category: 'veste' | 'gilet' | 'pantalon', field: string, value: any) => {
    setForm(prev => ({
      ...prev,
      tenue: {
        ...prev.tenue,
        [category]: {
          ...prev.tenue?.[category],
          [field]: value
        }
      }
    }));
  };

  const updateTenueReference = (category: 'veste' | 'gilet' | 'pantalon', referenceId: string) => {
    updateTenue(category, 'reference', referenceId);
    // Reset la taille quand on change de référence
    updateTenue(category, 'taille', undefined);
    updateTenue(category, 'couleur', undefined);
    
    // Si on sélectionne une veste qui est un smoking, réinitialiser le gilet
    if (category === 'veste') {
      const reference = vesteReferences.find(ref => ref.id === referenceId);
      if (reference?.subCategory === 'smoking') {
        setForm(prev => ({
          ...prev,
          tenue: {
            ...prev.tenue,
            gilet: undefined
          }
        }));
      }
    }
  };

  const updateTenueSize = (category: 'veste' | 'gilet' | 'pantalon', size: string) => {
    updateTenue(category, 'taille', size);
  };

  const updateTenueColor = (category: 'veste' | 'gilet' | 'pantalon', color: string) => {
    updateTenue(category, 'couleur', color);
  };

  const updateCeinture = (field: string, value: any) => {
    setForm(prev => ({
      ...prev,
      tenue: {
        ...prev.tenue,
        ceinture: {
          ...prev.tenue?.ceinture,
          [field]: value
        }
      }
    }));
  };

  const updateCeintureReference = (referenceId: string) => {
    updateCeinture('reference', referenceId);
    // Reset la taille quand on change de référence
    updateCeinture('taille', undefined);
    updateCeinture('couleur', undefined);
  };

  const updateCeintureSize = (size: string) => {
    updateCeinture('taille', size);
  };

  const updateCeintureColor = (color: string) => {
    updateCeinture('couleur', color);
  };

  const updateAccessoire = (field: 'tailleChapeau' | 'tailleChaussures', value: any) => {
    setForm(prev => ({
      ...prev,
      tenue: {
        ...prev.tenue,
        [field]: value
      }
    }));
  };

  const handleSubmit = () => {
    if (form.vendeur && form.client?.nom && form.client?.telephone) {
      onSubmit(form as MeasurementFormType);
    }
  };

  const handleSave = () => {
    onSave(form as MeasurementFormType);
  };

  const isFormValid = form.vendeur && form.client?.nom && form.client?.telephone;

  return (
    <div className="space-y-6 sm:space-y-8">

      {/* 1. Informations de base */}
      <div className="border-b border-gray-200 pb-8">
        <h2 className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-2 rounded-lg shadow-md">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          1. Informations de base
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="dateEssai" className="block text-left text-sm font-semibold text-gray-700 mb-2">Date d'événement</Label>
            <Input
              id="dateEssai"
              type="date"
              value={form.dateEssai?.toISOString().split('T')[0] || ''}
              onChange={(e) => updateForm('dateEssai', new Date(e.target.value))}
              className="bg-white/70 border-gray-300 text-gray-900 focus:border-amber-500 focus:ring-amber-500/20 rounded-xl transition-all shadow-sm"
            />
          </div>
          <div className="md:col-span-3">
            <Label htmlFor="vendeur" className="block text-left text-sm font-semibold text-gray-700 mb-2">Vendeur</Label>
            <Select value={form.vendeur} onValueChange={(value) => updateForm('vendeur', value as Vendeur)}>
              <SelectTrigger className="bg-white/70 border-gray-300 text-gray-900 focus:border-amber-500 hover:bg-white/90 transition-all shadow-sm rounded-xl">
                <SelectValue placeholder="Sélectionner un vendeur" />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-300 text-gray-900">
                {VENDEURS.map(vendeur => (
                  <SelectItem key={vendeur} value={vendeur}>{vendeur}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* 2. Informations client */}
      <div className="border-b border-gray-200 pb-8">
        <h2 className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-2 rounded-lg shadow-md">
            <User className="w-5 h-5 text-white" />
          </div>
          2. Informations Client
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="nom" className="flex items-center justify-start gap-1 text-sm font-semibold text-gray-700 mb-2">
              <User className="w-3 h-3" />
              Nom *
            </Label>
            <Input
              id="nom"
              value={form.client?.nom || ''}
              onChange={(e) => updateClient('nom', e.target.value)}
              placeholder="Nom du client"
              className="bg-white/70 border-gray-300 text-gray-900 focus:border-amber-500 focus:ring-amber-500/20 rounded-xl transition-all shadow-sm"
              required
            />
          </div>
          <div>
            <Label htmlFor="telephone" className="flex items-center justify-start gap-1 text-sm font-semibold text-gray-700 mb-2">
              <Phone className="w-3 h-3" />
              Téléphone *
            </Label>
            <Input
              id="telephone"
              type="tel"
              value={form.client?.telephone || ''}
              onChange={(e) => updateClient('telephone', e.target.value)}
              placeholder="06 12 34 56 78"
              className="bg-white/70 border-gray-300 text-gray-900 focus:border-amber-500 focus:ring-amber-500/20 rounded-xl transition-all shadow-sm"
              required
            />
          </div>
          <div>
            <Label htmlFor="email" className="flex items-center justify-start gap-1 text-sm font-semibold text-gray-700 mb-2">
              <Mail className="w-3 h-3" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={form.client?.email || ''}
              onChange={(e) => updateClient('email', e.target.value)}
              placeholder="email@exemple.com"
              className="bg-white/70 border-gray-300 text-gray-900 focus:border-amber-500 focus:ring-amber-500/20 rounded-xl transition-all shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* 3. Sélection de la tenue */}
      <div className="border-b border-gray-200 pb-8">
        <h2 className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-2 rounded-lg shadow-md">
            <Shirt className="w-5 h-5 text-white" />
          </div>
          3. Sélection de la Tenue
        </h2>
        <div className="space-y-6">

          {/* Veste */}
          <div className="border-2 border-gray-200 rounded-lg p-4 sm:p-6 bg-gray-50/50">
            <h4 className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-4">
              <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 text-sm font-bold">A</div>
              Veste
              <StockIndicator 
                selectedReference={form.tenue?.veste?.reference} 
                selectedSize={form.tenue?.veste?.taille} 
              />
            </h4>
            <DynamicProductSelector
              category="veste"
              selectedReference={form.tenue?.veste?.reference}
              selectedSize={form.tenue?.veste?.taille}
              selectedColor={form.tenue?.veste?.couleur}
              onReferenceChange={(ref) => updateTenueReference('veste', ref)}
              onSizeChange={(size) => updateTenueSize('veste', size)}
              onColorChange={(color) => updateTenueColor('veste', color)}
            />
            
            {/* Longueur de manche et notes veste */} 
            {form.tenue?.veste?.reference && (
              <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                <div>
                  <Label htmlFor="longueurManche" className="block text-left text-sm font-semibold text-gray-700 mb-2">
                    Longueur de manche (cm)
                  </Label>
                  <Input
                    id="longueurManche"
                    type="number"
                    min="0"
                    step="0.5"
                    value={form.tenue?.veste?.longueurManche || ''}
                    onChange={(e) => updateTenue('veste', 'longueurManche', e.target.value)}
                    placeholder="Ex: 60"
                    className="w-32 bg-white/70 border-gray-300 text-gray-900 focus:border-amber-500 focus:ring-amber-500/20 rounded-xl transition-all shadow-sm"
                  />
                </div>
                <Textarea
                  value={form.tenue?.veste?.notes || ''}
                  onChange={(e) => updateTenue('veste', 'notes', e.target.value)}
                  placeholder="Notes pour la veste (optionnel)"
                  rows={2}
                  className="bg-white/70 border-gray-300 text-gray-900 focus:border-amber-500 focus:ring-amber-500/20 rounded-xl transition-all shadow-sm"
                />
              </div>
            )}
          </div>

          {/* Gilet - Masqué si smoking sélectionné */}
          {!isSmokingSelected() && (
            <div className="border-2 border-gray-200 rounded-lg p-4 sm:p-6 bg-gray-50/50">
            <h4 className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-4">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-700 text-sm font-bold">B</div>
              Gilet
              <StockIndicator 
                selectedReference={form.tenue?.gilet?.reference} 
                selectedSize={form.tenue?.gilet?.taille} 
              />
            </h4>
            <DynamicProductSelector
              category="gilet"
              selectedReference={form.tenue?.gilet?.reference}
              selectedSize={form.tenue?.gilet?.taille}
              selectedColor={form.tenue?.gilet?.couleur}
              onReferenceChange={(ref) => updateTenueReference('gilet', ref)}
              onSizeChange={(size) => updateTenueSize('gilet', size)}
              onColorChange={(color) => updateTenueColor('gilet', color)}
            />
            
            {/* Notes gilet */}
            {form.tenue?.gilet?.reference && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Textarea
                  value={form.tenue?.gilet?.notes || ''}
                  onChange={(e) => updateTenue('gilet', 'notes', e.target.value)}
                  placeholder="Notes pour le gilet (optionnel)"
                  rows={2}
                  className="bg-white/70 border-gray-300 text-gray-900 focus:border-amber-500 focus:ring-amber-500/20 rounded-xl transition-all shadow-sm"
                />
              </div>
            )}
          </div>
          )}

          {/* Pantalon */}
          <div className="border-2 border-gray-200 rounded-lg p-4 sm:p-6 bg-gray-50/50">
            <h4 className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-4">
              <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 text-sm font-bold">C</div>
              Pantalon
              <StockIndicator 
                selectedReference={form.tenue?.pantalon?.reference} 
                selectedSize={form.tenue?.pantalon?.taille} 
              />
            </h4>
            <DynamicProductSelector
              category="pantalon"
              selectedReference={form.tenue?.pantalon?.reference}
              selectedSize={form.tenue?.pantalon?.taille}
              selectedColor={form.tenue?.pantalon?.couleur}
              onReferenceChange={(ref) => updateTenueReference('pantalon', ref)}
              onSizeChange={(size) => updateTenueSize('pantalon', size)}
              onColorChange={(color) => updateTenueColor('pantalon', color)}
            />

            {/* Longueur pantalon et notes pantalon */}
            {form.tenue?.pantalon?.reference && (
              <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                <div>
                  <Input
                    id="longueurPantalon"
                    type="number"
                    min="0"
                    step="0.5"
                    value={form.tenue?.pantalon?.longueur || ''}
                    onChange={(e) => updateTenue('pantalon', 'longueur', e.target.value)}
                    placeholder="Longueur du pantalon (cm)"
                    className="w-32 bg-white/70 border-gray-300 text-gray-900 focus:border-amber-500 focus:ring-amber-500/20 rounded-xl transition-all shadow-sm"
                  />
                </div>
                <Textarea
                  value={form.tenue?.pantalon?.notes || ''}
                  onChange={(e) => updateTenue('pantalon', 'notes', e.target.value)}
                  placeholder="Notes pour le pantalon (optionnel)"
                  rows={2}
                  className="bg-white/70 border-gray-300 text-gray-900 focus:border-amber-500 focus:ring-amber-500/20 rounded-xl transition-all shadow-sm"
                />
              </div>
            )}
          </div>

          {/* Ceinture */}
          <div className="border-2 border-gray-200 rounded-lg p-4 sm:p-6 bg-gray-50/50">
            <h4 className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-4">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 text-sm font-bold">D</div>
              Ceinture
              <StockIndicator 
                selectedReference={form.tenue?.ceinture?.reference} 
                selectedSize={form.tenue?.ceinture?.taille} 
              />
            </h4>
            <DynamicProductSelector
              category="accessoire"
              selectedReference={form.tenue?.ceinture?.reference}
              selectedSize={form.tenue?.ceinture?.taille}
              selectedColor={form.tenue?.ceinture?.couleur}
              onReferenceChange={(ref) => updateCeintureReference(ref)}
              onSizeChange={(size) => updateCeintureSize(size)}
              onColorChange={(color) => updateCeintureColor(color)}
            />
          </div>

          {/* Autres Accessoires */}
          <div className="border-2 border-gray-200 rounded-lg p-4 sm:p-6 bg-gray-50/50">
            <h4 className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-4">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-700 text-sm font-bold">E</div>
              Autres Accessoires <span className="text-sm font-normal text-gray-500">(facultatif)</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Select
                  value={form.tenue?.tailleChapeau}
                  onValueChange={(value) => updateAccessoire('tailleChapeau', value as TailleChapeau)}
                >
                  <SelectTrigger className="bg-white/70 border-gray-300 text-gray-900 focus:border-amber-500 hover:bg-white/90 transition-all shadow-sm rounded-xl">
                    <SelectValue placeholder="Taille chapeau" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-300 text-gray-900">
                    {TAILLES_CHAPEAUX.map(taille => (
                      <SelectItem key={taille} value={taille}>{taille}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select
                  value={form.tenue?.tailleChaussures}
                  onValueChange={(value) => updateAccessoire('tailleChaussures', value as TailleChaussure)}
                >
                  <SelectTrigger className="bg-white/70 border-gray-300 text-gray-900 focus:border-amber-500 hover:bg-white/90 transition-all shadow-sm rounded-xl">
                    <SelectValue placeholder="Taille chaussures" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-300 text-gray-900">
                    {TAILLES_CHAUSSURES.map(taille => (
                      <SelectItem key={taille} value={taille}>{taille}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* 4. Actions */}
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
            ➡️ Continuer vers le bon de location
          </Button>
        </div>
        {!isFormValid && (
          <p className="text-sm text-red-600 text-center mt-3">
            ⚠️ Veuillez remplir les champs obligatoires : Vendeur, Nom client, Téléphone
          </p>
        )}
      </div>
    </div>
  );
}