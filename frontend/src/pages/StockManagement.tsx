import React, { useState, useEffect } from 'react';
import { StockItem, StockAlert, StockMovement, CreateStockItemData, UpdateStockItemData } from '@/types/stock';
import { stockService } from '@/services/stock.api';
import { stockAPI } from '@/services/api';
// import { StockAlerts } from '@/components/stock/StockAlerts';
import { StockFilters } from '@/components/stock/StockFilters';
// import { StockList } from '@/components/stock/StockList';
import { StockReferenceList } from '@/components/stock/StockReferenceList';
import { AddStockItemModal } from '@/components/stock/AddStockItemModal';
import { EditStockItemModal } from '@/components/stock/EditStockItemModal';
import { DeleteStockItemModal } from '@/components/stock/DeleteStockItemModal';
import { StockMovementsModal } from '@/components/stock/StockMovementsModal';
import { Button } from '@/components/ui/button';
import { Shirt, ShirtIcon, CircleDot, Crown, Plus, ChevronLeft, ChevronRight } from 'lucide-react';

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
  // const [stockItems] = useState<StockItem[]>([]);
  const [stockGroups, setStockGroups] = useState<StockReferenceGroupData[]>([]);
  const [allStockGroups, setAllStockGroups] = useState<StockReferenceGroupData[]>([]); // Toutes les données
  const [, setStockAlerts] = useState<StockAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<StockCategory>('veste');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  // const viewMode = 'grouped';
  
  // Filtres (simplifiés car on filtre par onglet)
  const [searchTerm, setSearchTerm] = useState('');

  // État pour la vérification de disponibilité
  // const [checkDate] = useState(new Date().toISOString().split('T')[0]);
  
  // États des modales
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isMovementsModalOpen, setIsMovementsModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<StockItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<StockItem | null>(null);
  
  // États pour l'historique des mouvements
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loadingMovements, setLoadingMovements] = useState(false);
  const [currentItemInfo, setCurrentItemInfo] = useState<{
    reference: string;
    taille: string;
    couleur?: string;
  } | null>(null);
  
  useEffect(() => {
    setCurrentPage(1); // Reset to first page when category changes
    loadStockData();
    loadAlerts();
  }, [activeCategory]);

  // Plus besoin de recharger les données quand la page change, c'est géré côté client

  // Fonction de normalisation pour la recherche flexible
  const normalizeText = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
      .replace(/[-\s_]/g, '') // Supprimer tirets, espaces, underscores
      .trim();
  };

  // Filtrage côté client
  const filterGroups = (groups: StockReferenceGroupData[], searchTerm: string) => {
    if (!searchTerm.trim()) return groups;
    
    const normalizedSearch = normalizeText(searchTerm);
    
    return groups.filter(group => {
      // Chercher dans la référence
      if (normalizeText(group.reference).includes(normalizedSearch)) return true;
      
      // Chercher dans la couleur
      if (group.couleur && normalizeText(group.couleur).includes(normalizedSearch)) return true;
      
      // Chercher dans les tailles des items
      if (group.items.some(item => normalizeText(item.taille).includes(normalizedSearch))) return true;
      
      // Chercher dans la catégorie
      if (normalizeText(group.category).includes(normalizedSearch)) return true;
      
      // Chercher dans la sous-catégorie
      if (group.subCategory && normalizeText(group.subCategory).includes(normalizedSearch)) return true;
      
      return false;
    });
  };

  // Recherche avec debounce côté client
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const filtered = filterGroups(allStockGroups, searchTerm);
      
      // Calculer pagination côté client
      const itemsPerPage = 20;
      const totalPages = Math.ceil(filtered.length / itemsPerPage);
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedData = filtered.slice(startIndex, endIndex);
      
      setStockGroups(paginatedData);
      setTotalPages(totalPages);
      setTotalItems(filtered.length);
      
      // Reset à la page 1 si on est au-delà du nombre de pages disponibles
      if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(1);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, allStockGroups, currentPage]);

  const loadStockData = async () => {
    setLoading(true);
    try {
      // Charger toutes les données pour la catégorie active, sans limite
      const data = await stockService.getGroupedItems(activeCategory, 1000);
      
      const allData = data.references || [];
      setAllStockGroups(allData); // Stocker toutes les données
      
      // La pagination et le filtrage seront gérés par l'useEffect de recherche
    } catch (error) {
      console.error('Erreur lors du chargement du stock:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAlerts = async () => {
    try {
      const data = await stockService.getAlerts();
      setStockAlerts(data.alerts || []);
    } catch (error) {
      console.error('Erreur lors du chargement des alertes:', error);
    }
  };

  const loadMovements = async (stockItemId: string) => {
    setLoadingMovements(true);
    try {
      const data = await stockService.getMovements(stockItemId, 50);
      setMovements(data.movements || []);
    } catch (error) {
      console.error('Erreur lors du chargement des mouvements:', error);
      setMovements([]);
    } finally {
      setLoadingMovements(false);
    }
  };

  // const checkAvailabilityAtDate = async () => {
  //   try {
  //     const params: Record<string, string> = { category: activeCategory };
  //     if (searchTerm) params.reference = searchTerm;

  //     const data = await stockAPI.getAvailability(checkDate, params);
  //   } catch (error) {
  //     console.error('Erreur lors de la vérification de disponibilité:', error);
  //   }
  // };

  // Stocker les compteurs par catégorie (évite de charger tous les articles)
  const [categoryCounts, setCategoryCounts] = useState<Record<StockCategory, number>>({
    veste: 0,
    gilet: 0,
    pantalon: 0,
    accessoire: 0
  });

  const loadCategoryCounts = async () => {
    try {
      const data = await stockService.getCategoryCounts();
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
        const data = await stockAPI.getItems({ category, count_only: 'true' });
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

  // const filteredItems = stockItems.filter(item => {
  //   // Filtrer par catégorie active
  //   if (item.category !== activeCategory) return false;
  //   return true;
  // });

  const handleEditItem = (item: StockItem | any) => {
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
    setItemToEdit(standardizedItem);
    setIsEditModalOpen(true);
  };

  const handleViewMovements = (itemId: string) => {
    // Trouver l'item dans les groupes pour obtenir les informations
    let itemInfo = null;
    for (const group of stockGroups) {
      const item = group.items.find(item => item.id === itemId);
      if (item) {
        itemInfo = {
          reference: group.reference,
          taille: item.taille,
          couleur: group.couleur
        };
        break;
      }
    }
    
    setCurrentItemInfo(itemInfo);
    setIsMovementsModalOpen(true);
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
  };

  const createStockItem = async (data: CreateStockItemData) => {
    try {
      await stockService.createItem(data);

      // Recharger les données et compteurs
      await loadStockData();
      await loadAlerts();
      await loadCategoryCounts();
    } catch (error) {
      console.error('Erreur:', error);
      throw error;
    }
  };

  const updateStockItem = async (itemId: string, data: UpdateStockItemData) => {
    try {
      await stockService.updateItem(itemId, data);

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
      await stockService.deleteItem(itemId);

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
          <div className="flex justify-between items-start p-6 sm:p-8 border-b border-gray-200">
            <div className="text-left flex-1">
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 leading-tight text-left">Gestion du stock</h1>
              <p className="text-gray-600 text-sm sm:text-sm mt-1 leading-tight sm:leading-relaxed">Suivi en temps réel des articles et disponibilités</p>
            </div>
            <div className="ml-4">
              <Button 
                onClick={handleAddNewItem}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold px-3 py-2 sm:px-6 sm:py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center w-12 sm:w-auto text-lg sm:text-base min-h-[48px] sm:min-h-0 sm:gap-3"
              >
                <Plus className="w-5 h-5 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline ml-0 sm:ml-0">Nouvel article</span>
              </Button>
            </div>
          </div>

          {/* Onglets par catégories */}
          <div className="border-b border-gray-200">
            <nav className="flex overflow-x-auto px-3 sm:px-6 scrollbar-hide" aria-label="Tabs">
            <div className="flex space-x-3 sm:space-x-8 min-w-max">
              {categoryTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleCategoryChange(tab.id)}
                  className={`
                    flex items-center gap-3 sm:gap-2 py-4 sm:py-4 px-4 sm:px-1 border-b-2 font-semibold text-sm sm:text-sm transition-colors duration-200 whitespace-nowrap min-h-[60px] sm:min-h-0
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
              tailleFilter=""
              showAlertsOnly={false}
              checkDate=""
              onSearchChange={setSearchTerm}
              onCategoryChange={() => {}}
              onTailleChange={() => {}}
              onAlertsOnlyChange={() => {}}
              onCheckDateChange={() => {}}
              onSearch={() => {}}
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

      <EditStockItemModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setItemToEdit(null);
        }}
        onSubmit={updateStockItem}
        item={itemToEdit}
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

      <StockMovementsModal
        isOpen={isMovementsModalOpen}
        onClose={() => {
          setIsMovementsModalOpen(false);
          setCurrentItemInfo(null);
          setMovements([]);
        }}
        movements={movements}
        loading={loadingMovements}
        itemInfo={currentItemInfo}
      />
    </div>
  );
}