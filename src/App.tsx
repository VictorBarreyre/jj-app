import { MeasurementForm } from './components/forms/MeasurementForm'
import { MeasurementForm as MeasurementFormType } from './types/measurement-form'
import './App.css'

function App() {
  const handleFormSubmit = (form: MeasurementFormType) => {
    console.log('Formulaire transmis au PC caisse:', form);
    alert('Formulaire transmis avec succès !');
  };

  const handleFormSave = (form: MeasurementFormType) => {
    console.log('Brouillon sauvegardé:', form);
    alert('Brouillon sauvegardé !');
  };

  return (
    <div className="min-h-screen bg-background">
      <MeasurementForm 
        onSubmit={handleFormSubmit}
        onSave={handleFormSave}
      />
    </div>
  )
}

export default App