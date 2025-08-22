import { useState } from 'react'
import { Home } from './components/home/Home'
import { MeasurementForm } from './components/forms/MeasurementForm'
import { MeasurementForm as MeasurementFormType } from './types/measurement-form'
import { Order } from './types/order'
import { mockOrders } from './data/mockOrders'
import './App.css'

type AppView = 'home' | 'measurement' | 'view-order' | 'edit-order';

function App() {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const handleFormSubmit = (form: MeasurementFormType) => {
    console.log('Formulaire transmis au PC caisse:', form);
    alert('Formulaire transmis avec succès !');
    setCurrentView('home');
  };

  const handleFormSave = (form: MeasurementFormType) => {
    console.log('Brouillon sauvegardé:', form);
    alert('Brouillon sauvegardé !');
  };

  const handleCreateNew = () => {
    setCurrentView('measurement');
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    console.log('Voir commande:', order);
    alert(`Affichage de la commande #${order.numero}`);
  };

  const handleEditOrder = (order: Order) => {
    setSelectedOrder(order);
    console.log('Modifier commande:', order);
    alert(`Modification de la commande #${order.numero}`);
  };

  const handleDeleteOrder = (orderId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) {
      setOrders(prev => prev.filter(order => order.id !== orderId));
      alert('Commande supprimée avec succès');
    }
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setSelectedOrder(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      {currentView === 'home' && (
        <Home
          orders={orders}
          onCreateNew={handleCreateNew}
          onViewOrder={handleViewOrder}
          onEditOrder={handleEditOrder}
          onDeleteOrder={handleDeleteOrder}
        />
      )}
      
      {currentView === 'measurement' && (
        <div>
          <div className="max-w-4xl mx-auto p-4 pb-0">
            <button
              onClick={handleBackToHome}
              className="text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-2"
            >
              ← Retour à l'accueil
            </button>
          </div>
          <MeasurementForm 
            onSubmit={handleFormSubmit}
            onSave={handleFormSave}
          />
        </div>
      )}
    </div>
  )
}

export default App