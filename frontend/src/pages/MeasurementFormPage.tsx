import { useState, useRef } from 'react';
import React from 'react';
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
  const [currentStep, setCurrentStep] = useState(1);
  const [canGoToStep, setCanGoToStep] = useState<(step: number) => boolean>(() => () => false);
  const formRef = useRef<{ resetForm: () => void }>(null);
  const canGoToStepRef = useRef<(step: number) => boolean>(() => false);

  const handleStepChange = (step: number, title: string, description: string, canGoToStepFn: (step: number) => boolean) => {
    setPageTitle(title);
    setPageDescription(description);
    setShowResetButton(step > 0);
    setCurrentStep(step);
    canGoToStepRef.current = canGoToStepFn;
  };

  const handleStepClick = (targetStep: number) => {
    if (canGoToStepRef.current(targetStep)) {
      // Utiliser la fonction globale pour naviguer
      (window as any).__threeStepFormNavigate?.(targetStep);
    }
  };

  const handleReset = () => {
    if (formRef.current) {
      formRef.current.resetForm();
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
      <div className="pt-4 sm:pt-16">
        {/* Navigation à puces - Version discrète et cliquable */}
        <div className="mb-6">
          <div className="flex items-center justify-center max-w-md mx-auto">
            {[1, 2, 3].map((step) => (
              <React.Fragment key={step}>
                {/* Puce d'étape */}
                <button
                  onClick={() => handleStepClick(step)}
                  disabled={!canGoToStepRef.current(step)}
                  className={`
                    flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium transition-all duration-200
                    ${currentStep === step 
                      ? 'bg-amber-100 text-amber-700 border border-amber-300' 
                      : currentStep > step 
                        ? 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200' 
                        : canGoToStepRef.current(step)
                          ? 'bg-gray-50 text-gray-400 border border-gray-200 hover:bg-gray-100' 
                          : 'bg-gray-50 text-gray-300 border border-gray-100 cursor-not-allowed'
                    }
                  `}
                >
                  {currentStep > step ? (
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <span>{step}</span>
                  )}
                </button>
                
                {/* Ligne de connexion */}
                {step < 3 && (
                  <div 
                    className={`
                      flex-1 h-px mx-3 transition-colors duration-200
                      ${currentStep > step 
                        ? 'bg-gray-300' 
                        : 'bg-gray-200'
                      }
                    `}
                    style={{ minWidth: '40px' }}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
          <ThreeStepRentalForm
            ref={formRef}
            onSubmitComplete={onSubmitComplete}
            onSaveDraft={onSaveDraft}
            onPrint={onPrint}
            onStepChange={handleStepChange}
            onStepNavigate={handleStepClick}
            initialGroup={initialGroup}
            initialContract={initialContract}
          />
        </div>
      </div>
    </div>
  );
}