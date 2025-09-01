import { useState } from 'react'
import { Header } from './components/layout/Header'
import { Home } from './pages/Home'
import { MeasurementFormPage } from './pages/MeasurementFormPage'
import { StockManagement } from './pages/StockManagement'
import { MeasurementForm as MeasurementFormType } from './types/measurement-form'
import { RentalContract } from './types/rental-contract'
import { Order } from './types/order'
import './App.css'

type AppView = 'home' | 'measurement' | 'stock' | 'view-order' | 'edit-order';

function App() {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const handleRentalSubmitComplete = (measurement: MeasurementFormType, contract: Omit<RentalContract, 'id' | 'numero' | 'createdAt' | 'updatedAt'>) => {
    alert(`Bon de location créé avec succès ! Transmis au PC caisse.`);
    setCurrentView('home');
  };

  const handleRentalSaveDraft = (measurement: MeasurementFormType, contract?: Partial<RentalContract>) => {
    // Sauvegarde silencieuse
  };

  const handlePrint = (contractId: string, type: 'jj' | 'client') => {
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
    alert(`Affichage de la commande #${order.numero}`);
  };

  const handleEditOrder = (order: Order) => {
    setSelectedOrder(order);
    alert(`Modification de la commande #${order.numero}`);
  };

  // handleDeleteOrder est maintenant géré dans le composant Home

  return (
    <div className="min-h-screen">
      <Header
        currentView={currentView}
        onNavigateHome={handleNavigateHome}
        onNavigateMeasurement={handleNavigateMeasurement}
        onNavigateStock={handleNavigateStock}
        ordersCount={0}
        pendingOrdersCount={0}
      />
      
      <main>
        {currentView === 'home' && (
          <Home
            onCreateNew={handleCreateNew}
            onViewOrder={handleViewOrder}
            onEditOrder={handleEditOrder}
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