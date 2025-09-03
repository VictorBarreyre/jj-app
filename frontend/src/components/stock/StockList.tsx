import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StockItem } from '@/types/stock';
import { 
  Package, 
  Plus,
  Edit3, 
  History, 
  TrendingUp,
  TrendingDown,
  Trash2
} from 'lucide-react';

export interface StockListProps {
  items: StockItem[];
  loading: boolean;
  onEdit: (itemId: string) => void;
  onViewMovements: (itemId: string) => void;
  onAddNew: () => void;
  onDelete: (item: StockItem) => void;
  hideHeader?: boolean;
}

export function StockList({ items, loading, onEdit, onViewMovements, onAddNew, onDelete, hideHeader }: StockListProps) {
  const getStatusColor = (item: StockItem) => {
    if (item.quantiteDisponible <= 0) return 'bg-red-100 text-red-800 border-red-200';
    if (item.quantiteDisponible <= item.seuilAlerte) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-amber-100 text-amber-800 border-amber-200';
  };

  const getStatusText = (item: StockItem) => {
    if (item.quantiteDisponible <= 0) return 'Épuisé';
    if (item.quantiteDisponible <= item.seuilAlerte) return 'Stock faible';
    return 'Disponible';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
      {!hideHeader && (
        <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-slate-600 to-slate-700 p-3 rounded-xl shadow-md">
                <Package className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 text-left">
                Gestion du stock
              </h2>
            </div>
            <Button 
              onClick={onAddNew}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Nouvel article</span>
              <span className="sm:hidden">Nouveau</span>
            </Button>
          </div>
        </div>
      )}
      
      {loading ? (
        <div className="p-12 text-left">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-b-3 border-slate-400"></div>
            <div className="absolute inset-0 rounded-full border-2 border-slate-100 animate-pulse"></div>
          </div>
          <p className="text-slate-500 mt-4 text-lg font-medium">Chargement des articles...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="p-16 text-left">
          <div className="bg-slate-100 w-20 h-20 rounded-2xl mb-6 flex items-center justify-center">
            <Package className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Aucun article en stock</h3>
          <p className="text-slate-600 mb-6">Commencez par ajouter votre premier article</p>
          <Button 
            onClick={onAddNew}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="w-5 h-5 mr-2" />
            Ajouter un article
          </Button>
        </div>
      ) : (
        <>
          {/* Version mobile - Cards */}
          <div className="block sm:hidden space-y-5 p-5">
            {items.map(item => (
              <div key={item.id} className="bg-white/80 rounded-xl p-5 shadow-sm border border-gray-200">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 text-sm">{item.reference}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      {item.category} • {item.taille}
                      {item.couleur && ` • ${item.couleur}`}
                    </div>
                  </div>
                  <Badge className={`${getStatusColor(item)} border text-xs font-semibold ml-2`}>
                    {getStatusText(item)}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-3 gap-3 mb-3 text-left">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Stock</div>
                    <div className="flex items-center">
                      <TrendingUp className="w-3 h-3 text-amber-600 mr-1" />
                      <span className="font-bold text-sm text-gray-900">{item.quantiteStock}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Réservé</div>
                    <div className="flex items-center">
                      <TrendingDown className="w-3 h-3 text-orange-500 mr-1" />
                      <span className="font-bold text-sm text-gray-900">{item.quantiteReservee}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Disponible</div>
                    {item.quantiteDisponible === 0 ? (
                      <span className="text-lg font-bold text-red-500">Épuisé 😢</span>
                    ) : (
                      <span className="text-lg font-bold text-amber-600">{item.quantiteDisponible}</span>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-end items-center pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-1">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => onEdit(item.id)}
                      className="bg-white/70 border-gray-300 text-gray-700 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 rounded-lg transition-all shadow-sm px-2 py-1"
                    >
                      <Edit3 className="w-3 h-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => onViewMovements(item.id)}
                      className="bg-white/70 border-gray-300 text-gray-700 hover:bg-orange-50 hover:border-orange-300 hover:text-orange-700 rounded-lg transition-all shadow-sm px-2 py-1"
                    >
                      <History className="w-3 h-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => onDelete(item)}
                      className="bg-white/70 border-gray-300 text-gray-700 hover:bg-red-50 hover:border-red-300 hover:text-red-700 rounded-lg transition-all shadow-sm px-2 py-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Version desktop - Table */}
          <div className="hidden sm:block p-6 bg-slate-50/30">
            {/* Groupement par catégorie */}
            {['veste', 'gilet', 'pantalon', 'accessoire'].map(category => {
              const categoryItems = items.filter(item => item.category === category);
              if (categoryItems.length === 0) return null;
              
              return (
                <div key={category} className="mb-8 last:mb-0 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-lg hover:shadow-lg transition-shadow duration-200">
                  {/* En-tête de catégorie */}
                  <div className="bg-gradient-to-r from-slate-100 to-slate-50 border-b border-slate-200 px-8 py-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-1.5 h-10 bg-gradient-to-b from-slate-500 to-slate-600 rounded-full"></div>
                        <h3 className="text-slate-800 font-bold text-xl tracking-wide">
                          {category === 'veste' ? 'Vestes' : 
                           category === 'gilet' ? 'Gilets' : 
                           category === 'pantalon' ? 'Pantalons' : 
                           'Accessoires'}
                        </h3>
                      </div>
                      <div className="px-5 py-2.5">
                        <span className="text-slate-700 font-semibold text-sm">
                          {categoryItems.length} article{categoryItems.length > 1 ? 's' : ''} • {categoryItems.reduce((total, item) => total + item.quantiteStock, 0)} pièce{categoryItems.reduce((total, item) => total + item.quantiteStock, 0) > 1 ? 's' : ''} en stock
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Contenu de la section */}
                  <div className="bg-white">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <tr>
                          <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Article</th>
                          <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Stock</th>
                          <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Réservé</th>
                          <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Disponible</th>
                          <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Statut</th>
                          <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {categoryItems.map(item => (
                          <tr key={item.id} className="hover:bg-gradient-to-r hover:from-amber-50/30 hover:to-orange-50/30 transition-all duration-200">
                            <td className="px-4 lg:px-6 py-3 lg:py-4">
                              <div>
                                <div className="font-semibold text-gray-900 text-sm lg:text-base">{item.reference}</div>
                                <div className="text-xs lg:text-sm text-gray-600 font-medium">
                                  {item.taille}
                                  {item.couleur && ` • ${item.couleur}`}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 lg:px-6 py-3 lg:py-4">
                              <div className="flex items-center">
                                <TrendingUp className="w-4 h-4 text-amber-600 mr-2" />
                                <span className="font-bold text-gray-900 text-sm lg:text-base">{item.quantiteStock}</span>
                              </div>
                            </td>
                            <td className="px-4 lg:px-6 py-3 lg:py-4">
                              <div className="flex items-center">
                                <TrendingDown className="w-4 h-4 text-orange-500 mr-2" />
                                <span className="font-bold text-gray-900 text-sm lg:text-base">{item.quantiteReservee}</span>
                              </div>
                            </td>
                            <td className="px-4 lg:px-6 py-3 lg:py-4">
                              {item.quantiteDisponible === 0 ? (
                                <span className="text-lg lg:text-xl font-bold text-red-500">Épuisé 😢</span>
                              ) : (
                                <span className="text-lg lg:text-xl font-bold text-amber-600">{item.quantiteDisponible}</span>
                              )}
                            </td>
                            <td className="px-4 lg:px-6 py-3 lg:py-4">
                              <Badge className={`${getStatusColor(item)} border text-xs font-semibold`}>
                                {getStatusText(item)}
                              </Badge>
                            </td>
                            <td className="px-4 lg:px-6 py-3 lg:py-4">
                              <div className="flex items-center gap-1 lg:gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => onEdit(item.id)}
                                  className="bg-white/70 border-gray-300 text-gray-700 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 rounded-xl transition-all shadow-sm"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => onViewMovements(item.id)}
                                  className="bg-white/70 border-gray-300 text-gray-700 hover:bg-orange-50 hover:border-orange-300 hover:text-orange-700 rounded-xl transition-all shadow-sm"
                                >
                                  <History className="w-3 h-3" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => onDelete(item)}
                                  className="bg-white/70 border-gray-300 text-gray-700 hover:bg-red-50 hover:border-red-300 hover:text-red-700 rounded-xl transition-all shadow-sm"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}