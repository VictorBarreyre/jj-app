import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { GroupSetupForm } from './GroupSetupForm';
import { GroupMeasurementForm } from './GroupMeasurementForm';
import { RentalContractForm } from './RentalContractForm';
import { GroupRentalInfo } from '@/types/group-rental';
import { RentalContract } from '@/types/rental-contract';
import { RotateCcw } from 'lucide-react';

// Clés pour localStorage
const STORAGE_KEYS = {
  CURRENT_STEP: 'measurement_form_current_step',
  GROUP_DATA: 'measurement_form_group_data',
  CONTRACT_DATA: 'measurement_form_contract_data',
} as const;

interface ThreeStepRentalFormProps {
  onSubmitComplete: (group: GroupRentalInfo, contract: Omit<RentalContract, 'id' | 'numero' | 'createdAt' | 'updatedAt'>) => void;
  onSaveDraft: (group?: GroupRentalInfo, contract?: Partial<RentalContract>) => void;
  onPrint?: (contractId: string, type: 'jj' | 'client') => void;
  onStepChange?: (step: number, title: string, description: string, canGoToStep: (step: number) => boolean) => void;
  onStepNavigate?: (targetStep: number) => void;
  initialGroup?: Partial<GroupRentalInfo>;
  initialContract?: Partial<RentalContract>;
  isEditMode?: boolean;
}

// Utilitaires pour localStorage
const saveToStorage = (key: string, data: any) => {
  try {
    const jsonData = JSON.stringify(data, (key, value) => {
      // Convertir les dates en string pour pouvoir les sauvegarder
      if (value instanceof Date) {
        return value.toISOString();
      }
      return value;
    });
    localStorage.setItem(key, jsonData);
  } catch (error) {
    console.warn('Erreur lors de la sauvegarde dans localStorage:', error);
  }
};

const loadFromStorage = <T,>(key: string): T | null => {
  try {
    const data = localStorage.getItem(key);
    if (!data) return null;
    
    return JSON.parse(data, (key, value) => {
      // Reconvertir les dates ISO en objets Date
      if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
        return new Date(value);
      }
      return value;
    });
  } catch (error) {
    console.warn('Erreur lors du chargement depuis localStorage:', error);
    return null;
  }
};

const clearFormStorage = () => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    // Nettoyer aussi le localStorage du GroupSetupForm
    localStorage.removeItem('group_setup_form_data');
  } catch (error) {
    console.warn('Erreur lors du nettoyage du localStorage:', error);
  }
};

export const ThreeStepRentalForm = forwardRef<
  { resetForm: () => void },
  ThreeStepRentalFormProps
