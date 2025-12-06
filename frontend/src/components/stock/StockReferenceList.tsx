import React from 'react';
import { Button } from '@/components/ui/button';
import { StockReferenceGroup } from './StockReferenceGroup';
import { Package, Plus } from 'lucide-react';

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
  prix?: number;
  items: StockItemInGroup[];
  totalStock: number;
  totalReserved: number;
  totalAvailable: number;
  itemCount: number;
}

export interface StockReferenceListProps {
  groups: StockReferenceGroupData[];
  loading: boolean;
  onEditItem: (item: StockItemInGroup & { reference: string; category: string; couleur?: string; subCategory?: string }) => void;
  onViewMovements: (itemId: string) => void;
  onAddNew: () => void;
  onDeleteItem: (item: StockItemInGroup & { reference: string; category: string; couleur?: string }) => void;
  hideHeader?: boolean;
}

export function StockReferenceList({ 
  groups, 
  loading, 
  onEditItem, 
  onViewMovements, 
  onAddNew, 
  onDeleteItem, 
  hideHeader 
}: StockReferenceListProps) {
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
          <p className="text-slate-500 mt-4 text-lg font-medium">Chargement des références...</p>
        </div>
      ) : groups.length === 0 ? (
        <div className="p-16 text-left">
          <div className="bg-slate-100 w-20 h-20 rounded-2xl mb-6 flex items-center justify-center">
            <Package className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Aucune référence trouvée</h3>
          <p className="text-slate-600 mb-6">Aucun article ne correspond à vos critères de recherche</p>
          <Button 
            onClick={onAddNew}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="w-5 h-5 mr-2" />
            Ajouter un article
          </Button>
        </div>
      ) : (
        <div className="p-4 sm:p-6 bg-slate-50/30">
          {groups.map((group, index) => (
            <StockReferenceGroup
              key={`${group.reference}-${group.couleur}-${index}`}
              group={group}
              onEditItem={onEditItem}
              onViewMovements={onViewMovements}
              onDeleteItem={onDeleteItem}
            />
          ))}
        </div>
      )}
    </div>
  );
}