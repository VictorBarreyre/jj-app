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
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      <div className="pt-4 sm:pt-16 mx-4 mb-6 sm:mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-start">{pageTitle}</h1>
          {showResetButton && (
            <button
              onClick={handleReset}
              className="text-sm text-black underline hover:text-gray-700 transition-colors font-semibold flex items-center gap-1"
            >
              <RotateCcw className="w-4 h-4" />
              Nouveau formulaire
            </button>
          )}
        </div>
        <p className="text-gray-600 text-xs sm:text-sm text-start">{pageDescription}</p>
      </div>
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-4 sm:p-6">
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
  );
}