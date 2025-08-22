import { useState } from 'react'
import { Header } from './components/layout/Header'
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

  const handleNavigateHome = () => {
    setCurrentView('home');
    setSelectedOrder(null);
  };

  const handleNavigateMeasurement = () => {
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


  // Statistiques pour le header
  const pendingOrdersCount = orders.filter(order => 
    order.status === 'brouillon' || order.status === 'en_production'
  ).length;

  return (
    <div className="min-h-screen">
      <Header
        currentView={currentView}
        onNavigateHome={handleNavigateHome}
        onNavigateMeasurement={handleNavigateMeasurement}
        ordersCount={orders.length}
        pendingOrdersCount={pendingOrdersCount}
      />
      
      <main>
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
          <MeasurementForm 
            onSubmit={handleFormSubmit}
            onSave={handleFormSave}
          />
        )}
      </main>
    </div>
  )
}

export default App