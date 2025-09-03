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
  onSearchChange
}: StockFiltersProps) {
  return (
    <div className="flex gap-3 items-end">
      {/* Recherche globale */}
      <div className="flex-1 min-w-0 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Recherche par référence, couleur, taille... ex: costume bleu 38L"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-white/70 border-gray-300 text-gray-900 focus:border-amber-500 focus:ring-amber-500/20 rounded-xl transition-all shadow-sm"
        />
      </div>
    </div>
  );
}