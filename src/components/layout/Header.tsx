import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Home, Plus, Package, Menu, X } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  currentView: 'home' | 'measurement' | 'view-order' | 'edit-order';
  onNavigateHome: () => void;
  onNavigateMeasurement: () => void;
  ordersCount?: number;
  pendingOrdersCount?: number;
}

export function Header({ 
  currentView, 
  onNavigateHome, 
  onNavigateMeasurement,
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
              <div className="bg-gradient-to-br from-amber-500 via-yellow-600 to-amber-700 p-3 rounded-xl shadow-lg">
                <Package className="w-7 h-7 text-white" />
              </div>
              <div className="flex items-start flex-col leading-tight ml-4">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Jean Jacques Cérémonie</h1>
                <p className="text-sm text-gray-600 hidden sm:block font-medium">Maître tailleur depuis 1985</p>
              </div>
            </div>
          </div>

          {/* Navigation desktop */}
          <nav className="hidden md:flex items-center gap-4">
            <Button
              variant={currentView === 'home' ? 'default' : 'ghost'}
              onClick={onNavigateHome}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                currentView === 'home' 
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg hover:shadow-xl border-0' 
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <Home className="w-4 h-4" />
              Tableau de bord
              {ordersCount > 0 && (
                <Badge className="ml-2 bg-white/90 text-amber-700 font-semibold">
                  {ordersCount}
                </Badge>
              )}
            </Button>

            <Button
              variant={currentView === 'measurement' ? 'default' : 'ghost'}
              onClick={onNavigateMeasurement}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                currentView === 'measurement' 
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg hover:shadow-xl border-0' 
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <Plus className="w-4 h-4" />
              Nouvelle prise de mesure
            </Button>

            {/* Indicateur tâches en attente */}
            {pendingOrdersCount > 0 && (
              <div className="flex items-center gap-2 text-sm bg-amber-50 px-4 py-2 rounded-xl border border-amber-200">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                <span className="text-amber-700 font-semibold">
                  {pendingOrdersCount} en attente
                </span>
              </div>
            )}
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
            <Button
              variant={currentView === 'home' ? 'default' : 'ghost'}
              onClick={() => {
                onNavigateHome();
                setMobileMenuOpen(false);
              }}
              className="w-full justify-start gap-2"
            >
              <Home className="w-4 h-4" />
              Accueil
              {ordersCount > 0 && (
                <Badge variant="secondary" className="ml-auto">
                  {ordersCount}
                </Badge>
              )}
            </Button>

            <Button
              variant={currentView === 'measurement' ? 'default' : 'ghost'}
              onClick={() => {
                onNavigateMeasurement();
                setMobileMenuOpen(false);
              }}
              className="w-full justify-start gap-2"
            >
              <Plus className="w-4 h-4" />
              Nouvelle prise de mesure
            </Button>

            {/* Indicateur mobile */}
            {pendingOrdersCount > 0 && (
              <div className="flex items-center gap-2 p-2 text-sm bg-orange-50 rounded-lg">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                <span className="text-orange-600 font-medium">
                  {pendingOrdersCount} commande{pendingOrdersCount > 1 ? 's' : ''} en attente
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}