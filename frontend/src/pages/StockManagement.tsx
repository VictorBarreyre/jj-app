import React, { useState, useEffect } from 'react';
import { StockItem, StockAlert, CreateStockItemData } from '@/types/stock';
import { StockAlerts } from '@/components/stock/StockAlerts';
import { StockFilters } from '@/components/stock/StockFilters';
import { StockList } from '@/components/stock/StockList';
import { StockReferenceList } from '@/components/stock/StockReferenceList';
import { AddStockItemModal } from '@/components/stock/AddStockItemModal';
import { DeleteStockItemModal } from '@/components/stock/DeleteStockItemModal';
import { Button } from '@/components/ui/button';
import { Shirt, ShirtIcon, CircleDot, Crown, Plus, ChevronLeft, ChevronRight, Grid3X3, List } from 'lucide-react';

type StockCategory = 'veste' | 'gilet' | 'pantalon' | 'accessoire';

interface CategoryTab {
  id: StockCategory;
  label: string;
  icon: React.ReactNode;
  count: number;
}

interface StockReferenceGroupData {
  reference: string;
  category: string;
  subCategory?: string;
  couleur?: string;
  items: Array<{
    id: string;
    taille: string;
    quantiteStock: number;
    quantiteReservee: number;
    quantiteDisponible: number;
    seuilAlerte: number;
    createdAt: string;
    updatedAt: string;
  }>;
  totalStock: number;
  totalReserved: number;
  totalAvailable: number;
  itemCount: number;
}

