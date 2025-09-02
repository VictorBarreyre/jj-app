import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

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
  hideCategoryFilter?: boolean;
}

export function StockFilters({
  searchTerm,
  tailleFilter,
  onSearchChange,
  onTailleChange,
  onSearch
}: StockFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-end">
      {/* Recherche */}
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Recherche par référence, couleur..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-white/70 border-gray-300 text-gray-900 focus:border-amber-500 focus:ring-amber-500/20 rounded-xl transition-all shadow-sm"
          />
        </div>
      </div>
      
      {/* Taille */}
      <div className="w-full sm:w-32">
        <Input
          placeholder="Taille (M, 52...)"
          value={tailleFilter}
          onChange={(e) => onTailleChange(e.target.value)}
          className="bg-white/70 border-gray-300 text-gray-900 focus:border-amber-500 focus:ring-amber-500/20 rounded-xl transition-all shadow-sm"
        />
      </div>
      
      {/* Bouton rechercher */}
      <Button 
        onClick={onSearch}
        className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
      >
        <Search className="w-4 h-4 mr-2" />
        Rechercher
      </Button>
    </div>
  );
}