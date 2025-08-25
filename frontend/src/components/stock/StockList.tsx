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
}

export function StockList({ items, loading, onEdit, onViewMovements, onAddNew, onDelete }: StockListProps) {
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
    <div className="bg-gradient-to-r from-white/80 to-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50/80 to-white/80">
        <div className="flex justify-between items-center">
          <h2 className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl font-bold text-gray-900">
            <div className="bg-gradient-to-br from-gray-500 to-gray-600 p-2 rounded-lg shadow-md">
              <Package className="w-5 h-5 text-white" />
            </div>
            <span className="hidden sm:inline">Articles en stock</span><span className="sm:hidden">Stock</span> ({items.length})
          </h2>
          <Button 
            onClick={onAddNew}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Nouvel article</span>
            <span className="sm:hidden">Nouveau</span>
          </Button>
        </div>
      </div>
      
      {loading ? (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto"></div>
          <p className="text-gray-500 mt-2">Chargement...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="p-8 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Plus rien en stock !</h3>
      
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
                
                <div className="grid grid-cols-3 gap-3 mb-3 text-center">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Stock</div>
                    <div className="flex items-center justify-center">
                      <TrendingUp className="w-3 h-3 text-amber-600 mr-1" />
                      <span className="font-bold text-sm text-gray-900">{item.quantiteStock}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Réservé</div>
                    <div className="flex items-center justify-center">
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
                
                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                  <span className="font-semibold text-sm text-gray-900">{item.prix}€</span>
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
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Article</th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Stock</th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Réservé</th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Disponible</th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Statut</th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Prix</th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {items.map(item => (
                  <tr key={item.id} className="hover:bg-gradient-to-r hover:from-amber-50/30 hover:to-orange-50/30 transition-all duration-200">
                    <td className="px-4 lg:px-6 py-3 lg:py-4">
                      <div>
                        <div className="font-semibold text-gray-900 text-sm lg:text-base">{item.reference}</div>
                        <div className="text-xs lg:text-sm text-gray-600 font-medium">
                          {item.category} • {item.taille}
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
                      <span className="font-bold text-gray-900 text-sm lg:text-base">{item.prix}€</span>
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
        </>
      )}
    </div>
  );
}