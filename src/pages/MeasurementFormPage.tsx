import { MeasurementForm } from '@/components/forms/MeasurementForm';
import { MeasurementForm as MeasurementFormType } from '@/types/measurement-form';

interface MeasurementFormPageProps {
  onSubmit: (form: MeasurementFormType) => void;
  onSave: (form: MeasurementFormType) => void;
  initialData?: Partial<MeasurementFormType>;
}

export function MeasurementFormPage({ onSubmit, onSave, initialData }: MeasurementFormPageProps) {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6 mt-20">
        <MeasurementForm 
          onSubmit={onSubmit}
          onSave={onSave}
          initialData={initialData}
        />
      </div>
    </div>
  );
}