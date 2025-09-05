import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronDown, 
  ChevronUp,
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
  onEditItem: (item: StockItemInGroup & { reference: string; category: string; couleur?: string; subCategory?: string }) => void;
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
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-5">
      {/* En-tête du groupe */}
      <div 
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-5 sm:p-4 bg-gradient-to-r from-slate-50 to-white border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors gap-4 sm:gap-6 min-h-[120px] sm:min-h-0"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start gap-4 sm:gap-3 flex-1">
          <div className="text-left flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg sm:text-xl text-gray-900 leading-tight">{group.reference}</h3>
              {/* Flèche à droite pour mobile seulement */}
              <div className="flex sm:hidden items-center">
                {isExpanded ? (
                  <ChevronUp className="w-6 h-6 text-gray-500" />
                ) : (
                  <ChevronDown className="w-6 h-6 text-gray-500" />
                )}
              </div>
            </div>
            <div className="text-base text-gray-600 mt-1">
              <span className="font-medium">{group.itemCount} taille{group.itemCount > 1 ? 's' : ''}</span>
            </div>
            
            {/* Totaux alignés sous le titre - mobile seulement */}
            <div className="flex justify-between w-full sm:hidden mt-4">
              <div className="text-center">
                <div className="text-sm text-gray-500 mb-2 font-medium">Stock</div>
                <div className="flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-amber-600 mr-2" />
                  <span className="font-bold text-gray-900 text-lg">{group.totalStock}</span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500 mb-2 font-medium">Réservé</div>
                <div className="flex items-center justify-center">
                  <TrendingDown className="w-4 h-4 text-orange-500 mr-2" />
                  <span className="font-bold text-gray-900 text-lg">{group.totalReserved}</span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500 mb-2 font-medium">Disponible</div>
                <div className="flex items-center justify-center">
                  {group.totalAvailable === 0 ? (
                    <span className="text-lg font-bold text-red-500">Épuisé</span>
                  ) : (
                    <span className="text-lg font-bold text-green-600">{group.totalAvailable}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Totaux à droite - desktop seulement */}
        <div className="hidden sm:flex sm:items-center sm:gap-8">
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1 font-medium">Stock</div>
            <div className="flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-amber-600 mr-1" />
              <span className="font-bold text-gray-900 text-base">{group.totalStock}</span>
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1 font-medium">Réservé</div>
            <div className="flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-orange-500 mr-1" />
              <span className="font-bold text-gray-900 text-base">{group.totalReserved}</span>
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1 font-medium">Disponible</div>
            <div className="flex items-center justify-center">
              {group.totalAvailable === 0 ? (
                <span className="text-lg font-bold text-red-500">Épuisé</span>
              ) : (
                <span className="text-lg font-bold text-green-600">{group.totalAvailable}</span>
              )}
            </div>
          </div>
          {/* Flèche desktop à droite des totaux */}
          <div className="flex items-center ml-4">
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </div>
        </div>
      </div>

      {/* Détail des tailles (collapsible) */}
      {isExpanded && (
        <div className="bg-gray-50">
          {/* Vue mobile : cartes */}
          <div className="block sm:hidden">
            <div className="space-y-3 p-4">
              {group.items.map((item) => (
                <div key={item.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
                  {/* Header avec taille et statut */}
                  <div className="flex items-center justify-between bg-gray-50/50 px-4 py-3 border-b border-gray-100">
                    <div className="flex flex-col text-left">
                      <span className="font-semibold text-gray-900 text-base">Taille {item.taille}</span>
                      <div className="text-xs text-gray-500 font-medium mt-0.5">
                        <span>{group.reference}</span>
                        {group.couleur && <span className="text-gray-400"> • {group.couleur}</span>}
                      </div>
                    </div>
                    <Badge className={`${getStatusColor(item.quantiteDisponible, item.seuilAlerte)} border text-xs font-semibold px-2 py-1`}>
                      {getStatusText(item.quantiteDisponible, item.seuilAlerte)}
                    </Badge>
                  </div>
                  
                  {/* Corps de la carte avec métriques */}
                  <div className="p-4">
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wide">Stock</div>
                        <div className="flex flex-col items-center justify-center h-12">
                          <span className="font-bold text-gray-900 text-lg leading-none">{item.quantiteStock}</span>
                        </div>
                      </div>
                      <div className="text-center border-x border-gray-100">
                        <div className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wide">Réservé</div>
                        <div className="flex flex-col items-center justify-center h-12">
                          <span className="font-bold text-gray-900 text-lg leading-none">{item.quantiteReservee}</span>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wide">Disponible</div>
                        <div className="flex flex-col items-center justify-center h-12">
                          {item.quantiteDisponible === 0 ? (
                            <span className="text-lg font-bold text-red-500 leading-none">Épuisé</span>
                          ) : (
                            <span className="text-lg font-bold text-green-600 leading-none">{item.quantiteDisponible}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => onEditItem({
                          ...item,
                          reference: group.reference,
                          category: group.category,
                          subCategory: group.subCategory,
                          couleur: group.couleur
                        })}
                        className="bg-white border-gray-300 text-gray-700 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 rounded-lg transition-all shadow-sm flex-1 py-2 text-sm font-medium"
                      >
                        <Edit3 className="w-3 h-3 mr-1.5" />
                        Éditer
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => onViewMovements(item.id)}
                        className="bg-white border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 rounded-lg transition-all shadow-sm flex-1 py-2 text-sm font-medium"
                      >
                        <History className="w-3 h-3 mr-1.5" />
                        Historique
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
                        className="bg-white border-gray-300 text-gray-700 hover:bg-red-50 hover:border-red-300 hover:text-red-700 rounded-lg transition-all shadow-sm w-10 py-2 flex items-center justify-center"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Vue desktop : tableau */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Taille</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Stock</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Réservé</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Disponible</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Statut</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
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
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => onEditItem({
                        ...item,
                        reference: group.reference,
                        category: group.category,
                        subCategory: group.subCategory,
                        couleur: group.couleur
                      })}
                          className="bg-white/70 border-gray-300 text-gray-700 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 rounded-lg transition-all shadow-sm"
                          title="Modifier"
                        >
                          <Edit3 className="w-3 h-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => onViewMovements(item.id)}
                          className="bg-white/70 border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 rounded-lg transition-all shadow-sm"
                          title="Voir l'historique"
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
                          title="Supprimer"
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