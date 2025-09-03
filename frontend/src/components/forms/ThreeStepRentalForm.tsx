import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { GroupSetupForm } from './GroupSetupForm';
import { GroupMeasurementForm } from './GroupMeasurementForm';
import { RentalContractForm } from './RentalContractForm';
import { GroupRentalInfo } from '@/types/group-rental';
import { RentalContract } from '@/types/rental-contract';
import { ChevronLeft, RotateCcw } from 'lucide-react';

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
  onStepChange?: (step: number, title: string, description: string) => void;
  initialGroup?: Partial<GroupRentalInfo>;
  initialContract?: Partial<RentalContract>;
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
  initialGroup, 
  initialContract 
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

  // Navigation
  const goBackToStep1 = () => {
    setCurrentStep(1);
  };

  const goBackToStep2 = () => {
    setCurrentStep(2);
  };

  // Fonction pour obtenir le titre et la description de l'étape actuelle
  const getCurrentStepInfo = () => {
    const isGroup = groupData && groupData.clients.length > 1;
    const entityType = isGroup ? 'groupe' : 'client';
    
    switch (currentStep) {
      case 1:
        return {
          title: 'Étape 1/3 : Informations clients',
          description: isGroup 
            ? 'Définissez les informations de base et ajoutez les participants'
            : 'Définissez les informations de base du client'
        };
      case 2:
        return {
          title: 'Étape 2/3 : Choix des vêtements',
          description: isGroup 
            ? 'Choisissez les vêtements pour chaque personne du groupe'
            : 'Choisissez les vêtements du client'
        };
      case 3:
        return {
          title: 'Étape 3/3 : Bon de location',
          description: 'Définissez les tarifs, dates et conditions de location'
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

  // Notifier le parent quand l'étape change
  useEffect(() => {
    if (onStepChange) {
      onStepChange(currentStep, stepInfo.title, stepInfo.description);
    }
  }, [currentStep, onStepChange, stepInfo.title, stepInfo.description]);

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
      <div className="flex items-start justify-between mb-6 pb-4 border-b border-gray-200">
        <div className="flex-1 text-left">
          <h2 className="text-lg sm:text-2xl font-bold text-gray-900 text-left">{stepInfo.title}</h2>
          <p className="text-gray-600 text-sm sm:text-sm mt-1 leading-relaxed text-left">{stepInfo.description}</p>
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
            onBack={goBackToStep1}
          />
        )}

        {currentStep === 3 && contractData && groupData && (
          <div>
            <div className="mb-6 flex items-center justify-start">
              <button
                onClick={goBackToStep2}
                className="flex items-center gap-2 px-3 py-3 text-sm text-gray-600 hover:text-amber-600 transition-colors rounded-lg hover:bg-amber-50 min-h-[48px]"
              >
                <ChevronLeft className="w-3 h-3" />
                Retour aux tenues
              </button>
            </div>

            {/* Résumé des étapes précédentes */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
              <h3 className="font-semibold text-gray-900 mb-3">
                Résumé {groupData.clients.length > 1 ? 'du groupe de location' : 'de la prise de mesure'}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                <div>
                  <span className="text-gray-600">{groupData.clients.length > 1 ? 'Groupe' : 'Client'}:</span>
                  <p className="font-medium">{groupData.groupName}</p>
                </div>
                <div>
                  <span className="text-gray-600">{groupData.clients.length > 1 ? 'Participants' : 'Téléphone'}:</span>
                  <p className="font-medium">
                    {groupData.clients.length > 1 
                      ? `${groupData.clients.length} personne${groupData.clients.length > 1 ? 's' : ''}` 
                      : groupData.telephone
                    }
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Vendeur:</span>
                  <p className="font-medium">{groupData.vendeur}</p>
                </div>
                <div>
                  <span className="text-gray-600">Date événement:</span>
                  <p className="font-medium">{groupData.dateEssai.toLocaleDateString()}</p>
                </div>
              </div>
              
              {groupData.clients.length > 1 && (
                <div className="pt-2 border-t border-gray-200">
                  <span className="text-gray-600 text-xs">Participants: </span>
                  <span className="text-xs">
                    {groupData.clients.map(client => client.nom).join(', ')}
                  </span>
                </div>
              )}
            </div>
            
            <RentalContractForm
              onSubmit={handleContractSubmit}
              onSaveDraft={handleContractSave}
              onAutoSave={handleContractAutoSave}
              onPrint={onPrint}
              initialData={contractData}
            />
          </div>
        )}
      </div>
    </div>
  );
});