>(function ThreeStepRentalForm({ 
  onSubmitComplete, 
  onSaveDraft, 
  onPrint, 
  onStepChange,
  onStepNavigate,
  initialGroup, 
  initialContract,
  isEditMode = false 
}, ref) {
  // Initialiser les états avec les données du localStorage ou les valeurs par défaut
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(() => {
    const savedStep = loadFromStorage<number>(STORAGE_KEYS.CURRENT_STEP);
    return (savedStep && (savedStep === 1 || savedStep === 2 || savedStep === 3)) ? savedStep as 1 | 2 | 3 : 1;
  });
  
  const [groupData, setGroupData] = useState<GroupRentalInfo | null>(() => {
    const savedData = loadFromStorage<GroupRentalInfo>(STORAGE_KEYS.GROUP_DATA);
    return savedData || null;
  });
  
  const [contractData, setContractData] = useState<Partial<RentalContract> | null>(() => {
    const savedData = loadFromStorage<Partial<RentalContract>>(STORAGE_KEYS.CONTRACT_DATA);
    return savedData || null;
  });
  
  const [formKey, setFormKey] = useState(0);

  // Sauvegarde automatique des données
  const saveCurrentData = () => {
    saveToStorage(STORAGE_KEYS.CURRENT_STEP, currentStep);
    if (groupData) {
      saveToStorage(STORAGE_KEYS.GROUP_DATA, groupData);
    }
    if (contractData) {
      saveToStorage(STORAGE_KEYS.CONTRACT_DATA, contractData);
    }
  };

  // Auto-sauvegarde quand les données changent
  useEffect(() => {
    if (groupData || contractData || currentStep > 1) {
      saveCurrentData();
    }
  }, [currentStep, groupData, contractData]);

  // Gestion des données initiales (mode édition)
  useEffect(() => {
    if (initialContract || initialGroup) {
      
      if (initialGroup) {
        setGroupData(initialGroup as GroupRentalInfo);
        // En mode édition, commencer à l'étape 1 pour permettre la navigation complète
        setCurrentStep(1);
      }
      
      if (initialContract) {
        setContractData(initialContract);
      }
      
      // Si on a les deux types de données, on peut naviguer entre toutes les étapes
      if (initialContract && initialGroup) {
      }
    } else {
    }
  }, [initialContract, initialGroup]);

  // Étape 1 : Configuration du groupe
  const handleGroupSetupSubmit = (group: Omit<GroupRentalInfo, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
    const fullGroupData: GroupRentalInfo = {
      ...group,
      status: 'brouillon'
    };
    setGroupData(fullGroupData);
    setCurrentStep(2);
  };

  const handleGroupSetupSave = (group: Omit<GroupRentalInfo, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
    const fullGroupData: GroupRentalInfo = {
      ...group,
      status: 'brouillon'
    };
    onSaveDraft(fullGroupData);
  };

  // Étape 2 : Sélection des tenues
  const handleMeasurementSubmit = (updatedGroup: GroupRentalInfo) => {
    setGroupData(updatedGroup);
    
    // Pré-remplir les données du contrat avec les infos du groupe
    const mainClient = updatedGroup.clients[0];
    const prefilledContract: Partial<RentalContract> = {
      dateCreation: new Date(),
      dateEvenement: updatedGroup.dateEssai,
      dateRetrait: updatedGroup.dateEssai,
      dateRetour: new Date(updatedGroup.dateEssai.getTime() + 3 * 24 * 60 * 60 * 1000), // +3 jours par défaut
      
      client: {
        nom: updatedGroup.clients.length === 1 ? mainClient.nom : updatedGroup.groupName,
        telephone: updatedGroup.telephone,
        email: updatedGroup.email,
        isExistingClient: mainClient.isExistingClient,
        clientId: mainClient.clientId
      },
      
      vendeur: updatedGroup.vendeur,
      
      // Pour les groupes, on prend la tenue du premier client comme référence
      tenue: mainClient.tenue,
      notes: updatedGroup.groupNotes || mainClient.notes,
      
      // Valeurs par défaut pour la tarification
      tarifLocation: 0,
      depotGarantie: 50,
      arrhes: 0,
      
      status: 'brouillon',
      rendu: false,
      
      ...initialContract
    };
    
    setContractData(prefilledContract);
    setCurrentStep(3);
  };

  const handleMeasurementSave = (updatedGroup: GroupRentalInfo) => {
    setGroupData(updatedGroup); // Mettre à jour les données locales pour localStorage
    onSaveDraft(updatedGroup);
  };

  // Étape 3 : Bon de location
  const handleContractSubmit = (contract: Omit<RentalContract, 'id' | 'numero' | 'createdAt' | 'updatedAt'>) => {
    if (groupData) {
      onSubmitComplete(groupData, contract);
      // Nettoyer le localStorage après soumission réussie
      clearFormStorage();
    }
  };

  const handleContractSave = (contract: Omit<RentalContract, 'id' | 'numero' | 'createdAt' | 'updatedAt'>) => {
    if (groupData) {
      onSaveDraft(groupData, contract);
    }
  };

  const handleContractAutoSave = (contractPart: Partial<RentalContract>) => {
    setContractData(contractPart); // Mettre à jour les données locales pour localStorage
  };


  // Fonction pour obtenir le titre et la description de l'étape actuelle
  const getCurrentStepInfo = () => {
    const isGroup = groupData && groupData.clients.length > 1;
    const entityType = isGroup ? 'groupe' : 'client';
    
    switch (currentStep) {
      case 1:
        return {
          title: 'Étape 1/3 : Clients',
          description: isGroup 
            ? 'Informations et participants'
            : 'Informations client'
        };
      case 2:
        return {
          title: 'Étape 2/3 : Vêtements',
          description: isGroup 
            ? 'Choix des tenues'
            : 'Choix des vêtements'
        };
      case 3:
        return {
          title: 'Étape 3/3 : Location',
          description: 'Tarifs et conditions'
        };
      default:
        return {
          title: isGroup ? 'Nouveau groupe de location' : 'Nouveau bon de location',
          description: isGroup 
            ? 'Processus complet : configuration, mesures puis création du bon de location'
            : 'Processus complet : configuration, mesures puis création du bon de location'
        };
    }
  };

  const stepInfo = getCurrentStepInfo();

  // Fonction pour vérifier si on peut naviguer vers une étape
  const canGoToStep = (targetStep: number): boolean => {
    if (targetStep <= currentStep) return true; // On peut toujours revenir en arrière
    if (targetStep === 1) return true; // Étape 1 toujours accessible
    if (targetStep === 2) return groupData !== null; // Étape 2 accessible si on a les données de groupe
    if (targetStep === 3) return groupData !== null && contractData !== null; // Étape 3 accessible si on a les deux
    return false;
  };

  // Fonction de navigation entre étapes
  const navigateToStep = (targetStep: number) => {
    if (canGoToStep(targetStep)) {
      setCurrentStep(targetStep as 1 | 2 | 3);
    }
  };

  // Gérer la navigation depuis l'extérieur
  useEffect(() => {
    if (onStepNavigate) {
      // Remplacer la fonction de navigation externe
      (window as any).__threeStepFormNavigate = navigateToStep;
    }
  }, [onStepNavigate]);

  // Notifier le parent quand l'étape change
  useEffect(() => {
    if (onStepChange) {
      onStepChange(currentStep, stepInfo.title, stepInfo.description, canGoToStep);
    }
  }, [currentStep, stepInfo.title, stepInfo.description]);

  // Fonction pour réinitialiser le formulaire
  const resetForm = () => {
    setCurrentStep(1);
    setGroupData(null);
    setContractData(null);
    setFormKey(prev => prev + 1); // Force le re-render des composants
    clearFormStorage();
  };

  // Exposer la fonction resetForm au parent
  useImperativeHandle(ref, () => ({
    resetForm
  }));

  return (
    <div className="mx-auto">

      {/* En-tête avec titre et bouton reset */}
      <div className="flex items-start justify-between mb-6 pb-4 border-b border-gray-200 pt-2 pl-2">
        <div className="flex-1 text-left">
          <h2 className="text-lg sm:text-2xl font-bold text-gray-900 text-left">{stepInfo.title}</h2>
          <p className="text-gray-600 text-sm sm:text-sm mt-1 leading-tight sm:leading-relaxed text-left">{stepInfo.description}</p>
        </div>
        <button
          onClick={resetForm}
          className="text-sm text-black underline hover:text-gray-700 transition-colors font-bold sm:font-semibold flex items-center gap-2 px-2 py-1 sm:px-3 sm:py-2 ml-4"
        >
          <RotateCcw className="w-5 h-5 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Nouveau formulaire</span>
        </button>
      </div>

      {/* Contenu de l'étape */}
      <div className="bg-white rounded-lg">
        {currentStep === 1 && (
          <GroupSetupForm
            key={formKey}
            onSubmit={handleGroupSetupSubmit}
            onSave={handleGroupSetupSave}
            initialData={initialGroup}
          />
        )}

        {currentStep === 2 && groupData && (
          <GroupMeasurementForm
            groupData={groupData}
            onSubmit={handleMeasurementSubmit}
            onSave={handleMeasurementSave}
          />
        )}

        {currentStep === 3 && contractData && groupData && (
          <div>

            {/* Résumé des étapes précédentes */}
            <div className="mb-6 p-5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4 text-left text-lg">
                📋 Résumé {groupData.clients.length > 1 ? 'du groupe de location' : 'de la prise de mesure'}
              </h3>
              
              {/* Informations principales - alignées à gauche */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="text-left">
                  <span className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    {groupData.clients.length > 1 ? 'Groupe' : 'Client'}
                  </span>
                  <p className="font-medium text-gray-900 text-xs sm:text-sm">{groupData.groupName}</p>
                </div>
                
                <div className="text-left">
                  <span className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    {groupData.clients.length > 1 ? 'Participants' : 'Téléphone'}
                  </span>
                  <p className="font-medium text-gray-900 text-xs sm:text-sm">
                    {groupData.clients.length > 1 
                      ? `${groupData.clients.length} personne${groupData.clients.length > 1 ? 's' : ''}` 
                      : groupData.telephone
                    }
                  </p>
                </div>
                
                <div className="text-left">
                  <span className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Vendeur
                  </span>
                  <p className="font-medium text-gray-900 text-xs sm:text-sm">{groupData.vendeur}</p>
                </div>
                
                <div className="text-left">
                  <span className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Date événement
                  </span>
                  <p className="font-medium text-gray-900 text-xs sm:text-sm">{groupData.dateEssai.toLocaleDateString('fr-FR')}</p>
                </div>
              </div>
              
              {/* Participants détaillés pour les groupes */}
              {groupData.clients.length > 1 && (
                <div className="pt-3 border-t border-gray-300">
                  <span className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 text-left">
                    Liste des participants
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {groupData.clients.map((client, index) => (
                      <span key={index} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                        {client.nom}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Pièces de tenue réservées */}
              <div className="pt-3 border-t border-gray-300 mt-3">
                <span className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 text-left">
                  Pièces de tenue réservées
                </span>
                <div className="space-y-4">
                  {groupData.clients.map((client, clientIndex) => {
                    const pieces = [];
                    
                    // Veste
                    if (client.tenue.veste) {
                      const taille = client.tenue.veste.taille ? ` - Taille ${client.tenue.veste.taille}` : ' - Taille non spécifiée';
                      pieces.push(`Veste ${client.tenue.veste.reference}${taille}`);
                    }
                    
                    // Gilet
                    if (client.tenue.gilet) {
                      const taille = client.tenue.gilet.taille ? ` - Taille ${client.tenue.gilet.taille}` : ' - Taille non spécifiée';
                      pieces.push(`Gilet ${client.tenue.gilet.reference}${taille}`);
                    }
                    
                    // Pantalon
                    if (client.tenue.pantalon) {
                      const taille = client.tenue.pantalon.taille ? ` - Taille ${client.tenue.pantalon.taille}` : ' - Taille non spécifiée';
                      const longueur = client.tenue.pantalon.longueur ? ` - Longueur ${client.tenue.pantalon.longueur}cm` : '';
                      pieces.push(`Pantalon ${client.tenue.pantalon.reference}${taille}${longueur}`);
                    }
                    
                    // Ceinture
                    if (client.tenue.ceinture) {
                      const taille = client.tenue.ceinture.taille ? ` - Taille ${client.tenue.ceinture.taille}` : ' - Taille non spécifiée';
                      pieces.push(`Ceinture ${client.tenue.ceinture.reference}${taille}`);
                    }
                    
                    // Chapeau
                    if (client.tenue.tailleChapeau) {
                      pieces.push(`Chapeau - Taille ${client.tenue.tailleChapeau}`);
                    }
                    
                    // Chaussures
                    if (client.tenue.tailleChaussures) {
                      pieces.push(`Chaussures - Pointure ${client.tenue.tailleChaussures}`);
                    }
                    
                    if (pieces.length === 0) {
                      pieces.push('Aucune pièce sélectionnée');
                    }
                    
                    return (
                      <div key={clientIndex} className="bg-gray-50 rounded-lg p-3 text-left">
                        <div className="font-semibold text-gray-800 text-left mb-2">
                          {client.nom}
                        </div>
                        <div className="space-y-1">
                          {pieces.map((piece, index) => (
                            <div key={index} className="text-sm text-gray-700 text-left pl-3">
                              <span className="text-amber-600 font-medium">•</span> <span className="ml-2">{piece}</span>
                            </div>
                          ))}
                        </div>
                        {client.notes && (
                          <div className="mt-2 text-xs text-gray-500 italic text-left pl-3">
                            Note : {client.notes}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Contact supplémentaire pour les groupes */}
              {groupData.clients.length > 1 && groupData.telephone && (
                <div className="pt-3 border-t border-gray-300 mt-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="text-left">
                      <span className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                        Téléphone du groupe
                      </span>
                      <p className="font-medium text-gray-900 text-xs sm:text-sm">{groupData.telephone}</p>
                    </div>
                    {groupData.email && (
                      <div className="text-left">
                        <span className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                          Email du groupe
                        </span>
                        <p className="font-medium text-gray-900 text-xs sm:text-sm">{groupData.email}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <RentalContractForm
              onSubmit={handleContractSubmit}
              onSaveDraft={handleContractSave}
              onAutoSave={handleContractAutoSave}
              onPrint={onPrint}
              initialData={contractData}
              isEditMode={isEditMode}
            />
          </div>
        )}
      </div>
    </div>
  );
});