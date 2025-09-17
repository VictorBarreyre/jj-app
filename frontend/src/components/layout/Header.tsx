import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Menu, X, LogOut, User } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

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
  const { user, logout } = useAuth();

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-sm sticky top-0 z-50 w-full">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo et titre */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
             
              <div className="flex items-start flex-col leading-tight ml-2 sm:ml-4">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight text-left">Jean Jacques Cérémonie</h1>
                <p className="text-xs sm:text-sm text-gray-600 font-medium">Maître tailleur depuis 1867</p>
              </div>
            </div>
          </div>

          {/* Navigation desktop */}
          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={onNavigateHome}
              className={`px-3 py-2 text-sm font-medium transition-all duration-200 hover:text-amber-600 ${
                currentView === 'home' 
                  ? 'text-amber-600' 
                  : 'text-gray-700 hover:text-amber-600'
              }`}
            >
              Tableau de bord
            </button>

            <button
              onClick={onNavigateMeasurement}
              className={`px-3 py-2 text-sm font-medium transition-all duration-200 hover:text-amber-600 ${
                currentView === 'measurement' 
                  ? 'text-amber-600' 
                  : 'text-gray-700 hover:text-amber-600'
              }`}
            >
              Nouvelle mesure
            </button>

            <button
              onClick={onNavigateStock}
              className={`px-3 py-2 text-sm font-medium transition-all duration-200 hover:text-amber-600 ${
                currentView === 'stock' 
                  ? 'text-amber-600' 
                  : 'text-gray-700 hover:text-amber-600'
              }`}
            >
              Stock
            </button>
          </nav>

          {/* Section utilisateur - Desktop */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-700">{user?.prenom}</span>
              <div className="flex items-center justify-center w-6 h-6 bg-amber-500 rounded-full">
                <User className="w-3 h-3 text-white" />
              </div>
            </div>
          </div>


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
          <div className="md:hidden fixed top-20 left-0 right-0 bottom-0 z-40 border-t border-gray-200" style={{ backgroundColor: '#ffffff' }}>
            <div className="flex flex-col" style={{ backgroundColor: '#ffffff', height: 'calc(100vh - 80px)' }}>
              
              {/* Info utilisateur */}
              <div className="flex items-center justify-start gap-3 p-6 border-b border-gray-200/50">
                <div className="flex items-center justify-center w-10 h-10 bg-amber-500 rounded-full">
                  <User className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-medium text-gray-700">{user?.prenom} {user?.nom}</span>
              </div>
              
              {/* Navigation centrée */}
              <div className="flex-1 flex flex-col justify-center space-y-6 px-8">
                <button
                  onClick={() => {
                    onNavigateHome();
                    setMobileMenuOpen(false);
                  }}
                  className={`text-center px-6 py-4 text-xl font-semibold rounded-xl transition-all duration-200 ${
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
                  className={`text-center px-6 py-4 text-xl font-semibold rounded-xl transition-all duration-200 ${
                    currentView === 'measurement' 
                      ? 'text-amber-600 bg-amber-50' 
                      : 'text-gray-700 hover:text-amber-600 hover:bg-gray-50'
                  }`}
                >
                  Nouvelle mesure
                </button>

                <button
                  onClick={() => {
                    onNavigateStock();
                    setMobileMenuOpen(false);
                  }}
                  className={`text-center px-6 py-4 text-xl font-semibold rounded-xl transition-all duration-200 ${
                    currentView === 'stock' 
                      ? 'text-amber-600 bg-amber-50' 
                      : 'text-gray-700 hover:text-amber-600 hover:bg-gray-50'
                  }`}
                >
                  Stock
                </button>
              </div>

              {/* Bouton déconnexion en bas */}
              <div className="p-8">
                <Button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  Se déconnecter
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

    </header>
  );
}