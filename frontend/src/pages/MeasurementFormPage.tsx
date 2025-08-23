import { useState } from 'react';
import { TwoStepRentalForm } from '@/components/forms/TwoStepRentalForm';
import { MeasurementForm as MeasurementFormType } from '@/types/measurement-form';
import { RentalContract } from '@/types/rental-contract';

interface MeasurementFormPageProps {
  onSubmitComplete: (measurement: MeasurementFormType, contract: Omit<RentalContract, 'id' | 'numero' | 'createdAt' | 'updatedAt'>) => void;
  onSaveDraft: (measurement: MeasurementFormType, contract?: Partial<RentalContract>) => void;
  onPrint?: (contractId: string, type: 'jj' | 'client') => void;
  initialMeasurement?: Partial<MeasurementFormType>;
  initialContract?: Partial<RentalContract>;
}

export function MeasurementFormPage({ 
  onSubmitComplete, 
  onSaveDraft, 
  onPrint, 
  initialMeasurement, 
  initialContract 
}: MeasurementFormPageProps) {
  const [pageTitle, setPageTitle] = useState('Nouveau bon de location');
  const [pageDescription, setPageDescription] = useState('Processus complet : prise de mesure puis création du bon de location');

  const handleStepChange = (step: number, title: string, description: string) => {
    setPageTitle(title);
    setPageDescription(description);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      <div className="pt-4 sm:pt-16 mx-4 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-start mb-2">{pageTitle}</h1>
        <p className="text-gray-600 text-xs sm:text-sm text-start">{pageDescription}</p>
      </div>
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-4 sm:p-6">
        <TwoStepRentalForm
          onSubmitComplete={onSubmitComplete}
          onSaveDraft={onSaveDraft}
          onPrint={onPrint}
          onStepChange={handleStepChange}
          initialMeasurement={initialMeasurement}
          initialContract={initialContract}
        />
      </div>
    </div>
  );
}