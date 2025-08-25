import React, { useState, useEffect } from 'react';
import { GroupSetupForm } from './GroupSetupForm';
import { GroupMeasurementForm } from './GroupMeasurementForm';
import { RentalContractForm } from './RentalContractForm';
import { GroupRentalInfo } from '@/types/group-rental';
import { RentalContract } from '@/types/rental-contract';
import { ChevronLeft } from 'lucide-react';

interface ThreeStepRentalFormProps {
  onSubmitComplete: (group: GroupRentalInfo, contract: Omit<RentalContract, 'id' | 'numero' | 'createdAt' | 'updatedAt'>) => void;
  onSaveDraft: (group?: GroupRentalInfo, contract?: Partial<RentalContract>) => void;
  onPrint?: (contractId: string, type: 'jj' | 'client') => void;
  onStepChange?: (step: number, title: string, description: string) => void;
  initialGroup?: Partial<GroupRentalInfo>;
  initialContract?: Partial<RentalContract>;
}

export function ThreeStepRentalForm({ 
  onSubmitComplete, 
  onSaveDraft, 
  onPrint, 
  onStepChange,
  initialGroup, 
  initialContract 
}: ThreeStepRentalFormProps) {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [groupData, setGroupData] = useState<GroupRentalInfo | null>(null);
  const [contractData, setContractData] = useState<Partial<RentalContract> | null>(null);

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
        telephone: mainClient.telephone,
        email: mainClient.email,
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
    onSaveDraft(updatedGroup);
  };

  // Étape 3 : Bon de location
  const handleContractSubmit = (contract: Omit<RentalContract, 'id' | 'numero' | 'createdAt' | 'updatedAt'>) => {
    if (groupData) {
      onSubmitComplete(groupData, contract);
    }
  };

  const handleContractSave = (contract: Omit<RentalContract, 'id' | 'numero' | 'createdAt' | 'updatedAt'>) => {
    if (groupData) {
      onSaveDraft(groupData, contract);
    }
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
          title: `Étape 1/3 : Configuration du ${entityType}`,
          description: isGroup 
            ? 'Définissez les informations de base et ajoutez les participants'
            : 'Définissez les informations de base du client'
        };
      case 2:
        return {
          title: 'Étape 2/3 : Sélection des tenues',
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

  return (
    <div className="mx-auto">
      {/* Contenu de l'étape */}
      <div className="bg-white rounded-lg">
        {currentStep === 1 && (
          <GroupSetupForm
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
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-amber-600 transition-colors rounded-lg hover:bg-amber-50"
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
                      : groupData.clients[0].telephone
                    }
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Vendeur:</span>
                  <p className="font-medium">{groupData.vendeur}</p>
                </div>
                <div>
                  <span className="text-gray-600">Date essai:</span>
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
              onPrint={onPrint}
              initialData={contractData}
            />
          </div>
        )}
      </div>
    </div>
  );
}