import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { DynamicProductSelector } from '@/components/stock/DynamicProductSelector';
import { StockIndicator } from '@/components/stock/StockIndicator';
import { GroupRentalInfo, GroupClientInfo } from '@/types/group-rental';
import { ArticleCategory } from '@/types/stock';
import { TailleChaussure, TailleChapeau } from '@/types/measurement-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Shirt, 
  User, 
  ChevronLeft, 
  MessageSquare,
  Package
} from 'lucide-react';

interface GroupMeasurementFormProps {
  groupData: GroupRentalInfo;
  onSubmit: (updatedGroup: GroupRentalInfo) => void;
  onSave?: (updatedGroup: GroupRentalInfo) => void;
  onBack: () => void;
}

const TAILLES_CHAUSSURES: TailleChaussure[] = ['38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48'];
const TAILLES_CHAPEAUX: TailleChapeau[] = ['54', '55', '56', '57', '58', '59', '60', '61', '62'];

export function GroupMeasurementForm({ groupData, onSubmit, onSave, onBack }: GroupMeasurementFormProps) {
  const [updatedGroup, setUpdatedGroup] = useState<GroupRentalInfo>(groupData);
  const [currentClientIndex, setCurrentClientIndex] = useState(0);
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

  // Auto-sauvegarde des données quand elles changent
  useEffect(() => {
    if (onSave && updatedGroup !== groupData) {
      const timeoutId = setTimeout(() => {
        onSave(updatedGroup);
      }, 500); // Debounce de 500ms pour éviter trop d'appels

      return () => clearTimeout(timeoutId);
    }
  }, [updatedGroup, onSave, groupData]);

  // Fonction pour vérifier si la veste sélectionnée est un smoking
  const isSmokingSelected = (clientIndex: number) => {
    const vesteRef = updatedGroup.clients[clientIndex]?.tenue?.veste?.reference;
    if (!vesteRef || vesteReferences.length === 0) return false;
    
    const reference = vesteReferences.find(ref => ref.id === vesteRef);
    return reference?.subCategory === 'smoking';
  };

  const updateClientTenue = (clientIndex: number, category: 'veste' | 'gilet' | 'pantalon' | 'ceinture', field: string, value: any) => {
    setUpdatedGroup(prev => {
      const newClients = [...prev.clients];
      if (!newClients[clientIndex].tenue[category]) {
        newClients[clientIndex].tenue[category] = {};
      }
      (newClients[clientIndex].tenue[category] as any)[field] = value;
      return { ...prev, clients: newClients };
    });
  };

  const updateClientAccessoire = (clientIndex: number, field: 'tailleChapeau' | 'tailleChaussures', value: any) => {
    setUpdatedGroup(prev => {
      const newClients = [...prev.clients];
      newClients[clientIndex].tenue[field] = value;
      return { ...prev, clients: newClients };
    });
  };

  const updateClientNotes = (clientIndex: number, notes: string) => {
    setUpdatedGroup(prev => {
      const newClients = [...prev.clients];
      newClients[clientIndex].notes = notes;
      return { ...prev, clients: newClients };
    });
  };

  const updateTenueReference = (clientIndex: number, category: ArticleCategory | 'ceinture', referenceId: string) => {
    // Map 'accessoire' to 'ceinture' for form data structure
    const formCategory = category === 'accessoire' ? 'ceinture' : category;
    updateClientTenue(clientIndex, formCategory as 'veste' | 'gilet' | 'pantalon' | 'ceinture', 'reference', referenceId);
    // Reset la taille et couleur quand on change de référence
    updateClientTenue(clientIndex, formCategory as 'veste' | 'gilet' | 'pantalon' | 'ceinture', 'taille', '');
    updateClientTenue(clientIndex, formCategory as 'veste' | 'gilet' | 'pantalon' | 'ceinture', 'couleur', '');
    
    // Si on sélectionne une veste qui est un smoking, réinitialiser le gilet
    if (category === 'veste') {
      const reference = vesteReferences.find(ref => ref.id === referenceId);
      if (reference?.subCategory === 'smoking') {
        setUpdatedGroup(prev => {
          const newClients = [...prev.clients];
          newClients[clientIndex].tenue.gilet = undefined;
          return { ...prev, clients: newClients };
        });
      }
    }
  };

  const updateTenueSize = (clientIndex: number, category: ArticleCategory | 'ceinture', size: string) => {
    // Map 'accessoire' to 'ceinture' for form data structure
    const formCategory = category === 'accessoire' ? 'ceinture' : category;
    updateClientTenue(clientIndex, formCategory as 'veste' | 'gilet' | 'pantalon' | 'ceinture', 'taille', size);
  };

  const updateTenueColor = (clientIndex: number, category: ArticleCategory | 'ceinture', color: string) => {
    // Map 'accessoire' to 'ceinture' for form data structure
    const formCategory = category === 'accessoire' ? 'ceinture' : category;
    updateClientTenue(clientIndex, formCategory as 'veste' | 'gilet' | 'pantalon' | 'ceinture', 'couleur', color);
  };

  const handleSubmit = () => {
    onSubmit(updatedGroup);
  };

  const handleSave = () => {
    if (onSave) {
      onSave(updatedGroup);
    }
  };

  const currentClient = updatedGroup.clients[currentClientIndex];
  const isFormValid = updatedGroup.clients.every(client => 
    // Au moins une pièce de vêtement sélectionnée pour chaque client
    client.tenue.veste?.reference || 
    client.tenue.gilet?.reference || 
    client.tenue.pantalon?.reference ||
    client.tenue.ceinture?.reference
  );

  return (
    <div className="space-y-6 sm:space-y-8">
      
      {/* En-tête avec navigation */}
      <div className="border-b border-gray-200 pb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-3 text-sm text-gray-600 hover:text-amber-600 transition-colors rounded-lg hover:bg-amber-50 min-h-[48px]"
          >
            <ChevronLeft className="w-3 h-3" />
            Retour au groupe
          </button>
          
          <div className="text-sm text-gray-600 bg-amber-50 px-3 py-1 rounded-full">
            {updatedGroup.groupName}
          </div>
        </div>

        <h2 className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl font-bold text-gray-900 mb-4 text-left">
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-2 rounded-lg shadow-md">
            <Shirt className="w-5 h-5 text-white" />
          </div>
          2. Sélection des tenues
        </h2>

        {/* Navigation entre clients */}
        {updatedGroup.clients.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {updatedGroup.clients.map((client, index) => (
              <button
                key={client.id}
                onClick={() => setCurrentClientIndex(index)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  index === currentClientIndex
                    ? 'bg-amber-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <User className="w-4 h-4 inline mr-2" />
                {client.nom || `Personne ${index + 1}`}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Formulaire pour le client actuel */}
      <div className="space-y-6">
        
        {/* Informations du client actuel */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-gray-500 to-gray-600 p-2 rounded-lg shadow-md">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{currentClient.nom}</h3>
              <p className="text-sm text-gray-600">{currentClient.telephone}</p>
              {currentClient.email && (
                <p className="text-xs text-gray-500">{currentClient.email}</p>
              )}
            </div>
          </div>
        </div>

        {/* Sélection des vêtements */}
        <div className="space-y-6">
          
          {/* Veste */}
          <div className="rounded-lg p-4 sm:p-6 bg-gray-50/50">
            <h4 className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-4">
              <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 text-sm font-bold">A</div>
              Veste
              <StockIndicator 
                selectedReference={currentClient.tenue.veste?.reference} 
                selectedSize={currentClient.tenue.veste?.taille} 
              />
            </h4>
            <DynamicProductSelector
              category="veste"
              selectedReference={currentClient.tenue.veste?.reference}
              selectedSize={currentClient.tenue.veste?.taille}
              selectedColor={currentClient.tenue.veste?.couleur}
              onReferenceChange={(ref) => updateTenueReference(currentClientIndex, 'veste', ref)}
              onSizeChange={(size) => updateTenueSize(currentClientIndex, 'veste', size)}
              onColorChange={(color) => updateTenueColor(currentClientIndex, 'veste', color)}
            />
            
            {/* Longueur de manche */}
            {currentClient.tenue.veste?.reference && (
              <div className="mt-4">
                <Input
                  id="longueur-manche"
                  type="number"
                  min="0"
                  step="0.5"
                  value={currentClient.tenue.veste?.longueurManche || ''}
                  onChange={(e) => updateClientTenue(currentClientIndex, 'veste', 'longueurManche', e.target.value)}
                  placeholder="Longueur de manche"
                  className="bg-white/70 border-gray-300 text-gray-900 focus:border-amber-500 hover:bg-white/90 transition-all shadow-sm rounded-xl"
                />
              </div>
            )}
            
            {/* Notes veste */}
            {currentClient.tenue.veste?.reference && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Textarea
                  value={currentClient.tenue.veste?.notes || ''}
                  onChange={(e) => updateClientTenue(currentClientIndex, 'veste', 'notes', e.target.value)}
                  placeholder="Notes pour la veste (optionnel)"
                  rows={2}
                  className="bg-white/70 border-gray-300 text-gray-900 focus:border-amber-500 focus:ring-amber-500/20 rounded-xl transition-all shadow-sm"
                />
              </div>
            )}
          </div>

          {/* Gilet - Masqué si smoking sélectionné */}
          {!isSmokingSelected(currentClientIndex) && (
            <div className="rounded-lg p-4 sm:p-6 bg-gray-50/50">
            <h4 className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-4">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-700 text-sm font-bold">B</div>
              Gilet
              <StockIndicator 
                selectedReference={currentClient.tenue.gilet?.reference} 
                selectedSize={currentClient.tenue.gilet?.taille} 
              />
            </h4>
            <DynamicProductSelector
              category="gilet"
              selectedReference={currentClient.tenue.gilet?.reference}
              selectedSize={currentClient.tenue.gilet?.taille}
              selectedColor={currentClient.tenue.gilet?.couleur}
              onReferenceChange={(ref) => updateTenueReference(currentClientIndex, 'gilet', ref)}
              onSizeChange={(size) => updateTenueSize(currentClientIndex, 'gilet', size)}
              onColorChange={(color) => updateTenueColor(currentClientIndex, 'gilet', color)}
            />
            
            {/* Notes gilet */}
            {currentClient.tenue.gilet?.reference && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Textarea
                  value={currentClient.tenue.gilet?.notes || ''}
                  onChange={(e) => updateClientTenue(currentClientIndex, 'gilet', 'notes', e.target.value)}
                  placeholder="Notes pour le gilet (optionnel)"
                  rows={2}
                  className="bg-white/70 border-gray-300 text-gray-900 focus:border-amber-500 focus:ring-amber-500/20 rounded-xl transition-all shadow-sm"
                />
              </div>
            )}
          </div>
          )}

          {/* Pantalon */}
          <div className="rounded-lg p-4 sm:p-6 bg-gray-50/50">
            <h4 className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-4">
              <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 text-sm font-bold">C</div>
              Pantalon
              <StockIndicator 
                selectedReference={currentClient.tenue.pantalon?.reference} 
                selectedSize={currentClient.tenue.pantalon?.taille} 
              />
            </h4>
            <DynamicProductSelector
              category="pantalon"
              selectedReference={currentClient.tenue.pantalon?.reference}
              selectedSize={currentClient.tenue.pantalon?.taille}
              selectedColor={currentClient.tenue.pantalon?.couleur}
              onReferenceChange={(ref) => updateTenueReference(currentClientIndex, 'pantalon', ref)}
              onSizeChange={(size) => updateTenueSize(currentClientIndex, 'pantalon', size)}
              onColorChange={(color) => updateTenueColor(currentClientIndex, 'pantalon', color)}
            />

            {/* Longueur pantalon */}
            {currentClient.tenue.pantalon?.reference && (
              <div className="mt-4">
                <Input
                  id={`longueurPantalon-${currentClientIndex}`}
                  type="number"
                  min="0"
                  step="0.5"
                  value={currentClient.tenue.pantalon?.longueur || ''}
                  onChange={(e) => updateClientTenue(currentClientIndex, 'pantalon', 'longueur', e.target.value)}
                  placeholder="Longueur du pantalon"
                  className="bg-white/70 border-gray-300 text-gray-900 focus:border-amber-500 hover:bg-white/90 transition-all shadow-sm rounded-xl"
                />
              </div>
            )}
            
            {/* Notes pantalon */}
            {currentClient.tenue.pantalon?.reference && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Textarea
                  value={currentClient.tenue.pantalon?.notes || ''}
                  onChange={(e) => updateClientTenue(currentClientIndex, 'pantalon', 'notes', e.target.value)}
                  placeholder="Notes pour le pantalon (optionnel)"
                  rows={2}
                  className="bg-white/70 border-gray-300 text-gray-900 focus:border-amber-500 focus:ring-amber-500/20 rounded-xl transition-all shadow-sm"
                />
              </div>
            )}
          </div>

          {/* Ceinture */}
          <div className="rounded-lg p-4 sm:p-6 bg-gray-50/50">
            <h4 className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-4">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 text-sm font-bold">D</div>
              Ceinture
              <StockIndicator 
                selectedReference={currentClient.tenue.ceinture?.reference} 
                selectedSize={currentClient.tenue.ceinture?.taille} 
              />
            </h4>
            <DynamicProductSelector
              category="accessoire"
              selectedReference={currentClient.tenue.ceinture?.reference}
              selectedSize={currentClient.tenue.ceinture?.taille}
              selectedColor={currentClient.tenue.ceinture?.couleur}
              onReferenceChange={(ref) => updateTenueReference(currentClientIndex, 'ceinture', ref)}
              onSizeChange={(size) => updateTenueSize(currentClientIndex, 'ceinture', size)}
              onColorChange={(color) => updateTenueColor(currentClientIndex, 'ceinture', color)}
            />
          </div>

          {/* Autres Accessoires */}
          <div className="rounded-lg p-4 sm:p-6 bg-gray-50/50">
            <h4 className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-4">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-700 text-sm font-bold">E</div>
              Autres Accessoires <span className="text-sm font-normal text-gray-500">(facultatif)</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Select
                  value={currentClient.tenue.tailleChapeau || ''}
                  onValueChange={(value) => updateClientAccessoire(currentClientIndex, 'tailleChapeau', value as TailleChapeau)}
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
                  value={currentClient.tenue.tailleChaussures || ''}
                  onValueChange={(value) => updateClientAccessoire(currentClientIndex, 'tailleChaussures', value as TailleChaussure)}
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

      {/* Navigation et actions */}
      <div className="flex justify-between items-center pt-6 border-t border-gray-200">
        <div className="flex gap-2">
          {currentClientIndex > 0 && (
            <Button
              onClick={() => setCurrentClientIndex(currentClientIndex - 1)}
              variant="outline"
              className="px-4 bg-white/70 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl transition-all shadow-sm"
            >
              ← Précédent
            </Button>
          )}
          
          {currentClientIndex < updatedGroup.clients.length - 1 && (
            <Button
              onClick={() => setCurrentClientIndex(currentClientIndex + 1)}
              variant="outline"
              className="px-4 bg-white/70 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl transition-all shadow-sm"
            >
              Suivant →
            </Button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          {onSave && (
            <Button
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
            ➡️ Continuer vers le bon de location
          </Button>
        </div>
      </div>

      {!isFormValid && (
        <p className="text-sm text-red-600 text-center">
          ⚠️ Veuillez sélectionner au moins une pièce de vêtement pour chaque personne
        </p>
      )}
    </div>
  );
}