import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Prise de Mesure - Jean Jacques Cérémonie
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Informations de base */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="w-4 h-4" />
            Informations de base
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="dateEssai">Date d'essai</Label>
            <Input
              id="dateEssai"
              type="date"
              value={form.dateEssai?.toISOString().split('T')[0] || ''}
              onChange={(e) => updateForm('dateEssai', new Date(e.target.value))}
            />
          </div>
          <div>
            <Label htmlFor="vendeur">Vendeur</Label>
            <Select value={form.vendeur} onValueChange={(value) => updateForm('vendeur', value as Vendeur)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un vendeur" />
              </SelectTrigger>
              <SelectContent>
                {VENDEURS.map(vendeur => (
                  <SelectItem key={vendeur} value={vendeur}>{vendeur}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Informations client */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="w-4 h-4" />
            Client
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="nom" className="flex items-center gap-1">
              <User className="w-3 h-3" />
              Nom *
            </Label>
            <Input
              id="nom"
              value={form.client?.nom || ''}
              onChange={(e) => updateClient('nom', e.target.value)}
              placeholder="Nom du client"
              required
            />
          </div>
          <div>
            <Label htmlFor="telephone" className="flex items-center gap-1">
              <Phone className="w-3 h-3" />
              Téléphone *
            </Label>
            <Input
              id="telephone"
              type="tel"
              value={form.client?.telephone || ''}
              onChange={(e) => updateClient('telephone', e.target.value)}
              placeholder="06 12 34 56 78"
              required
            />
          </div>
          <div>
            <Label htmlFor="email" className="flex items-center gap-1">
              <Mail className="w-3 h-3" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={form.client?.email || ''}
              onChange={(e) => updateClient('email', e.target.value)}
              placeholder="email@exemple.com"
            />
          </div>
        </CardContent>
      </Card>

      {/* Sélection de la tenue */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shirt className="w-4 h-4" />
            Tenue
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Veste */}
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold mb-3">Veste</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Modèle</Label>
                <Select 
                  value={form.tenue?.veste?.reference} 
                  onValueChange={(value) => updateTenue('veste', 'reference', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un modèle" />
                  </SelectTrigger>
                  <SelectContent>
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
                <Label>Taille</Label>
                <Select 
                  value={form.tenue?.veste?.taille} 
                  onValueChange={(value) => updateTenue('veste', 'taille', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Taille" />
                  </SelectTrigger>
                  <SelectContent>
                    {TAILLES.map(taille => (
                      <SelectItem key={taille} value={taille}>{taille}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Longueur</Label>
                <Select 
                  value={form.tenue?.veste?.longueur} 
                  onValueChange={(value) => updateTenue('veste', 'longueur', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Longueur" />
                  </SelectTrigger>
                  <SelectContent>
                    {LONGUEURS.map(longueur => (
                      <SelectItem key={longueur} value={longueur}>{longueur}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Gilet */}
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold mb-3">Gilet</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Modèle</Label>
                <Select 
                  value={form.tenue?.gilet?.reference} 
                  onValueChange={(value) => updateTenue('gilet', 'reference', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un modèle" />
                  </SelectTrigger>
                  <SelectContent>
                    {GILET_CATALOG.map(ref => (
                      <SelectItem key={ref} value={ref}>{ref}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Taille</Label>
                <Select 
                  value={form.tenue?.gilet?.taille} 
                  onValueChange={(value) => updateTenue('gilet', 'taille', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Taille" />
                  </SelectTrigger>
                  <SelectContent>
                    {TAILLES.map(taille => (
                      <SelectItem key={taille} value={taille}>{taille}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Pantalon */}
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold mb-3">Pantalon</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Modèle</Label>
                <Select 
                  value={form.tenue?.pantalon?.reference} 
                  onValueChange={(value) => updateTenue('pantalon', 'reference', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un modèle" />
                  </SelectTrigger>
                  <SelectContent>
                    {PANTALON_CATALOG.map(ref => (
                      <SelectItem key={ref} value={ref}>{ref}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Taille</Label>
                <Select 
                  value={form.tenue?.pantalon?.taille} 
                  onValueChange={(value) => updateTenue('pantalon', 'taille', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Taille" />
                  </SelectTrigger>
                  <SelectContent>
                    {TAILLES.map(taille => (
                      <SelectItem key={taille} value={taille}>{taille}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Longueur</Label>
                <Select 
                  value={form.tenue?.pantalon?.longueur} 
                  onValueChange={(value) => updateTenue('pantalon', 'longueur', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Longueur" />
                  </SelectTrigger>
                  <SelectContent>
                    {LONGUEURS.map(longueur => (
                      <SelectItem key={longueur} value={longueur}>{longueur}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Accessoires */}
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold mb-3">Accessoires</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Taille Chapeau</Label>
                <Select 
                  value={form.tenue?.tailleChapeau} 
                  onValueChange={(value) => updateAccessoire('tailleChapeau', value as TailleChapeau)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Taille chapeau" />
                  </SelectTrigger>
                  <SelectContent>
                    {TAILLES_CHAPEAUX.map(taille => (
                      <SelectItem key={taille} value={taille}>{taille}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Taille Chaussures</Label>
                <Select 
                  value={form.tenue?.tailleChaussures} 
                  onValueChange={(value) => updateAccessoire('tailleChaussures', value as TailleChaussure)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Taille chaussures" />
                  </SelectTrigger>
                  <SelectContent>
                    {TAILLES_CHAUSSURES.map(taille => (
                      <SelectItem key={taille} value={taille}>{taille}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageSquare className="w-4 h-4" />
            Notes vendeur
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={form.notes || ''}
            onChange={(e) => updateForm('notes', e.target.value)}
            placeholder="Notes sur la prise de mesure, ajustements nécessaires..."
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={handleSave}>
          Sauvegarder brouillon
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={!isFormValid}
          className="min-w-32"
        >
          Transmettre au PC caisse
        </Button>
      </div>
    </div>
  );
}