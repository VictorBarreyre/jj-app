import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { DynamicProductSelector } from '@/components/stock/DynamicProductSelector';
import { StockIndicator } from '@/components/stock/StockIndicator';
import { GroupRentalInfo, GroupClientInfo } from '@/types/group-rental';
import { stockAPI } from '@/services/api';
import { ArticleCategory } from '@/types/stock';
import { TailleChaussure, TailleChapeau, ChaussuresType } from '@/types/measurement-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Shirt, 
  User, 
  ChevronLeft, 
  ChevronRight,
  MessageSquare,
  Package
} from 'lucide-react';

interface GroupMeasurementFormProps {
  groupData: GroupRentalInfo;
  onSubmit: (updatedGroup: GroupRentalInfo) => void;
  onSave?: (updatedGroup: GroupRentalInfo) => void;
  onConfirm?: (updatedGroup: GroupRentalInfo) => void;
  isEditMode?: boolean;
}

const TAILLES_CHAUSSURES: TailleChaussure[] = ['38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48'];
const TAILLES_CHAPEAUX: TailleChapeau[] = ['54', '55', '56', '57', '58', '59', '60', '61', '62'];

export function GroupMeasurementForm({ groupData, onSubmit, onSave, onConfirm, isEditMode = false }: GroupMeasurementFormProps) {
  const [updatedGroup, setUpdatedGroup] = useState<GroupRentalInfo>(groupData);
  const [currentClientIndex, setCurrentClientIndex] = useState(0);
  const [vesteReferences, setVesteReferences] = useState<any[]>([]);

  // Mettre à jour updatedGroup quand groupData change (important en mode édition)
  useEffect(() => {
    setUpdatedGroup(groupData);
  }, [groupData]);

  // Charger les références de veste au montage
  useEffect(() => {
    const fetchVesteReferences = async () => {
      try {
        const data = await stockAPI.getReferences('veste');
        setVesteReferences(data.references || []);
      } catch (error) {
        console.warn('Erreur lors du chargement des références veste:', error);
      }
    };
    fetchVesteReferences();
  }, []);


  // Auto-sauvegarde désactivée - la sauvegarde se fait uniquement via le bouton
  // useEffect(() => {
  //   if (onSave && updatedGroup !== groupData) {
  //     const timeoutId = setTimeout(() => {
  //       onSave(updatedGroup);
  //     }, 500); // Debounce de 500ms pour éviter trop d'appels

  //     return () => clearTimeout(timeoutId);
  //   }
  // }, [updatedGroup, onSave, groupData]);

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

  const updateClientAccessoire = (clientIndex: number, field: 'tailleChapeau' | 'tailleChaussures' | 'chaussuresType', value: any) => {
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

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm(updatedGroup);
    }
  };

  const currentClient = updatedGroup.clients[currentClientIndex];
  
  // Fonction pour vérifier si un item est complet avec les mesures requises
  const isItemComplete = (item: any, category: 'veste' | 'gilet' | 'pantalon' | 'ceinture') => {
    if (!item || !item.reference || !item.taille) return false;
    
    // Vérifications spécifiques par catégorie
    if (category === 'veste' && !item.longueurManche) return false;
    if (category === 'pantalon' && !item.longueur) return false;
    
    return true;
  };

  // Fonction pour vérifier si tous les items sélectionnés d'un client sont complets
  const hasCompleteItem = (client: any) => {
    const tenue = client.tenue;
    
    // Vérifier que tous les items sélectionnés sont complets
    if (tenue.veste?.reference && !isItemComplete(tenue.veste, 'veste')) return false;
    if (tenue.gilet?.reference && !isItemComplete(tenue.gilet, 'gilet')) return false;
    if (tenue.pantalon?.reference && !isItemComplete(tenue.pantalon, 'pantalon')) return false;
    if (tenue.ceinture?.reference && !isItemComplete(tenue.ceinture, 'ceinture')) return false;
    
    // Vérifier qu'au moins un item est sélectionné
    const hasAnyItem = (
      tenue.veste?.reference ||
      tenue.gilet?.reference ||
      tenue.pantalon?.reference ||
      tenue.ceinture?.reference ||
      tenue.tailleChapeau ||
      tenue.tailleChaussures
    );
    
    return hasAnyItem;
  };

  // Validation complète : tous les clients doivent avoir au moins un item complet  
  const isFormValid = updatedGroup.clients.every(client => hasCompleteItem(client));
  
  // Validation pour le client actuel seulement
  const isCurrentClientValid = hasCompleteItem(currentClient);

  return (
    <div className="space-y-6 sm:space-y-8">
      
      {/* En-tête avec navigation */}
      <div className="border-b border-gray-200 pb-6">

        <h2 className="flex items-center gap-2 sm:gap-3 text-base sm:text-2xl font-bold text-gray-900 mb-4 text-left">
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
                {client.prenom ? `${client.prenom} ${client.nom}` : client.nom || `Personne ${index + 1}`}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Formulaire pour le client actuel */}
      <div className="space-y-6">
        
        {/* Résumé des informations du client actuel */}
        <div className="mb-6 p-5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4 text-left text-lg flex items-center gap-2">
            <User className="w-5 h-5 text-amber-600" />
            Client en cours de mesure
          </h3>
          
          {/* Informations du client - alignées à gauche */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div className="text-left">
              <span className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                Nom du client
              </span>
              <p className="font-medium text-gray-900 text-xs sm:text-sm">{currentClient.nom}</p>
            </div>
            
            {currentClient.telephone && (
              <div className="text-left">
                <span className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Téléphone
                </span>
                <p className="font-medium text-gray-900 text-xs sm:text-sm">{currentClient.telephone}</p>
              </div>
            )}
            
            {currentClient.email && (
              <div className="text-left">
                <span className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Email
                </span>
                <p className="font-medium text-gray-900 text-xs sm:text-sm">{currentClient.email}</p>
              </div>
            )}
          </div>

          {/* Informations du groupe de base */}
          <div className="pt-3 border-t border-gray-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {updatedGroup.groupName && (
                <div className="text-left">
                  <span className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Groupe
                  </span>
                  <p className="font-medium text-gray-900 text-xs sm:text-sm">{updatedGroup.groupName}</p>
                </div>
              )}
              
              <div className="text-left">
                <span className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Vendeur
                </span>
                <p className="font-medium text-gray-900 text-xs sm:text-sm">{updatedGroup.vendeur}</p>
              </div>
              
              <div className="text-left">
                <span className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Date événement
                </span>
                <p className="font-medium text-gray-900 text-xs sm:text-sm">{updatedGroup.dateEssai.toLocaleDateString('fr-FR')}</p>
              </div>
            </div>
          </div>

          {/* Progression pour les groupes */}
          {updatedGroup.clients.length > 1 && (
            <div className="pt-3 border-t border-gray-300 mt-3">
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <span className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Progression
                  </span>
                  <p className="font-medium text-gray-900 text-xs sm:text-sm">
                    Client {currentClientIndex + 1} sur {updatedGroup.clients.length}
                  </p>
                </div>
                <div className="flex-1 max-w-xs ml-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-amber-500 to-amber-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((currentClientIndex + 1) / updatedGroup.clients.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sélection des vêtements */}
        <div className="space-y-6">
          
          {/* Veste */}
          <div className="rounded-lg p-4 sm:p-6 bg-gray-50/50">
            <h4 className="flex items-center gap-2 text-base sm:text-lg font-bold text-gray-800 mb-4">
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
                  type="text"
                  value={currentClient.tenue.veste?.longueurManche || ''}
                  onChange={(e) => updateClientTenue(currentClientIndex, 'veste', 'longueurManche', e.target.value)}
                  placeholder="Ex: 60, 58-60, ajustable"
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
            <h4 className="flex items-center gap-2 text-base sm:text-lg font-bold text-gray-800 mb-4">
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
            <h4 className="flex items-center gap-2 text-base sm:text-lg font-bold text-gray-800 mb-4">
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
                  type="text"
                  value={currentClient.tenue.pantalon?.longueur || ''}
                  onChange={(e) => updateClientTenue(currentClientIndex, 'pantalon', 'longueur', e.target.value)}
                  placeholder="Ex: 105, 103-105, standard"
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

          {/* Autres Accessoires */}
          <div className="rounded-lg p-4 sm:p-6 bg-gray-50/50">
            <h4 className="flex items-center gap-2 text-base sm:text-lg font-bold text-gray-800 mb-4">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-700 text-sm font-bold">D</div>
              Autres Accessoires <span className="text-sm font-normal text-gray-500">(facultatif)</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Select
                  value={currentClient.tenue.tailleChapeau || ''}
                  onValueChange={(value) => updateClientAccessoire(currentClientIndex, 'tailleChapeau', value === '__none__' ? '' : value as TailleChapeau)}
                >
                  <SelectTrigger className="bg-white/70 border-gray-300 text-gray-900 focus:border-amber-500 hover:bg-white/90 transition-all shadow-sm rounded-xl">
                    <SelectValue placeholder="Taille chapeau" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-300 text-gray-900">
                    <SelectItem value="__none__">
                      <span className="text-gray-500 italic">Aucune taille sélectionnée</span>
                    </SelectItem>
                    {TAILLES_CHAPEAUX.map(taille => (
                      <SelectItem key={taille} value={taille}>{taille}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select
                  value={currentClient.tenue.tailleChaussures || ''}
                  onValueChange={(value) => updateClientAccessoire(currentClientIndex, 'tailleChaussures', value === '__none__' ? '' : value as TailleChaussure)}
                >
                  <SelectTrigger className="bg-white/70 border-gray-300 text-gray-900 focus:border-amber-500 hover:bg-white/90 transition-all shadow-sm rounded-xl">
                    <SelectValue placeholder="Taille chaussures" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-300 text-gray-900">
                    <SelectItem value="__none__">
                      <span className="text-gray-500 italic">Aucune taille sélectionnée</span>
                    </SelectItem>
                    {TAILLES_CHAUSSURES.map(taille => (
                      <SelectItem key={taille} value={taille}>{taille}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {/* Sélecteur V/NV - uniquement si une taille de chaussures est sélectionnée */}
            {currentClient.tenue.tailleChaussures && (
              <div className="mt-4">
                <Label className="block text-left text-sm font-medium text-gray-700 mb-2">
                  Type de chaussures
                </Label>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant={currentClient.tenue.chaussuresType === 'V' ? 'default' : 'outline'}
                    onClick={() => updateClientAccessoire(currentClientIndex, 'chaussuresType', 'V')}
                    className={`flex-1 py-3 rounded-xl font-medium ${currentClient.tenue.chaussuresType === 'V' ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-white/70 border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                  >
                    V (Vernies)
                  </Button>
                  <Button
                    type="button"
                    variant={currentClient.tenue.chaussuresType === 'NV' ? 'default' : 'outline'}
                    onClick={() => updateClientAccessoire(currentClientIndex, 'chaussuresType', 'NV')}
                    className={`flex-1 py-3 rounded-xl font-medium ${currentClient.tenue.chaussuresType === 'NV' ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-white/70 border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                  >
                    NV (Non Vernies)
                  </Button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Navigation et actions */}
      <div className="flex flex-col sm:flex-row justify-between items-center pt-6 border-t border-gray-200 gap-4">
        
        {/* Navigation entre participants pour les groupes */}
        {updatedGroup.clients.length > 1 && (
          <div className="hidden sm:flex gap-2">
            {currentClientIndex > 0 && (
              <Button
                onClick={() => setCurrentClientIndex(currentClientIndex - 1)}
                variant="outline"
                className="px-4 bg-white/70 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl transition-all shadow-sm"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Précédent
              </Button>
            )}
          </div>
        )}
        
        {!isFormValid && (
          <p className="text-sm text-red-600 text-center sm:text-left order-last sm:order-first">
            ⚠️ Veuillez compléter au moins une pièce (référence + taille + longueurs)
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto sm:ml-auto">
          {onSave && (
            <Button
              variant="outline"
              onClick={handleSave}
              className="px-6 bg-white/70 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl transition-all shadow-sm"
            >
              💾 Sauvegarder le brouillon
            </Button>
          )}

          {/* Bouton principal dynamique */}
          {currentClientIndex < updatedGroup.clients.length - 1 ? (
            <Button
              onClick={() => setCurrentClientIndex(currentClientIndex + 1)}
              disabled={!isCurrentClientValid}
              className="px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <User className="w-4 h-4" />
              Habiller {updatedGroup.clients[currentClientIndex + 1].prenom ? `${updatedGroup.clients[currentClientIndex + 1].prenom} ${updatedGroup.clients[currentClientIndex + 1].nom}` : updatedGroup.clients[currentClientIndex + 1].nom}
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={isEditMode ? handleConfirm : handleSubmit}
              disabled={!isFormValid}
              className="px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isEditMode ? '💾 Sauvegarder les modifications' : '➡️ Continuer vers le bon de location'}
            </Button>
          )}
        </div>
      </div>

      {/* Navigation mobile pour les groupes */}
      {updatedGroup.clients.length > 1 && (
        <div className="flex sm:hidden justify-between items-center gap-2 mt-4">
          {currentClientIndex > 0 ? (
            <Button
              onClick={() => setCurrentClientIndex(currentClientIndex - 1)}
              variant="outline"
              size="sm"
              className="flex-1 bg-white/70 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl transition-all shadow-sm"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Précédent
            </Button>
          ) : <div className="flex-1"></div>}

          {currentClientIndex < updatedGroup.clients.length - 1 && (
            <Button
              onClick={() => setCurrentClientIndex(currentClientIndex + 1)}
              disabled={!isCurrentClientValid}
              size="sm"
              className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <User className="w-3 h-3" />
              Habiller {updatedGroup.clients[currentClientIndex + 1].prenom ? `${updatedGroup.clients[currentClientIndex + 1].prenom} ${updatedGroup.clients[currentClientIndex + 1].nom}` : updatedGroup.clients[currentClientIndex + 1].nom}
              <ChevronRight className="w-3 h-3" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}