export function StockManagement() {
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [stockGroups, setStockGroups] = useState<StockReferenceGroupData[]>([]);
  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<StockCategory>('veste');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const viewMode = 'grouped';
  
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
    setCurrentPage(1); // Reset to first page when category changes
    loadStockData();
    loadAlerts();
  }, [activeCategory]);

  useEffect(() => {
    loadStockData();
  }, [currentPage]);

  const loadStockData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      params.append('category', activeCategory); // Filtre par catégorie active
      params.append('page', currentPage.toString());
      
      // En mode groupé, on peut chercher par taille aussi
      if (tailleFilter) params.append('taille', tailleFilter);
      params.append('limit', '20'); // Moins de références par page
      const response = await fetch(`http://localhost:3001/api/stock/items/grouped?${params}`);
      const data = await response.json();
      setStockGroups(data.references || []);
      setTotalPages(data.totalPages || 1);
      setTotalItems(data.total || 0);
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

  // Stocker les compteurs par catégorie (évite de charger tous les articles)
  const [categoryCounts, setCategoryCounts] = useState<Record<StockCategory, number>>({
    veste: 0,
    gilet: 0,
    pantalon: 0,
    accessoire: 0
  });

  const loadCategoryCounts = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/stock/items/counts`);
      const data = await response.json();
      setCategoryCounts(data.counts || {
        veste: 0,
        gilet: 0,
        pantalon: 0,
        accessoire: 0
      });
    } catch (error) {
      console.error('Erreur lors du chargement des compteurs:', error);
      // Fallback: compter via l'API existante si l'endpoint counts n'existe pas
      const categories: StockCategory[] = ['veste', 'gilet', 'pantalon', 'accessoire'];
      const counts: Record<StockCategory, number> = { veste: 0, gilet: 0, pantalon: 0, accessoire: 0 };
      
      for (const category of categories) {
        const response = await fetch(`http://localhost:3001/api/stock/items?category=${category}&count_only=true`);
        const data = await response.json();
        counts[category] = data.total || 0;
      }
      setCategoryCounts(counts);
    }
  };

  useEffect(() => {
    loadCategoryCounts();
  }, []);

  // Calculer les compteurs pour chaque catégorie
  const getCategoryCount = (category: StockCategory) => {
    return categoryCounts[category] || 0;
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

  const handleDeleteItem = (item: StockItem | any) => {
    // Adapter l'item selon le format nécessaire pour la modal
    const standardizedItem: StockItem = {
      id: item.id,
      category: item.category,
      subCategory: item.subCategory,
      reference: item.reference,
      taille: item.taille,
      couleur: item.couleur,
      quantiteStock: item.quantiteStock,
      quantiteReservee: item.quantiteReservee,
      quantiteDisponible: item.quantiteDisponible,
      seuilAlerte: item.seuilAlerte,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    };
    setItemToDelete(standardizedItem);
    setIsDeleteModalOpen(true);
  };

  const handleCategoryChange = (category: StockCategory) => {
    setActiveCategory(category);
    setCurrentPage(1); // Reset to first page
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

      // Recharger les données et compteurs
      await loadStockData();
      await loadAlerts();
      await loadCategoryCounts();
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

      // Recharger les données et compteurs
      await loadStockData();
      await loadAlerts();
      await loadCategoryCounts();
    } catch (error) {
      console.error('Erreur:', error);
      throw error;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-3 sm:p-6 space-y-4 sm:space-y-8">
      <div className="pt-2 sm:pt-16">
        {/* Bloc principal avec titre et contenu */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* En-tête avec titre et bouton - maintenant dans le bloc */}
          <div className="flex flex-col gap-4 sm:gap-0 sm:flex-row sm:justify-between sm:items-center p-4 sm:p-6 border-b border-gray-200">
            <div className="text-left">
              <h1 className="text-xl sm:text-3xl font-bold text-gray-900 leading-tight">Gestion du Stock</h1>
              <p className="text-gray-600 text-sm sm:text-sm mt-1 leading-relaxed">Suivi en temps réel des articles et disponibilités</p>
            </div>
            <div className="flex justify-center sm:justify-end">
              <Button 
                onClick={handleAddNewItem}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold px-6 py-4 sm:px-6 sm:py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-3 w-full sm:w-auto justify-center text-lg sm:text-base min-h-[56px] sm:min-h-0"
              >
                <Plus className="w-6 h-6 sm:w-5 sm:h-5" />
                <span>Nouvel article</span>
              </Button>
            </div>
          </div>

          {/* Onglets par catégories */}
          <div className="border-b border-gray-200">
            <nav className="flex overflow-x-auto px-3 sm:px-6 scrollbar-hide" aria-label="Tabs">
            <div className="flex space-x-3 sm:space-x-8 min-w-max py-1">
              {categoryTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleCategoryChange(tab.id)}
                  className={`
                    flex items-center gap-3 sm:gap-2 py-4 sm:py-4 px-4 sm:px-1 border-b-2 font-semibold text-base sm:text-sm transition-colors duration-200 whitespace-nowrap min-h-[60px] sm:min-h-0
                    ${activeCategory === tab.id
                      ? 'border-amber-500 text-amber-700 bg-amber-50/70'
                      : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300 hover:bg-gray-50/50'
                    }
                  `}
                >
                  <span className="w-5 h-5 sm:w-5 sm:h-5">{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden font-medium">{tab.label.slice(0, -1)}</span>
                  <span className={`
                    ml-1 sm:ml-2 py-1 px-2 sm:py-0.5 sm:px-2 rounded-full text-sm sm:text-xs font-bold min-w-[28px] text-center
                    ${activeCategory === tab.id
                      ? 'bg-amber-200 text-amber-900'
                      : 'bg-gray-200 text-gray-700'
                    }
                  `}>
                    {tab.count}
                  </span>
                </button>
              ))}
              </div>
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
          <StockReferenceList
            groups={stockGroups}
            loading={loading}
            onEditItem={handleEditItem}
            onViewMovements={handleViewMovements}
            onAddNew={() => {}} // Désactivé car bouton déjà en haut
            onDeleteItem={handleDeleteItem}
            hideHeader={true} // Nouvelle prop pour masquer l'en-tête
          />

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="text-sm text-gray-700">
                Page {currentPage} sur {totalPages} • {totalItems} référence{totalItems > 1 ? 's' : ''} au total
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage <= 1}
                  className="flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Précédent
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage >= totalPages}
                  className="flex items-center gap-1"
                >
                  Suivant
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
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