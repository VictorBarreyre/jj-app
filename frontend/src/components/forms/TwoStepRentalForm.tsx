import React, { useState, useEffect } from 'react';
import { MeasurementForm } from './MeasurementForm';
import { RentalContractForm } from './RentalContractForm';
import { MeasurementForm as MeasurementFormType } from '@/types/measurement-form';
import { RentalContract } from '@/types/rental-contract';
import { ChevronLeft } from 'lucide-react';

interface TwoStepRentalFormProps {
  onSubmitComplete: (measurement: MeasurementFormType, contract: Omit<RentalContract, 'id' | 'numero' | 'createdAt' | 'updatedAt'>) => void;
  onSaveDraft: (measurement: MeasurementFormType, contract?: Partial<RentalContract>) => void;
  onPrint?: (contractId: string, type: 'jj' | 'client') => void;
  onStepChange?: (step: number, title: string, description: string) => void;
  initialMeasurement?: Partial<MeasurementFormType>;
  initialContract?: Partial<RentalContract>;
}

export function TwoStepRentalForm({ 
  onSubmitComplete, 
  onSaveDraft, 
  onPrint, 
  onStepChange,
  initialMeasurement, 
  initialContract 
}: TwoStepRentalFormProps) {
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [measurementData, setMeasurementData] = useState<MeasurementFormType | null>(null);
  const [contractData, setContractData] = useState<Partial<RentalContract> | null>(null);

  // Étape 1 : Prise de mesure
  const handleMeasurementSubmit = (measurement: MeasurementFormType) => {
    setMeasurementData(measurement);
    
    // Pré-remplir les données du contrat avec les infos de mesure
    const prefilledContract: Partial<RentalContract> = {
      dateCreation: new Date(),
      dateEvenement: measurement.dateEssai,
      dateRetrait: measurement.dateEssai,
      dateRetour: new Date(measurement.dateEssai.getTime() + 3 * 24 * 60 * 60 * 1000), // +3 jours par défaut
      
      client: {
        nom: measurement.client.nom,
        telephone: measurement.client.telephone,
        email: measurement.client.email,
        isExistingClient: measurement.client.isExistingClient,
        clientId: measurement.client.clientId
      },
      
      vendeur: measurement.vendeur,
      tenue: measurement.tenue,
      notes: measurement.notes,
      
      // Valeurs par défaut pour la tarification
      tarifLocation: 0,
      depotGarantie: 50,
      arrhes: 0,
      
      status: 'brouillon',
      rendu: false,
      
      ...initialContract
    };
    
    setContractData(prefilledContract);
    setCurrentStep(2);
  };

  const handleMeasurementSave = (measurement: MeasurementFormType) => {
    onSaveDraft(measurement);
  };

  // Étape 2 : Bon de location
  const handleContractSubmit = (contract: Omit<RentalContract, 'id' | 'numero' | 'createdAt' | 'updatedAt'>) => {
    if (measurementData) {
      onSubmitComplete(measurementData, contract);
    }
  };

  const handleContractSave = (contract: Omit<RentalContract, 'id' | 'numero' | 'createdAt' | 'updatedAt'>) => {
    if (measurementData) {
      onSaveDraft(measurementData, contract);
    }
  };

  const goBackToStep1 = () => {
    setCurrentStep(1);
  };

  // Fonction pour obtenir le titre et la description de l'étape actuelle
  const getCurrentStepInfo = () => {
    switch (currentStep) {
      case 1:
        return {
          title: 'Étape 1/2 : Prise de mesure',
          description: 'Saisissez les informations du client et sélectionnez la tenue'
        };
      case 2:
        return {
          title: 'Étape 2/2 : Bon de location',
          description: 'Définissez les tarifs, dates et conditions de location'
        };
      default:
        return {
          title: 'Nouveau bon de location',
          description: 'Processus complet : prise de mesure puis création du bon de location'
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
          <MeasurementForm
            onSubmit={handleMeasurementSubmit}
            onSave={handleMeasurementSave}
            initialData={initialMeasurement}
          />
        )}

        {currentStep === 2 && contractData && (
          <div>
            <div className="mb-6 flex items-center justify-start">
              <button
                onClick={goBackToStep1}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-amber-600 transition-colors rounded-lg hover:bg-amber-50"
              >
                <ChevronLeft className="w-3 h-3" />
                Retour aux mesures
              </button>
            </div>

            {/* Résumé de l'étape 1 */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
              <h3 className="font-semibold text-gray-900 mb-2">Résumé de la prise de mesure</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Client:</span>
                  <p className="font-medium">{measurementData?.client.nom}</p>
                </div>
                <div>
                  <span className="text-gray-600">Téléphone:</span>
                  <p className="font-medium">{measurementData?.client.telephone}</p>
                </div>
                <div>
                  <span className="text-gray-600">Vendeur:</span>
                  <p className="font-medium">{measurementData?.vendeur}</p>
                </div>
                <div>
                  <span className="text-gray-600">Date événement:</span>
                  <p className="font-medium">{measurementData?.dateEssai.toLocaleDateString()}</p>
                </div>
              </div>
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