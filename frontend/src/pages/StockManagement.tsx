import React, { useState, useEffect } from 'react';
import { StockItem, StockAlert } from '@/types/stock';
import { StockAlerts } from '@/components/stock/StockAlerts';
import { StockFilters } from '@/components/stock/StockFilters';
import { StockList } from '@/components/stock/StockList';

export function StockManagement() {
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [tailleFilter, setTailleFilter] = useState('');
  const [showAlertsOnly, setShowAlertsOnly] = useState(false);

  // État pour la vérification de disponibilité
  const [checkDate, setCheckDate] = useState(new Date().toISOString().split('T')[0]);
  
  useEffect(() => {
    loadStockData();
    loadAlerts();
  }, []);

  const loadStockData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (categoryFilter && categoryFilter !== 'all') params.append('category', categoryFilter);
      if (tailleFilter) params.append('taille', tailleFilter);

      const response = await fetch(`http://localhost:3001/api/stock/items?${params}`);
      const data = await response.json();
      setStockItems(data.items || []);
    } catch (error) {
      console.error('Erreur lors du chargement du stock:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAlerts = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/stock/alerts');
      const data = await response.json();
      setStockAlerts(data.alerts || []);
    } catch (error) {
      console.error('Erreur lors du chargement des alertes:', error);
    }
  };

  const loadMovements = async (stockItemId?: string) => {
    try {
      const params = new URLSearchParams();
      if (stockItemId) params.append('stockItemId', stockItemId);
      params.append('limit', '20');

      const response = await fetch(`http://localhost:3001/api/stock/movements?${params}`);
      const data = await response.json();
      console.log('Mouvements:', data.movements || []);
    } catch (error) {
      console.error('Erreur lors du chargement des mouvements:', error);
    }
  };

  const checkAvailabilityAtDate = async () => {
    try {
      const params = new URLSearchParams();
      if (categoryFilter && categoryFilter !== 'all') params.append('category', categoryFilter);
      if (searchTerm) params.append('reference', searchTerm);

      const response = await fetch(`http://localhost:3001/api/stock/availability/${checkDate}?${params}`);
      const data = await response.json();
      
      console.log('Disponibilités pour le', checkDate, ':', data.availabilities);
    } catch (error) {
      console.error('Erreur lors de la vérification de disponibilité:', error);
    }
  };

  const filteredItems = stockItems.filter(item => {
    if (showAlertsOnly) {
      return stockAlerts.some(alert => alert.stockItemId === item.id && alert.estActive);
    }
    return true;
  });

  const handleEditItem = (itemId: string) => {
    console.log('Éditer article:', itemId);
    // TODO: Implémenter l'édition
  };

  const handleViewMovements = (itemId: string) => {
    loadMovements(itemId);
  };

  const handleAddNewItem = () => {
    console.log('Ajouter nouvel article');
    // TODO: Implémenter l'ajout
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
      <div className="pt-4 sm:pt-16 mx-4 mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 gap-3 sm:gap-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-start">Gestion du Stock</h1>
          <span className="hidden sm:inline text-sm sm:text-lg text-gray-600 font-medium">{filteredItems.length} article{filteredItems.length > 1 ? 's' : ''}</span>
        </div>
        <p className="text-gray-600 text-xs sm:text-sm text-start">Suivi en temps réel des articles et disponibilités</p>
      </div>

      {/* Alertes */}
      <StockAlerts alerts={stockAlerts} />

      {/* Filtres et recherche */}
      <StockFilters
        searchTerm={searchTerm}
        categoryFilter={categoryFilter}
        tailleFilter={tailleFilter}
        showAlertsOnly={showAlertsOnly}
        checkDate={checkDate}
        onSearchChange={setSearchTerm}
        onCategoryChange={setCategoryFilter}
        onTailleChange={setTailleFilter}
        onAlertsOnlyChange={setShowAlertsOnly}
        onCheckDateChange={setCheckDate}
        onSearch={loadStockData}
        onCheckAvailability={checkAvailabilityAtDate}
      />

      {/* Liste des articles */}
      <StockList
        items={filteredItems}
        loading={loading}
        onEdit={handleEditItem}
        onViewMovements={handleViewMovements}
        onAddNew={handleAddNewItem}
      />
    </div>
  );
}