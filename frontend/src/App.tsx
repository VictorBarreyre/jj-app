import { useState } from 'react'
import { Header } from './components/layout/Header'
import { Home } from './pages/Home'
import { MeasurementFormPage } from './pages/MeasurementFormPage'
import { StockManagement } from './pages/StockManagement'
import { MeasurementForm as MeasurementFormType } from './types/measurement-form'
import { RentalContract } from './types/rental-contract'
import { Order } from './types/order'
import { mockOrders } from './data/mockOrders'
import './App.css'

type AppView = 'home' | 'measurement' | 'stock' | 'view-order' | 'edit-order';

function App() {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const handleRentalSubmitComplete = (measurement: MeasurementFormType, contract: Omit<RentalContract, 'id' | 'numero' | 'createdAt' | 'updatedAt'>) => {
    console.log('Prise de mesure:', measurement);
    console.log('Bon de location créé:', contract);
    alert(`Bon de location créé avec succès ! Transmis au PC caisse.`);
    setCurrentView('home');
  };

  const handleRentalSaveDraft = (measurement: MeasurementFormType, contract?: Partial<RentalContract>) => {
    console.log('Brouillon - Mesure:', measurement);
    console.log('Brouillon - Contrat:', contract);
    alert('Brouillon sauvegardé !');
  };

  const handlePrint = (contractId: string, type: 'jj' | 'client') => {
    console.log(`Impression ${type} pour contrat:`, contractId);
    alert(`Impression ${type} lancée !`);
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

  const handleNavigateStock = () => {
    setCurrentView('stock');
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
        onNavigateStock={handleNavigateStock}
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
          <MeasurementFormPage 
            onSubmitComplete={handleRentalSubmitComplete}
            onSaveDraft={handleRentalSaveDraft}
            onPrint={handlePrint}
          />
        )}
        
        {currentView === 'stock' && (
          <StockManagement />
        )}
      </main>
    </div>
  )
}

export default App