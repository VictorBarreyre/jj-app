import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronDown, 
  ChevronRight, 
  Edit3, 
  History, 
  Trash2,
  Package,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

interface StockItemInGroup {
  id: string;
  taille: string;
  quantiteStock: number;
  quantiteReservee: number;
  quantiteDisponible: number;
  seuilAlerte: number;
  createdAt: string;
  updatedAt: string;
}

interface StockReferenceGroupData {
  reference: string;
  category: string;
  subCategory?: string;
  couleur?: string;
  items: StockItemInGroup[];
  totalStock: number;
  totalReserved: number;
  totalAvailable: number;
  itemCount: number;
}

interface StockReferenceGroupProps {
  group: StockReferenceGroupData;
  onEditItem: (itemId: string) => void;
  onViewMovements: (itemId: string) => void;
  onDeleteItem: (item: StockItemInGroup & { reference: string; category: string; couleur?: string }) => void;
}

export function StockReferenceGroup({ group, onEditItem, onViewMovements, onDeleteItem }: StockReferenceGroupProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusColor = (available: number, threshold: number) => {
    if (available <= 0) return 'bg-red-100 text-red-800 border-red-200';
    if (available <= threshold) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  const getStatusText = (available: number, threshold: number) => {
    if (available <= 0) return 'Épuisé';
    if (available <= threshold) return 'Stock faible';
    return 'Disponible';
  };

  const getCategoryIcon = () => {
    switch (group.category) {
      case 'veste': return '🧥';
      case 'gilet': return '🦺';
      case 'pantalon': return '👖';
      case 'accessoire': return '👔';
      default: return '📦';
    }
  };

  const getSubCategoryLabel = (subCategory?: string) => {
    if (!subCategory) return '';
    
    const labels: Record<string, string> = {
      'jaquette': 'Jaquette',
      'costume-ville': 'Costume ville',
      'smoking': 'Smoking',
      'habit-queue-de-pie': 'Habit queue de pie',
      'classique-standard': 'Gilet classique',
      'classique-croise': 'Gilet croisé',
      'ficelle-droit': 'Gilet ficelle',
      'ficelle-croise': 'Gilet ficelle croisé',
      'ecru-croise': 'Gilet écru',
      'ceinture': 'Ceinture',
      'standard': 'Standard',
      'ville': 'Ville'
    };
    
    return labels[subCategory] || subCategory;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden mb-4">
      {/* En-tête du groupe */}
      <div 
        className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-white border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {isExpanded ? (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-500" />
            )}
            <span className="text-2xl">{getCategoryIcon()}</span>
          </div>
          
          <div className="text-left">
            <h3 className="font-semibold text-lg text-gray-900 text-left">{group.reference}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600 text-left">
              <span>{getSubCategoryLabel(group.subCategory)}</span>
              {group.couleur && (
                <>
                  <span>•</span>
                  <span className="capitalize">{group.couleur}</span>
                </>
              )}
              <span>•</span>
              <span>{group.itemCount} taille{group.itemCount > 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Totaux */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xs text-gray-500 mb-1">Stock total</div>
              <div className="flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-amber-600 mr-1" />
                <span className="font-bold text-gray-900">{group.totalStock}</span>
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Réservé</div>
              <div className="flex items-center justify-center">
                <TrendingDown className="w-4 h-4 text-orange-500 mr-1" />
                <span className="font-bold text-gray-900">{group.totalReserved}</span>
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Disponible</div>
              <div className="flex items-center justify-center">
                {group.totalAvailable === 0 ? (
                  <span className="text-lg font-bold text-red-500">Épuisé</span>
                ) : (
                  <span className="text-lg font-bold text-green-600">{group.totalAvailable}</span>
                )}
              </div>
            </div>
          </div>

          {/* Statut global */}
          <Badge className={`${getStatusColor(group.totalAvailable, 5)} border font-semibold`}>
            {getStatusText(group.totalAvailable, 5)}
          </Badge>
        </div>
      </div>

      {/* Détail des tailles (collapsible) */}
      {isExpanded && (
        <div className="bg-gray-50">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Taille</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Stock</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Réservé</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Disponible</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Statut</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {group.items.map((item) => (
                  <tr key={item.id} className="hover:bg-amber-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-semibold text-gray-900 text-lg">{item.taille}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <TrendingUp className="w-4 h-4 text-amber-600 mr-2" />
                        <span className="font-bold text-gray-900">{item.quantiteStock}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <TrendingDown className="w-4 h-4 text-orange-500 mr-2" />
                        <span className="font-bold text-gray-900">{item.quantiteReservee}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {item.quantiteDisponible === 0 ? (
                        <span className="text-lg font-bold text-red-500">Épuisé</span>
                      ) : (
                        <span className="text-lg font-bold text-green-600">{item.quantiteDisponible}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={`${getStatusColor(item.quantiteDisponible, item.seuilAlerte)} border text-xs font-semibold`}>
                        {getStatusText(item.quantiteDisponible, item.seuilAlerte)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => onEditItem(item.id)}
                          className="bg-white/70 border-gray-300 text-gray-700 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 rounded-lg transition-all shadow-sm"
                        >
                          <Edit3 className="w-3 h-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => onViewMovements(item.id)}
                          className="bg-white/70 border-gray-300 text-gray-700 hover:bg-orange-50 hover:border-orange-300 hover:text-orange-700 rounded-lg transition-all shadow-sm"
                        >
                          <History className="w-3 h-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => onDeleteItem({
                            ...item,
                            reference: group.reference,
                            category: group.category,
                            couleur: group.couleur
                          })}
                          className="bg-white/70 border-gray-300 text-gray-700 hover:bg-red-50 hover:border-red-300 hover:text-red-700 rounded-lg transition-all shadow-sm"
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
      )}
    </div>
  );
}