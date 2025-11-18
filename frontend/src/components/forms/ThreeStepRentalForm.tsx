import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { GroupSetupForm } from './GroupSetupForm';
import { GroupMeasurementForm } from './GroupMeasurementForm';
import { RentalContractForm } from './RentalContractForm';
import { GroupRentalInfo } from '@/types/group-rental';
import { RentalContract } from '@/types/rental-contract';
import { RotateCcw } from 'lucide-react';
import { calculateDefaultDates } from '@/utils/dateCalculations';

// Clés pour localStorage
const STORAGE_KEYS = {
  CURRENT_STEP: 'measurement_form_current_step',
  GROUP_DATA: 'measurement_form_group_data',
  CONTRACT_DATA: 'measurement_form_contract_data',
} as const;

interface ThreeStepRentalFormProps {
  onSubmitComplete: (group: GroupRentalInfo, contract: Omit<RentalContract, 'id' | 'numero' | 'createdAt' | 'updatedAt'>) => void;
  onSaveDraft: (group?: GroupRentalInfo, contract?: Partial<RentalContract>, forceStatus?: 'brouillon' | 'livree' | null) => void;
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
    if (savedData) {
      // Appliquer les nouvelles valeurs par défaut si elles ne sont pas définies
      return {
        ...savedData,
        depotGarantie: savedData.depotGarantie ?? 400,
        arrhes: savedData.arrhes ?? 50
      };
    }
    return null;
  });

  // Mémoriser le rendu initial pour le préserver lors des sauvegardes
  const [initialRendu] = useState<boolean>(() => initialContract?.rendu || false);

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
    setGroupData(fullGroupData); // Mettre à jour les données locales pour localStorage

    // Créer un contrat minimal avec le statut forcé à 'brouillon'
    const minimalContract: Partial<RentalContract> = {
      status: 'brouillon',
      rendu: initialRendu
    };

    onSaveDraft(fullGroupData, minimalContract, 'brouillon');
  };

  // Fonction pour confirmer en mode édition à l'étape 1
  const handleGroupSetupConfirm = (group: Omit<GroupRentalInfo, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
    const fullGroupData: GroupRentalInfo = {
      ...group,
      status: 'brouillon'
    };
    setGroupData(fullGroupData);

    // Calculer les dates par défaut
    const defaultDates = calculateDefaultDates(fullGroupData.dateEssai);

    // Créer un contrat complet avec tous les champs requis
    const arrhesAmount = contractData?.arrhes || 50;
    const contractForConfirm: any = {
      ...contractData,
      dateCreation: contractData?.dateCreation || new Date(),
      dateEvenement: fullGroupData.dateEssai,
      dateRetrait: contractData?.dateRetrait || defaultDates.dateRetrait,
      dateRetour: contractData?.dateRetour || defaultDates.dateRetour,
      client: {
        nom: fullGroupData.clients[0]?.nom || '',
        prenom: fullGroupData.clients[0]?.prenom || '',
        telephone: fullGroupData.telephone,
        email: fullGroupData.email
      },
      vendeur: fullGroupData.vendeur,
      tenue: contractData?.tenue || fullGroupData.clients[0]?.tenue || {},
      tarifLocation: contractData?.tarifLocation || undefined,
      depotGarantie: contractData?.depotGarantie || 400,
      arrhes: arrhesAmount,
      paiementArrhes: contractData?.paiementArrhes ? {
        ...contractData.paiementArrhes,
        amount: contractData.paiementArrhes.amount || arrhesAmount
      } : {
        date: new Date().toISOString().split('T')[0],
        amount: arrhesAmount
      },
      notes: contractData?.notes || '',
      status: 'livree', // Forcer le statut à 'livree'
      rendu: initialRendu
    };

    onSaveDraft(fullGroupData, contractForConfirm, 'livree');
  };

  // Étape 2 : Sélection des tenues
  const handleMeasurementSubmit = (updatedGroup: GroupRentalInfo) => {
    setGroupData(updatedGroup);
    
    // Pré-remplir les données du contrat avec les infos du groupe
    const mainClient = updatedGroup.clients[0];
    
    // Calculer les dates par défaut basées sur la date d'événement
    const defaultDates = calculateDefaultDates(updatedGroup.dateEssai);
    
    const prefilledContract: Partial<RentalContract> = {
      dateCreation: new Date(),
      dateEvenement: updatedGroup.dateEssai,
      dateRetrait: defaultDates.dateRetrait, // Jeudi avant l'événement
      dateRetour: defaultDates.dateRetour, // Mardi après l'événement
      
      client: {
        nom: updatedGroup.clients.length === 1 ? mainClient.nom : updatedGroup.groupName,
        prenom: updatedGroup.clients.length === 1 ? mainClient.prenom : '',
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
      tarifLocation: undefined,
      depotGarantie: 400,
      arrhes: 50,
      
      status: 'brouillon',
      rendu: false,
      
      ...initialContract
    };
    
    setContractData(prefilledContract);
    setCurrentStep(3);
  };

  const handleMeasurementSave = (updatedGroup: GroupRentalInfo) => {
    setGroupData(updatedGroup); // Mettre à jour les données locales pour localStorage

    // Créer un contrat minimal avec le statut forcé à 'brouillon'
    const minimalContract: Partial<RentalContract> = {
      status: 'brouillon',
      rendu: initialRendu
    };

    onSaveDraft(updatedGroup, minimalContract, 'brouillon');
  };

  // Fonction pour confirmer en mode édition à l'étape 2
  const handleMeasurementConfirm = (updatedGroup: GroupRentalInfo) => {
    setGroupData(updatedGroup);

    // Créer un contrat de base avec toutes les infos disponibles
    const mainClient = updatedGroup.clients[0];
    const defaultDates = calculateDefaultDates(updatedGroup.dateEssai);
    const arrhesAmount = contractData?.arrhes || 50;

    const contractForConfirm: any = {
      ...contractData,
      dateCreation: contractData?.dateCreation || new Date(),
      dateEvenement: updatedGroup.dateEssai,
      dateRetrait: contractData?.dateRetrait || defaultDates.dateRetrait,
      dateRetour: contractData?.dateRetour || defaultDates.dateRetour,
      client: {
        nom: updatedGroup.clients.length === 1 ? mainClient.nom : updatedGroup.groupName,
        prenom: updatedGroup.clients.length === 1 ? mainClient.prenom : '',
        telephone: updatedGroup.telephone,
        email: updatedGroup.email,
        isExistingClient: mainClient.isExistingClient,
        clientId: mainClient.clientId
      },
      vendeur: updatedGroup.vendeur,
      tenue: mainClient.tenue,
      notes: updatedGroup.groupNotes || mainClient.notes,
      tarifLocation: contractData?.tarifLocation || undefined,
      depotGarantie: contractData?.depotGarantie || 400,
      arrhes: arrhesAmount,
      paiementArrhes: contractData?.paiementArrhes ? {
        ...contractData.paiementArrhes,
        amount: contractData.paiementArrhes.amount || arrhesAmount
      } : {
        date: new Date().toISOString().split('T')[0],
        amount: arrhesAmount
      },
      status: 'livree', // Forcer le statut à 'livree'
      rendu: initialRendu
    };

    onSaveDraft(updatedGroup, contractForConfirm, 'livree');
  };

  // Étape 3 : Bon de location
  const handleContractSubmit = (contract: Omit<RentalContract, 'id' | 'numero' | 'createdAt' | 'updatedAt'>) => {
    if (groupData) {
      onSubmitComplete(groupData, contract);
      // Nettoyer le localStorage après soumission réussie
      clearFormStorage();
    }
  };

  const handleContractSave = (contract: Omit<RentalContract, 'id' | 'numero' | 'createdAt' | 'updatedAt'>, forceStatus?: 'brouillon' | 'livree' | null) => {
    if (groupData) {
      setContractData(contract); // Mettre à jour les données locales pour localStorage
      onSaveDraft(groupData, contract, forceStatus);
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
  // Maintenant toutes les étapes sont accessibles à tout moment
  const canGoToStep = (targetStep: number): boolean => {
    return true; // Navigation libre entre toutes les étapes
  };

  // Fonction de navigation entre étapes
  const navigateToStep = (targetStep: number) => {
    setCurrentStep(targetStep as 1 | 2 | 3);
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
            onConfirm={handleGroupSetupConfirm}
            initialData={initialGroup}
            isEditMode={isEditMode}
          />
        )}

        {currentStep === 2 && (
          <GroupMeasurementForm
            groupData={groupData || {
              groupName: '',
              telephone: '',
              email: '',
              dateEssai: new Date(),
              vendeur: '',
              clients: [{
                nom: '',
                prenom: '',
                telephone: '',
                email: '',
                tenue: {},
                notes: ''
              }],
              groupNotes: '',
              status: 'brouillon'
            }}
            onSubmit={handleMeasurementSubmit}
            onSave={handleMeasurementSave}
            onConfirm={handleMeasurementConfirm}
            isEditMode={isEditMode}
          />
        )}

        {currentStep === 3 && (() => {
          // Utiliser groupData ou des valeurs par défaut
          const currentGroupData = groupData || {
            groupName: '',
            telephone: '',
            email: '',
            dateEssai: new Date(),
            vendeur: '',
            clients: [{
              nom: '',
              prenom: '',
              telephone: '',
              email: '',
              tenue: {},
              notes: ''
            }],
            groupNotes: '',
            status: 'brouillon' as const
          };

          return (
            <div>

              {/* Résumé des étapes précédentes */}
              <div className="mb-6 p-5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4 text-left text-lg">
                  📋 Résumé {currentGroupData.clients.length > 1 ? 'du groupe de location' : 'de la prise de mesure'}
                </h3>
              
              {/* Informations principales - alignées à gauche */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {currentGroupData.groupName && (
                  <div className="text-left">
                    <span className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      {currentGroupData.clients.length > 1 ? 'Groupe' : 'Client'}
                    </span>
                    <p className="font-medium text-gray-900 text-xs sm:text-sm">{currentGroupData.groupName}</p>
                  </div>
                )}

                <div className="text-left">
                  <span className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    {currentGroupData.clients.length > 1 ? 'Participants' : 'Téléphone'}
                  </span>
                  <p className="font-medium text-gray-900 text-xs sm:text-sm">
                    {currentGroupData.clients.length > 1
                      ? `${currentGroupData.clients.length} personne${currentGroupData.clients.length > 1 ? 's' : ''}`
                      : currentGroupData.telephone
                    }
                  </p>
                </div>

                <div className="text-left">
                  <span className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Vendeur
                  </span>
                  <p className="font-medium text-gray-900 text-xs sm:text-sm">{currentGroupData.vendeur}</p>
                </div>

                <div className="text-left">
                  <span className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Date événement
                  </span>
                  <p className="font-medium text-gray-900 text-xs sm:text-sm">{currentGroupData.dateEssai.toLocaleDateString('fr-FR')}</p>
                </div>
              </div>

              {/* Participants détaillés pour les groupes */}
              {currentGroupData.clients.length > 1 && (
                <div className="pt-3 border-t border-gray-300">
                  <span className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 text-left">
                    Liste des participants
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {currentGroupData.clients.map((client, index) => (
                      <span key={index} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                        {client.prenom ? `${client.prenom} ${client.nom}` : client.nom}
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
                  {currentGroupData.clients.map((client, clientIndex) => {
                    const pieces = [];

                    // Veste
                    if (client.tenue.veste) {
                      const reference = client.tenue.veste.reference || '';
                      const taille = client.tenue.veste.taille || '';
                      const longueurManche = client.tenue.veste.longueurManche || '';
                      const notes = client.tenue.veste.notes || '';
                      const parts = [reference, taille, longueurManche].filter(part => part);
                      pieces.push({ text: `Veste: ${parts.join(' / ')}`, notes });
                    }

                    // Gilet (ne pas afficher si sans gilet)
                    if (client.tenue.gilet && client.tenue.gilet.reference && client.tenue.gilet.reference.trim() !== '') {
                      const reference = client.tenue.gilet.reference;
                      const taille = client.tenue.gilet.taille || '';
                      const notes = client.tenue.gilet.notes || '';
                      const parts = [reference, taille].filter(part => part);
                      pieces.push({ text: `Gilet: ${parts.join(' / ')}`, notes });
                    }

                    // Pantalon (ne pas afficher si sans pantalon)
                    if (client.tenue.pantalon && client.tenue.pantalon.reference && client.tenue.pantalon.reference.trim() !== '') {
                      const reference = client.tenue.pantalon.reference;
                      const taille = client.tenue.pantalon.taille || '';
                      const longueur = client.tenue.pantalon.longueur || '';
                      const notes = client.tenue.pantalon.notes || '';
                      const parts = [reference, taille, longueur].filter(part => part);
                      pieces.push({ text: `Pantalon: ${parts.join(' / ')}`, notes });
                    }

                    // Ceinture
                    if (client.tenue.ceinture) {
                      const reference = client.tenue.ceinture.reference || '';
                      const taille = client.tenue.ceinture.taille || '';
                      const notes = client.tenue.ceinture.notes || '';
                      const parts = [reference, taille].filter(part => part);
                      pieces.push({ text: `Ceinture: ${parts.join(' / ')}`, notes });
                    }

                    // Chapeau
                    if (client.tenue.tailleChapeau) {
                      pieces.push({ text: `Chapeau: ${client.tenue.tailleChapeau}`, notes: '' });
                    }

                    // Chaussures
                    if (client.tenue.tailleChaussures) {
                      pieces.push({ text: `Chaussures: ${client.tenue.tailleChaussures}`, notes: '' });
                    }

                    if (pieces.length === 0) {
                      pieces.push({ text: 'Aucune pièce sélectionnée', notes: '' });
                    }

                    return (
                      <div key={clientIndex} className="bg-gray-50 rounded-lg p-3 text-left">
                        <div className="font-semibold text-gray-800 text-left mb-2">
                          {client.prenom ? `${client.prenom} ${client.nom}` : client.nom}
                        </div>
                        <div className="space-y-1">
                          {pieces.map((piece, index) => (
                            <div key={index} className="text-sm text-gray-700 text-left pl-3">
                              <span className="text-amber-600 font-medium">•</span>
                              <span className="ml-2">
                                {piece.text}
                                {piece.notes && <span className="text-gray-500 italic ml-2">({piece.notes})</span>}
                              </span>
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
              {currentGroupData.clients.length > 1 && currentGroupData.telephone && (
                <div className="pt-3 border-t border-gray-300 mt-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="text-left">
                      <span className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                        Téléphone du groupe
                      </span>
                      <p className="font-medium text-gray-900 text-xs sm:text-sm">{currentGroupData.telephone}</p>
                    </div>
                    {currentGroupData.email && (
                      <div className="text-left">
                        <span className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                          Email du groupe
                        </span>
                        <p className="font-medium text-gray-900 text-xs sm:text-sm">{currentGroupData.email}</p>
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
          );
        })()}
      </div>
    </div>
  );
});