import React, { useState, useEffect } from 'react';
import { StockItem, StockAlert, CreateStockItemData } from '@/types/stock';
import { StockAlerts } from '@/components/stock/StockAlerts';
import { StockFilters } from '@/components/stock/StockFilters';
import { StockList } from '@/components/stock/StockList';
import { AddStockItemModal } from '@/components/stock/AddStockItemModal';
import { DeleteStockItemModal } from '@/components/stock/DeleteStockItemModal';
import { Button } from '@/components/ui/button';
import { Shirt, ShirtIcon, CircleDot, Crown, Plus } from 'lucide-react';

type StockCategory = 'veste' | 'gilet' | 'pantalon' | 'accessoire';

interface CategoryTab {
  id: StockCategory;
  label: string;
  icon: React.ReactNode;
  count: number;
}

export function StockManagement() {
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<StockCategory>('veste');
  
  // Filtres (simplifiés car on filtre par onglet)
  const [searchTerm, setSearchTerm] = useState('');
  const [tailleFilter, setTailleFilter] = useState('');
  const [showAlertsOnly, setShowAlertsOnly] = useState(false);

  // État pour la vérification de disponibilité
  const [checkDate, setCheckDate] = useState(new Date().toISOString().split('T')[0]);
  
  // États des modales
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<StockItem | null>(null);
  
  useEffect(() => {
    loadStockData();
    loadAlerts();
  }, [activeCategory]);

  const loadStockData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      params.append('category', activeCategory); // Filtre par catégorie active
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
    } catch (error) {
      console.error('Erreur lors du chargement des mouvements:', error);
    }
  };

  const checkAvailabilityAtDate = async () => {
    try {
      const params = new URLSearchParams();
      params.append('category', activeCategory);
      if (searchTerm) params.append('reference', searchTerm);

      const response = await fetch(`http://localhost:3001/api/stock/availability/${checkDate}?${params}`);
      const data = await response.json();
      
    } catch (error) {
      console.error('Erreur lors de la vérification de disponibilité:', error);
    }
  };

  // Charger tous les articles pour calculer les compteurs
  const [allStockItems, setAllStockItems] = useState<StockItem[]>([]);

  const loadAllStockData = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/stock/items`);
      const data = await response.json();
      setAllStockItems(data.items || []);
    } catch (error) {
      console.error('Erreur lors du chargement de tous les articles:', error);
    }
  };

  useEffect(() => {
    loadAllStockData();
  }, []);

  // Calculer les compteurs pour chaque catégorie
  const getCategoryCount = (category: StockCategory) => {
    return allStockItems.filter(item => item.category === category).length;
  };

  // Définir les onglets avec leurs icônes
  const categoryTabs: CategoryTab[] = [
    {
      id: 'veste',
      label: 'Vestes',
      icon: <Shirt className="w-5 h-5" />,
      count: getCategoryCount('veste')
    },
    {
      id: 'gilet',
      label: 'Gilets',
      icon: <ShirtIcon className="w-5 h-5" />,
      count: getCategoryCount('gilet')
    },
    {
      id: 'pantalon',
      label: 'Pantalons',
      icon: <CircleDot className="w-5 h-5" />,
      count: getCategoryCount('pantalon')
    },
    {
      id: 'accessoire',
      label: 'Accessoires',
      icon: <Crown className="w-5 h-5" />,
      count: getCategoryCount('accessoire')
    }
  ];

  const filteredItems = stockItems.filter(item => {
    // Filtrer par catégorie active
    if (item.category !== activeCategory) return false;
    
    // Filtrer par alertes seulement si demandé
    if (showAlertsOnly) {
      return stockAlerts.some(alert => alert.stockItemId === item.id && alert.estActive);
    }
    return true;
  });

  const handleEditItem = (itemId: string) => {
    // TODO: Implémenter l'édition
  };

  const handleViewMovements = (itemId: string) => {
    loadMovements(itemId);
  };

  const handleAddNewItem = () => {
    setIsAddModalOpen(true);
  };

  const handleDeleteItem = (item: StockItem) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const handleCategoryChange = (category: StockCategory) => {
    setActiveCategory(category);
    setSearchTerm(''); // Reset search when changing category
    setTailleFilter(''); // Reset size filter when changing category
    setShowAlertsOnly(false); // Reset alerts filter when changing category
  };

  const createStockItem = async (data: CreateStockItemData) => {
    try {
      const response = await fetch('http://localhost:3001/api/stock/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de la création');
      }

      // Recharger les données
      await loadStockData();
      await loadAlerts();
    } catch (error) {
      console.error('Erreur:', error);
      throw error;
    }
  };

  const deleteStockItem = async (itemId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/stock/items/${itemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de la suppression');
      }

      // Recharger les données
      await loadStockData();
      await loadAlerts();
    } catch (error) {
      console.error('Erreur:', error);
      throw error;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
      {/* En-tête avec titre et bouton */}
      <div className="pt-4 sm:pt-16">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-left">Gestion du Stock</h1>
            <p className="text-gray-600 text-sm mt-1 text-left">Suivi en temps réel des articles et disponibilités</p>
          </div>
          <Button 
            onClick={handleAddNewItem}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Nouvel article</span>
            <span className="sm:hidden">Nouveau</span>
          </Button>
        </div>
      </div>

      {/* Bloc onglets, recherche et liste */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">

        {/* Onglets par catégories */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {categoryTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleCategoryChange(tab.id)}
                className={`
                  flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200
                  ${activeCategory === tab.id
                    ? 'border-amber-500 text-amber-600 bg-amber-50/50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {tab.icon}
                {tab.label}
                <span className={`
                  ml-2 py-0.5 px-2 rounded-full text-xs
                  ${activeCategory === tab.id
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-gray-100 text-gray-600'
                  }
                `}>
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Recherche intégrée */}
        <div className="border-b border-gray-100 p-4">
          <StockFilters
            searchTerm={searchTerm}
            categoryFilter={activeCategory}
            tailleFilter={tailleFilter}
            showAlertsOnly={false}
            checkDate=""
            onSearchChange={setSearchTerm}
            onCategoryChange={() => {}}
            onTailleChange={setTailleFilter}
            onAlertsOnlyChange={() => {}}
            onCheckDateChange={() => {}}
            onSearch={loadStockData}
            onCheckAvailability={() => {}}
          />
        </div>

        {/* Liste des articles */}
        <StockList
          items={filteredItems}
          loading={loading}
          onEdit={handleEditItem}
          onViewMovements={handleViewMovements}
          onAddNew={() => {}} // Désactivé car bouton déjà en haut
          onDelete={handleDeleteItem}
          hideHeader={true} // Nouvelle prop pour masquer l'en-tête
        />
      </div>

      {/* Modales */}
      <AddStockItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={createStockItem}
        defaultCategory={activeCategory} // Pré-sélectionner la catégorie active
      />

      <DeleteStockItemModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setItemToDelete(null);
        }}
        onConfirm={deleteStockItem}
        item={itemToDelete}
      />
    </div>
  );
}