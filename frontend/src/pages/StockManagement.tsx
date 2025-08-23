import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { StockItem, StockAlert, StockMovement } from '@/types/stock';
import { 
  Package, 
  Search, 
  AlertTriangle, 
  Plus, 
  Edit3, 
  History, 
  Calendar,
  TrendingUp,
  TrendingDown,
  Filter
} from 'lucide-react';

export function StockManagement() {
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [tailleFilter, setTailleFilter] = useState('');
  const [showAlertsOnly, setShowAlertsOnly] = useState(false);

  // État pour la vérification de disponibilité
  const [checkDate, setCheckDate] = useState(new Date().toISOString().split('T')[0]);
  
  useEffect(() => {
    loadStockData();
    loadAlerts();
  }, []);

  const loadStockData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (categoryFilter && categoryFilter !== 'all') params.append('category', categoryFilter);
      if (tailleFilter) params.append('taille', tailleFilter);

      const response = await fetch(`http://localhost:3001/api/stock/items?${params}`);
      const data = await response.json();
      setStockItems(data.items || []);
    } catch (error) {
      console.error('Erreur lors du chargement du stock:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAlerts = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/stock/alerts');
      const data = await response.json();
      setStockAlerts(data.alerts || []);
    } catch (error) {
      console.error('Erreur lors du chargement des alertes:', error);
    }
  };

  const loadMovements = async (stockItemId?: string) => {
    try {
      const params = new URLSearchParams();
      if (stockItemId) params.append('stockItemId', stockItemId);
      params.append('limit', '20');

      const response = await fetch(`http://localhost:3001/api/stock/movements?${params}`);
      const data = await response.json();
      setStockMovements(data.movements || []);
    } catch (error) {
      console.error('Erreur lors du chargement des mouvements:', error);
    }
  };

  const checkAvailabilityAtDate = async () => {
    try {
      const params = new URLSearchParams();
      if (categoryFilter && categoryFilter !== 'all') params.append('category', categoryFilter);
      if (searchTerm) params.append('reference', searchTerm);

      const response = await fetch(`http://localhost:3001/api/stock/availability/${checkDate}?${params}`);
      const data = await response.json();
      
      // Afficher les résultats dans une modal ou section dédiée
      console.log('Disponibilités pour le', checkDate, ':', data.availabilities);
    } catch (error) {
      console.error('Erreur lors de la vérification de disponibilité:', error);
    }
  };

  const filteredItems = stockItems.filter(item => {
    if (showAlertsOnly) {
      return stockAlerts.some(alert => alert.stockItemId === item.id && alert.estActive);
    }
    return true;
  });

  const getStatusColor = (item: StockItem) => {
    if (item.quantiteDisponible <= 0) return 'bg-red-100 text-red-800 border-red-200';
    if (item.quantiteDisponible <= item.seuilAlerte) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-amber-100 text-amber-800 border-amber-200';
  };

  const getStatusText = (item: StockItem) => {
    if (item.quantiteDisponible <= 0) return 'Épuisé';
    if (item.quantiteDisponible <= item.seuilAlerte) return 'Stock faible';
    return 'Disponible';
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="pt-16 ml-4 mr-4 mb-8">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-3xl font-bold text-gray-900 text-start">Gestion du Stock</h1>
          <div className="flex items-center gap-3">
            <span className="text-lg text-gray-600 font-medium">{filteredItems.length} article{filteredItems.length > 1 ? 's' : ''}</span>
            <Button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
              <Plus className="w-4 h-4 mr-2" />
              Nouvel article
            </Button>
          </div>
        </div>
        <p className="text-gray-600 text-sm text-start">Suivi en temps réel des articles et disponibilités</p>
      </div>

      {/* Alertes */}
      {stockAlerts.length > 0 && (
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-orange-500 to-amber-500 p-2 rounded-lg shadow-md">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-orange-800">Alertes de stock ({stockAlerts.length})</h3>
          </div>
          <div className="space-y-3">
            {stockAlerts.slice(0, 3).map(alert => (
              <div key={alert.id} className="bg-white/80 backdrop-blur-sm border border-orange-100 rounded-xl p-4 shadow-sm">
                <p className="text-sm font-medium text-orange-800">{alert.message}</p>
                <p className="text-xs text-orange-600 mt-1">
                  Détecté le {new Date(alert.dateDetection).toLocaleDateString('fr-FR')}
                </p>
              </div>
            ))}
            {stockAlerts.length > 3 && (
              <p className="text-sm text-orange-700 font-semibold bg-white/60 p-3 rounded-xl">
                ... et {stockAlerts.length - 3} autres alertes
              </p>
            )}
          </div>
        </div>
      )}

      {/* Filtres et recherche */}
      <div className="bg-gradient-to-r from-white/80 to-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 shadow-lg">
        <h2 className="flex items-center gap-3 text-xl font-bold text-gray-900 mb-6">
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-2 rounded-lg shadow-md">
            <Filter className="w-5 h-5 text-white" />
          </div>
          Filtres et recherche
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <Label className="text-sm font-semibold text-gray-700 mb-2 block">Recherche</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Référence, couleur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/70 border-gray-300 text-gray-900 focus:border-amber-500 focus:ring-amber-500/20 rounded-xl transition-all shadow-sm"
              />
            </div>
          </div>
          
          <div>
            <Label className="text-sm font-semibold text-gray-700 mb-2 block">Catégorie</Label>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
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
            <Label className="text-sm font-semibold text-gray-700 mb-2 block">Taille</Label>
            <Input
              placeholder="M, L, 52..."
              value={tailleFilter}
              onChange={(e) => setTailleFilter(e.target.value)}
              className="bg-white/70 border-gray-300 text-gray-900 focus:border-amber-500 focus:ring-amber-500/20 rounded-xl transition-all shadow-sm"
            />
          </div>
          
          <div className="flex items-end">
            <Button 
              onClick={loadStockData}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Search className="w-4 h-4 mr-2" />
              Rechercher
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={showAlertsOnly}
              onChange={(e) => setShowAlertsOnly(e.target.checked)}
              className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500 rounded-md"
            />
            <span className="text-sm font-semibold text-gray-700">Afficher uniquement les alertes</span>
          </label>
          
          <div className="flex items-center gap-4">
            <Label className="text-sm font-semibold text-gray-700">Vérifier disponibilités le:</Label>
            <Input
              type="date"
              value={checkDate}
              onChange={(e) => setCheckDate(e.target.value)}
              className="w-40 bg-white/70 border-gray-300 text-gray-900 focus:border-amber-500 focus:ring-amber-500/20 rounded-xl transition-all shadow-sm"
            />
            <Button 
              onClick={checkAvailabilityAtDate}
              variant="outline"
              className="bg-white/70 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl transition-all shadow-sm"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Vérifier
            </Button>
          </div>
        </div>
      </div>

      {/* Liste des articles */}
      <div className="bg-gradient-to-r from-white/80 to-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50/80 to-white/80">
          <h2 className="flex items-center gap-3 text-xl font-bold text-gray-900">
            <div className="bg-gradient-to-br from-gray-500 to-gray-600 p-2 rounded-lg shadow-md">
              <Package className="w-5 h-5 text-white" />
            </div>
            Articles en stock ({filteredItems.length})
          </h2>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto"></div>
            <p className="text-gray-500 mt-2">Chargement...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Article</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Réservé</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Disponible</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Prix</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-gradient-to-r hover:from-amber-50/30 hover:to-orange-50/30 transition-all duration-200">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold text-gray-900">{item.reference}</div>
                        <div className="text-sm text-gray-600 font-medium">
                          {item.category} • {item.taille}
                          {item.couleur && ` • ${item.couleur}`}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <TrendingUp className="w-4 h-4 text-amber-600 mr-2" />
                        <span className="font-bold text-gray-900">{item.quantiteStock}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <TrendingDown className="w-4 h-4 text-orange-500 mr-2" />
                        <span className="font-bold text-gray-900">{item.quantiteReservee}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xl font-bold text-amber-600">{item.quantiteDisponible}</span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={`${getStatusColor(item)} border text-xs font-semibold`}>
                        {getStatusText(item)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-gray-900">{item.prix}€</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" className="bg-white/70 border-gray-300 text-gray-700 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 rounded-xl transition-all shadow-sm">
                          <Edit3 className="w-3 h-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => loadMovements(item.id)}
                          className="bg-white/70 border-gray-300 text-gray-700 hover:bg-orange-50 hover:border-orange-300 hover:text-orange-700 rounded-xl transition-all shadow-sm"
                        >
                          <History className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}