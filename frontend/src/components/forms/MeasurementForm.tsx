import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, User, Phone, Mail, Shirt, Package, MessageSquare } from 'lucide-react';
import { MeasurementForm as MeasurementFormType, Vendeur, TailleVetement, LongueurVetement, TailleChaussure, TailleChapeau } from '@/types/measurement-form';
import { VESTE_CATALOG, GILET_CATALOG, PANTALON_CATALOG } from '@/types/product-catalog';

interface MeasurementFormProps {
  onSubmit: (form: MeasurementFormType) => void;
  onSave: (form: MeasurementFormType) => void;
  initialData?: Partial<MeasurementFormType>;
}

const VENDEURS: Vendeur[] = ['Sophie', 'Olivier', 'Laurent'];
const TAILLES: TailleVetement[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
const LONGUEURS: LongueurVetement[] = ['Court', 'Moyen', 'Long'];
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
    <div className="space-y-8">

      {/* 1. Informations de base */}
      <div className="border-b border-gray-200 pb-8">
        <h2 className="flex items-center gap-3 text-xl font-bold text-gray-900 mb-6">
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-2 rounded-lg shadow-md">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          1. Informations de base
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="dateEssai" className="block text-left text-sm font-semibold text-gray-700 mb-2">Date d'essai</Label>
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
        <h2 className="flex items-center gap-3 text-xl font-bold text-gray-900 mb-6">
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
        <h2 className="flex items-center gap-3 text-xl font-bold text-gray-900 mb-6">
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-2 rounded-lg shadow-md">
            <Shirt className="w-5 h-5 text-white" />
          </div>
          3. Sélection de la Tenue
        </h2>
        <div className="space-y-6">

          {/* Veste */}
          <div className="border-2 border-gray-200 rounded-lg p-6 bg-gray-50/50">
            <h4 className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-4">
              <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 text-sm font-bold">A</div>
              Veste
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Select
                  value={form.tenue?.veste?.reference}
                  onValueChange={(value) => updateTenue('veste', 'reference', value)}
                >
                  <SelectTrigger className="bg-white/70 border-gray-300 text-gray-900 focus:border-amber-500 hover:bg-white/90 transition-all shadow-sm rounded-xl">
                    <SelectValue placeholder="Sélectionner un modèle" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-300 text-gray-900">
                    <optgroup label="Jaquettes">
                      {VESTE_CATALOG.JAQUETTES.map(ref => (
                        <SelectItem key={ref} value={ref}>{ref}</SelectItem>
                      ))}
                    </optgroup>
                    <optgroup label="Costumes Ville">
                      {VESTE_CATALOG.COSTUMES_VILLE.map(ref => (
                        <SelectItem key={ref} value={ref}>{ref}</SelectItem>
                      ))}
                    </optgroup>
                    <optgroup label="Smoking">
                      {VESTE_CATALOG.SMOKING.map(ref => (
                        <SelectItem key={ref} value={ref}>{ref}</SelectItem>
                      ))}
                    </optgroup>
                    <optgroup label="Habit Queue de Pie">
                      {VESTE_CATALOG.HABIT_QUEUE_DE_PIE.map(ref => (
                        <SelectItem key={ref} value={ref}>{ref}</SelectItem>
                      ))}
                    </optgroup>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select
                  value={form.tenue?.veste?.taille}
                  onValueChange={(value) => updateTenue('veste', 'taille', value)}
                >
                  <SelectTrigger className="bg-white/70 border-gray-300 text-gray-900 focus:border-amber-500 hover:bg-white/90 transition-all shadow-sm rounded-xl">
                    <SelectValue placeholder="Taille" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-300 text-gray-900">
                    {TAILLES.map(taille => (
                      <SelectItem key={taille} value={taille}>{taille}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select
                  value={form.tenue?.veste?.longueur}
                  onValueChange={(value) => updateTenue('veste', 'longueur', value)}
                >
                  <SelectTrigger className="bg-white/70 border-gray-300 text-gray-900 focus:border-amber-500 hover:bg-white/90 transition-all shadow-sm rounded-xl">
                    <SelectValue placeholder="Longueur" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-300 text-gray-900">
                    {LONGUEURS.map(longueur => (
                      <SelectItem key={longueur} value={longueur}>{longueur}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Gilet */}
          <div className="border-2 border-gray-200 rounded-lg p-6 bg-gray-50/50">
            <h4 className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-4">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-700 text-sm font-bold">B</div>
              Gilet
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Select
                  value={form.tenue?.gilet?.reference}
                  onValueChange={(value) => updateTenue('gilet', 'reference', value)}
                >
                  <SelectTrigger className="bg-white/70 border-gray-300 text-gray-900 focus:border-amber-500 hover:bg-white/90 transition-all shadow-sm rounded-xl">
                    <SelectValue placeholder="Sélectionner un modèle" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-300 text-gray-900">
                    {GILET_CATALOG.map(ref => (
                      <SelectItem key={ref} value={ref}>{ref}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select
                  value={form.tenue?.gilet?.taille}
                  onValueChange={(value) => updateTenue('gilet', 'taille', value)}
                >
                  <SelectTrigger className="bg-white/70 border-gray-300 text-gray-900 focus:border-amber-500 hover:bg-white/90 transition-all shadow-sm rounded-xl">
                    <SelectValue placeholder="Taille" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-300 text-gray-900">
                    {TAILLES.map(taille => (
                      <SelectItem key={taille} value={taille}>{taille}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Pantalon */}
          <div className="border-2 border-gray-200 rounded-lg p-6 bg-gray-50/50">
            <h4 className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-4">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 text-sm font-bold">C</div>
              Pantalon
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Select
                  value={form.tenue?.pantalon?.reference}
                  onValueChange={(value) => updateTenue('pantalon', 'reference', value)}
                >
                  <SelectTrigger className="bg-white/70 border-gray-300 text-gray-900 focus:border-amber-500 hover:bg-white/90 transition-all shadow-sm rounded-xl">
                    <SelectValue placeholder="Sélectionner un modèle" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-300 text-gray-900">
                    {PANTALON_CATALOG.map(ref => (
                      <SelectItem key={ref} value={ref}>{ref}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select
                  value={form.tenue?.pantalon?.taille}
                  onValueChange={(value) => updateTenue('pantalon', 'taille', value)}
                >
                  <SelectTrigger className="bg-white/70 border-gray-300 text-gray-900 focus:border-amber-500 hover:bg-white/90 transition-all shadow-sm rounded-xl">
                    <SelectValue placeholder="Taille" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-300 text-gray-900">
                    {TAILLES.map(taille => (
                      <SelectItem key={taille} value={taille}>{taille}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select
                  value={form.tenue?.pantalon?.longueur}
                  onValueChange={(value) => updateTenue('pantalon', 'longueur', value)}
                >
                  <SelectTrigger className="bg-white/70 border-gray-300 text-gray-900 focus:border-amber-500 hover:bg-white/90 transition-all shadow-sm rounded-xl">
                    <SelectValue placeholder="Longueur" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-300 text-gray-900">
                    {LONGUEURS.map(longueur => (
                      <SelectItem key={longueur} value={longueur}>{longueur}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Accessoires */}
          <div className="border-2 border-gray-200 rounded-lg p-6 bg-gray-50/50">
            <h4 className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-4">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-700 text-sm font-bold">D</div>
              Accessoires
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

      {/* 4. Notes */}
      <div className="border-b border-gray-200 pb-8">
        <h2 className="flex items-center gap-3 text-xl font-bold text-gray-900 mb-6">
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-2 rounded-lg shadow-md">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          4. Notes du Vendeur
        </h2>
        <Textarea
          value={form.notes || ''}
          onChange={(e) => updateForm('notes', e.target.value)}
          placeholder="Notes sur la prise de mesure, ajustements nécessaires..."
          rows={4}
          className="bg-white/70 border-gray-300 text-gray-900 focus:border-amber-500 focus:ring-amber-500/20 rounded-xl transition-all shadow-sm"
        />
      </div>

      {/* 5. Actions */}
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