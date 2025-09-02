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
    <div className="flex gap-3 items-end">
      {/* Recherche */}
      <div className="flex-1 min-w-0 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Recherche par référence, couleur..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-white/70 border-gray-300 text-gray-900 focus:border-amber-500 focus:ring-amber-500/20 rounded-xl transition-all shadow-sm"
        />
      </div>
      
      {/* Taille */}
      <div className="flex-shrink-0">
        <Input
          placeholder="Taille"
          value={tailleFilter}
          onChange={(e) => onTailleChange(e.target.value)}
          className="w-20 bg-white/70 border-gray-300 text-gray-900 focus:border-amber-500 focus:ring-amber-500/20 rounded-xl transition-all shadow-sm"
        />
      </div>
      
      {/* Bouton rechercher */}
      <Button 
        onClick={onSearch}
        className="flex-shrink-0 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
      >
        <Search className="w-4 h-4" />
      </Button>
    </div>
  );
}