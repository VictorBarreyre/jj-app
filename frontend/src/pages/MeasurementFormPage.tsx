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
      <div className="pt-16 ml-4 mr-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 text-start mb-2">Nouvelle prise de mesure</h1>
        <p className="text-gray-600 text-sm text-start">Saisissez les mesures et informations du client pour créer une nouvelle commande</p>
      </div>
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6">
        <MeasurementForm
          onSubmit={onSubmit}
          onSave={onSave}
          initialData={initialData}
        />
      </div>
    </div>
  );
}