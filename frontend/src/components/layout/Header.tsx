import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  currentView: 'home' | 'measurement' | 'stock' | 'view-order' | 'edit-order';
  onNavigateHome: () => void;
  onNavigateMeasurement: () => void;
  onNavigateStock: () => void;
  ordersCount?: number;
  pendingOrdersCount?: number;
}

export function Header({ 
  currentView, 
  onNavigateHome, 
  onNavigateMeasurement,
  onNavigateStock,
  ordersCount = 0,
  pendingOrdersCount = 0
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-lg sticky top-0 z-50 w-full">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo et titre */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
             
              <div className="flex items-start flex-col leading-tight ml-4">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Jean Jacques Cérémonie</h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block font-medium">Maître tailleur depuis 1985</p>
              </div>
            </div>
          </div>

          {/* Navigation desktop */}
          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={onNavigateHome}
              className={`px-4 py-2 font-medium transition-all duration-200 hover:text-amber-600 ${
                currentView === 'home' 
                  ? 'text-amber-600' 
                  : 'text-gray-700 hover:text-amber-600'
              }`}
            >
              Tableau de bord
            </button>

            <button
              onClick={onNavigateMeasurement}
              className={`px-4 py-2 font-medium transition-all duration-200 hover:text-amber-600 ${
                currentView === 'measurement' 
                  ? 'text-amber-600' 
                  : 'text-gray-700 hover:text-amber-600'
              }`}
            >
              Nouvelle prise de mesure
            </button>

            <button
              onClick={onNavigateStock}
              className={`px-4 py-2 font-medium transition-all duration-200 hover:text-amber-600 ${
                currentView === 'stock' 
                  ? 'text-amber-600' 
                  : 'text-gray-700 hover:text-amber-600'
              }`}
            >
              Gestion du stock
            </button>

          
          </nav>

          {/* Bouton menu mobile */}
          <button
            className="md:hidden p-3 rounded-xl hover:bg-gray-50 transition-colors border border-gray-200"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-gray-700" />
            ) : (
              <Menu className="w-5 h-5 text-gray-700" />
            )}
          </button>
        </div>

        {/* Menu mobile */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 space-y-2">
            <button
              onClick={() => {
                onNavigateHome();
                setMobileMenuOpen(false);
              }}
              className={`w-full px-4 py-3 text-left font-medium transition-colors ${
                currentView === 'home' 
                  ? 'text-amber-600 bg-amber-50' 
                  : 'text-gray-700 hover:text-amber-600 hover:bg-gray-50'
              }`}
            >
              Tableau de bord
            </button>

            <button
              onClick={() => {
                onNavigateMeasurement();
                setMobileMenuOpen(false);
              }}
              className={`w-full px-4 py-3 text-left font-medium transition-colors ${
                currentView === 'measurement' 
                  ? 'text-amber-600 bg-amber-50' 
                  : 'text-gray-700 hover:text-amber-600 hover:bg-gray-50'
              }`}
            >
              Nouvelle prise de mesure
            </button>

            <button
              onClick={() => {
                onNavigateStock();
                setMobileMenuOpen(false);
              }}
              className={`w-full px-4 py-3 text-left font-medium transition-colors ${
                currentView === 'stock' 
                  ? 'text-amber-600 bg-amber-50' 
                  : 'text-gray-700 hover:text-amber-600 hover:bg-gray-50'
              }`}
            >
              Gestion du stock
            </button>

        
          </div>
        )}
      </div>
    </header>
  );
}