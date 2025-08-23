import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Calendar } from 'lucide-react';

interface StockFiltersProps {
  searchTerm: string;
  categoryFilter: string;
  tailleFilter: string;
  showAlertsOnly: boolean;
  checkDate: string;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onTailleChange: (value: string) => void;
  onAlertsOnlyChange: (value: boolean) => void;
  onCheckDateChange: (value: string) => void;
  onSearch: () => void;
  onCheckAvailability: () => void;
}

export function StockFilters({
  searchTerm,
  categoryFilter,
  tailleFilter,
  showAlertsOnly,
  checkDate,
  onSearchChange,
  onCategoryChange,
  onTailleChange,
  onAlertsOnlyChange,
  onCheckDateChange,
  onSearch,
  onCheckAvailability
}: StockFiltersProps) {
  return (
    <div className="bg-gradient-to-r from-white/80 to-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-4 sm:p-6 shadow-lg">
      <h2 className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-2 rounded-lg shadow-md">
          <Filter className="w-5 h-5 text-white" />
        </div>
        Filtres et recherche
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div>
          <Label className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 block">Recherche</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Référence, couleur..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 bg-white/70 border-gray-300 text-gray-900 focus:border-amber-500 focus:ring-amber-500/20 rounded-xl transition-all shadow-sm"
            />
          </div>
        </div>
        
        <div>
          <Label className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 block">Catégorie</Label>
          <Select value={categoryFilter} onValueChange={onCategoryChange}>
            <SelectTrigger className="bg-white/70 border-gray-300 text-gray-900 focus:border-amber-500 hover:bg-white/90 transition-all shadow-sm rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les catégories</SelectItem>
              <SelectItem value="veste">Vestes</SelectItem>
              <SelectItem value="gilet">Gilets</SelectItem>
              <SelectItem value="pantalon">Pantalons</SelectItem>
              <SelectItem value="accessoire">Accessoires</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 block">Taille</Label>
          <Input
            placeholder="M, L, 52..."
            value={tailleFilter}
            onChange={(e) => onTailleChange(e.target.value)}
            className="bg-white/70 border-gray-300 text-gray-900 focus:border-amber-500 focus:ring-amber-500/20 rounded-xl transition-all shadow-sm"
          />
        </div>
        
        <div className="flex items-end">
          <Button 
            onClick={onSearch}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Search className="w-4 h-4 mr-2" />
            Rechercher
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-gray-200 gap-3 sm:gap-4">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={showAlertsOnly}
            onChange={(e) => onAlertsOnlyChange(e.target.checked)}
            className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500 rounded-md"
          />
          <span className="text-sm font-semibold text-gray-700">Afficher uniquement les alertes</span>
        </label>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <Label className="text-xs sm:text-sm font-semibold text-gray-700">Vérifier disponibilités le:</Label>
          <div className="flex gap-3">
            <Input
              type="date"
              value={checkDate}
              onChange={(e) => onCheckDateChange(e.target.value)}
              className="w-40 bg-white/70 border-gray-300 text-gray-900 focus:border-amber-500 focus:ring-amber-500/20 rounded-xl transition-all shadow-sm"
            />
            <Button 
              onClick={onCheckAvailability}
              variant="outline"
              className="bg-white/70 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl transition-all shadow-sm"
            >
              <Calendar className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Vérifier</span>
              <span className="sm:hidden">OK</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}