import { useState, useRef } from 'react';
import { ThreeStepRentalForm } from '@/components/forms/ThreeStepRentalForm';
import { GroupRentalInfo } from '@/types/group-rental';
import { RentalContract } from '@/types/rental-contract';
import { RotateCcw } from 'lucide-react';

interface MeasurementFormPageProps {
  onSubmitComplete: (group: GroupRentalInfo, contract: Omit<RentalContract, 'id' | 'numero' | 'createdAt' | 'updatedAt'>) => void;
  onSaveDraft: (group?: GroupRentalInfo, contract?: Partial<RentalContract>) => void;
  onPrint?: (contractId: string, type: 'jj' | 'client') => void;
  initialGroup?: Partial<GroupRentalInfo>;
  initialContract?: Partial<RentalContract>;
}

export function MeasurementFormPage({ 
  onSubmitComplete, 
  onSaveDraft, 
  onPrint, 
  initialGroup, 
  initialContract 
}: MeasurementFormPageProps) {
  const [pageTitle, setPageTitle] = useState('Nouveau bon de location');
  const [pageDescription, setPageDescription] = useState('Processus complet : configuration, mesures puis création du bon de location');
  const [showResetButton, setShowResetButton] = useState(false);
  const formRef = useRef<{ resetForm: () => void }>(null);

  const handleStepChange = (step: number, title: string, description: string) => {
    setPageTitle(title);
    setPageDescription(description);
    setShowResetButton(step > 0); // Afficher le bouton pour toutes les étapes
  };

  const handleReset = () => {
    if (formRef.current) {
      formRef.current.resetForm();
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
      <div className="pt-4 sm:pt-16">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6">
          <ThreeStepRentalForm
            ref={formRef}
            onSubmitComplete={onSubmitComplete}
            onSaveDraft={onSaveDraft}
            onPrint={onPrint}
            onStepChange={handleStepChange}
            initialGroup={initialGroup}
            initialContract={initialContract}
          />
        </div>
      </div>
    </div>
  );
}