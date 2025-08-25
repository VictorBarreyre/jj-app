import { useState } from 'react';
import { ThreeStepRentalForm } from '@/components/forms/ThreeStepRentalForm';
import { GroupRentalInfo } from '@/types/group-rental';
import { RentalContract } from '@/types/rental-contract';

interface GroupRentalPageProps {
  onSubmitComplete: (group: GroupRentalInfo, contract: Omit<RentalContract, 'id' | 'numero' | 'createdAt' | 'updatedAt'>) => void;
  onSaveDraft: (group?: GroupRentalInfo, contract?: Partial<RentalContract>) => void;
  onPrint?: (contractId: string, type: 'jj' | 'client') => void;
  initialGroup?: Partial<GroupRentalInfo>;
  initialContract?: Partial<RentalContract>;
}

export function GroupRentalPage({ 
  onSubmitComplete, 
  onSaveDraft, 
  onPrint, 
  initialGroup, 
  initialContract 
}: GroupRentalPageProps) {
  const [pageTitle, setPageTitle] = useState('Nouveau groupe de location');
  const [pageDescription, setPageDescription] = useState('Processus complet : configuration, mesures puis création du bon de location');

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
        <ThreeStepRentalForm
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