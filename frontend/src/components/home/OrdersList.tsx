import React, { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Calendar, Phone, Package, Search, Filter, Plus, User, Shirt, FileText } from 'lucide-react';
import { Order } from '@/types/order';
import { Vendeur } from '@/types/measurement-form';
import { PDFButton } from '@/components/ui/PDFButton';
import { convertOrderToRentalContract } from '@/utils/orderToContract';

interface OrdersListProps {
  orders: Order[];
  onView: (order: Order) => void;
  onEdit: (order: Order) => void;
  onCreateNew: () => void;
  hideHeader?: boolean;
  activeType?: string;
}

const statusColors: Record<string, string> = {
  'brouillon': 'bg-yellow-500',
  'livree': 'bg-green-500',
  'rendue': 'bg-gray-500',
  // Anciens statuts pour compatibilité
  'active': 'bg-green-500',
  'delivered': 'bg-green-500',
  'completed': 'bg-gray-500',
  'returned': 'bg-gray-500',
  'draft': 'bg-yellow-500'
};

const statusLabels: Record<string, string> = {
  'brouillon': 'Brouillon',
  'livree': 'Livrée',
  'rendue': 'Rendue',
  // Anciens statuts pour compatibilité
  'active': 'Livrée',
  'delivered': 'Livrée',
  'completed': 'Rendue',
  'returned': 'Rendue',
  'draft': 'Brouillon'
};

const VENDEURS: Vendeur[] = ['Sophie', 'Olivier', 'Laurent', 'Alexis', 'Mael'];

const CATEGORIES = [
  { value: 'veste', label: 'Vestes' },
  { value: 'gilet', label: 'Gilets' },
  { value: 'pantalon', label: 'Pantalons' },
  { value: 'chapeau', label: 'Chapeaux' },
  { value: 'chaussures', label: 'Chaussures' }
];

export function OrdersList({ orders, onView, onEdit, onCreateNew, hideHeader, activeType }: OrdersListProps) {
  const [activeTab, setActiveTab] = useState<'individuel' | 'groupe'>('individuel');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [vendeurFilter, setVendeurFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Filtrage des commandes (simplifié, le filtrage par type est fait au niveau parent)
  const filteredOrders = useMemo(() => {
    let filtered = orders;

    // Filtre par recherche (numéro ou nom)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(order => 
        order.numero.toLowerCase().includes(query) ||
        order.client.nom.toLowerCase().includes(query) ||
        (order.client.prenom && order.client.prenom.toLowerCase().includes(query))
      );
    }

    // Filtre par vendeur
    if (vendeurFilter !== 'all') {
      filtered = filtered.filter(order => order.createdBy === vendeurFilter);
    }

    // Filtre par catégorie d'articles
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(order => 
        order.items.some(item => item.category === categoryFilter)
      );
    }

    // Tri par date de création (plus récent en premier)
    return filtered.sort((a, b) => new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime());
  }, [orders, searchQuery, vendeurFilter, categoryFilter]);

  const formatDate = (date: Date | string) => {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return '';
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    }).format(dateObj);
  };

  const formatPrice = (price?: number) => {
    if (price === undefined || price === null) return '';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  return (
    <div className={hideHeader ? "" : "bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-4 sm:p-6 mt-16 sm:mt-20"}>
      {!hideHeader && (
        <>
          {/* Onglets */}
          <div className="border-b border-gray-200 pb-4 mb-6">
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('individuel')}
                className={`flex-1 py-3 px-4 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 ${
                  activeTab === 'individuel'
                    ? 'bg-white text-amber-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                👤 Commandes individuelles
              </button>
              <button
                onClick={() => setActiveTab('groupe')}
                className={`flex-1 py-3 px-4 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 ${
                  activeTab === 'groupe'
                    ? 'bg-white text-amber-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                👥 Mariages/Cérémonies
              </button>
            </div>
          </div>

          {/* Actions et recherche */}
          <div className="border-b border-gray-200 pb-4 sm:pb-6 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              {/* Barre de recherche */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-amber-600 w-5 h-5" />
                <Input
                  placeholder="Rechercher par numéro de commande ou nom client..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-3 bg-white/70 border-gray-300 text-gray-900 placeholder:text-gray-500 rounded-xl focus:border-amber-500 focus:ring-amber-500/20 transition-all shadow-sm"
                />
              </div>

              {/* Filtre par vendeur */}
              <Select value={vendeurFilter} onValueChange={setVendeurFilter}>
                <SelectTrigger className="w-full md:w-auto bg-white/70 border-gray-300 text-gray-900 rounded-xl focus:border-amber-500 hover:bg-white/90 transition-all shadow-sm [&>svg]:ml-3">
                  <div className="flex items-center gap-2">
                    <User className="sm:hidden w-4 h-4 text-amber-600 flex-shrink-0" />
                    <SelectValue placeholder="Filtrer par vendeur" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-300 text-gray-900">
                  <SelectItem value="all">Vendeurs</SelectItem>
                  {VENDEURS.map(vendeur => (
                    <SelectItem key={vendeur} value={vendeur}>{vendeur}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Filtre par catégorie d'articles */}
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-auto bg-white/70 border-gray-300 text-gray-900 rounded-xl focus:border-amber-500 hover:bg-white/90 transition-all shadow-sm [&>svg]:ml-3">
                  <div className="flex items-center gap-2">
                    <Shirt className="sm:hidden w-4 h-4 text-amber-600 flex-shrink-0" />
                    <SelectValue placeholder="Filtrer par article" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-300 text-gray-900">
                  <SelectItem value="all">Articles</SelectItem>
                  {CATEGORIES.map(category => (
                    <SelectItem key={category.value} value={category.value}>{category.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Bouton nouvelle commande - hauteur harmonisée */}
              <Button 
                onClick={onCreateNew} 
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold px-4 py-3 sm:px-6 sm:py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base min-h-[48px] sm:min-h-0"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Nouvelle prise de mesure</span>
                <span className="sm:hidden">Nouveau</span>
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Recherche simplifiée quand hideHeader est actif */}
      {hideHeader && (
        <div className="border-b border-gray-100 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            {/* Barre de recherche */}
            <div className="flex-1 min-w-0 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher par numéro ou nom client..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/70 border-gray-300 text-gray-900 focus:border-amber-500 focus:ring-amber-500/20 rounded-xl transition-all shadow-sm"
              />
            </div>
            
            <div className="flex gap-3 sm:gap-2">
              {/* Filtre par vendeur */}
              <div className="flex-1 sm:flex-shrink-0">
                <Select value={vendeurFilter} onValueChange={setVendeurFilter}>
                  <SelectTrigger className="w-full sm:w-auto bg-white/70 border-gray-300 text-gray-900 focus:border-amber-500 hover:bg-white/90 transition-all shadow-sm rounded-xl pr-4 [&>svg]:ml-3">
                    <div className="flex items-center gap-1">
                      <User className="hidden w-4 h-4 text-amber-600 flex-shrink-0" />
                      <SelectValue placeholder="Vendeur" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-300 text-gray-900">
                    <SelectItem value="all">Vendeurs</SelectItem>
                    {VENDEURS.map(vendeur => (
                      <SelectItem key={vendeur} value={vendeur}>{vendeur}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filtre par catégorie d'articles */}
              <div className="flex-1 sm:flex-shrink-0">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full sm:w-auto bg-white/70 border-gray-300 text-gray-900 focus:border-amber-500 hover:bg-white/90 transition-all shadow-sm rounded-xl pr-4 [&>svg]:ml-3">
                    <div className="flex items-center gap-1">
                      <Shirt className="hidden w-4 h-4 text-amber-600 flex-shrink-0" />
                      <SelectValue placeholder="Article" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-300 text-gray-900">
                    <SelectItem value="all">Articles</SelectItem>
                    {CATEGORIES.map(category => (
                      <SelectItem key={category.value} value={category.value}>{category.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contenu de la liste */}
      <div className={hideHeader ? "p-4 sm:p-6" : ""}>
        {/* Version desktop - En-tête du tableau */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-3 lg:px-4 py-3 bg-gray-50/50 font-semibold text-xs lg:text-sm text-gray-700 border border-gray-200/50 rounded-xl mb-4">
          <div className="col-span-2 text-left">Numéro</div>
          <div className="col-span-3 text-left ml-16">Client</div>
          <div className="col-span-2">Date événement</div>
          <div className="col-span-2">Statut</div>
          <div className="col-span-1">Articles</div>
          <div className="col-span-1">Total</div>
          <div className="col-span-1 text-center">Actions</div>
        </div>

        <div className="space-y-2">
        {filteredOrders.map((order) => (
          <div key={order.id} className="border border-gray-200/50 rounded-xl hover:shadow-lg transition-shadow duration-200">
            {/* Version desktop */}
            <div className="hidden md:grid grid-cols-12 gap-4 p-3 lg:p-4 hover:bg-gray-50/30 transition-all duration-200">
              {/* Numéro */}
              <div className="col-span-2 text-left">
                <div className="font-semibold text-amber-600 text-left">#{order.numero}</div>
                <div className="text-xs text-gray-500 mt-1 text-left">
                  par {order.createdBy}
                </div>
              </div>

              {/* Client */}
              <div className="col-span-3 flex flex-col justify-start items-start ml-16">
                <div className="font-medium text-gray-900 w-full text-left">
                  {order.client.nom} {order.client.prenom}
                </div>
                {order.client.telephone && (
                  <div className="flex items-center justify-start gap-1 text-xs text-gray-600 mt-1 w-full">
                    <Phone className="w-3 h-3 flex-shrink-0" />
                    <span>{order.client.telephone}</span>
                  </div>
                )}
                {order.dateLivraison && (
                  <div className="flex items-center justify-start gap-1 text-xs text-amber-600 mt-1 w-full">
                    <Calendar className="w-3 h-3 flex-shrink-0" />
                    <span>Livraison: {formatDate(order.dateLivraison)}</span>
                  </div>
                )}
              </div>

              {/* Date événement */}
              <div className="col-span-2 text-sm text-gray-600">
                {formatDate(order.dateCreation)}
              </div>

              {/* Statut */}
              <div className="col-span-2">
                <Badge className={`${statusColors[order.status] || 'bg-gray-500'} text-white text-xs`}>
                  {statusLabels[order.status] || order.status || 'Statut inconnu'}
                </Badge>
              </div>

              {/* Nombre d'articles */}
              <div className="col-span-1 text-sm text-gray-600">
                {order.articleCount || order.items.length}
              </div>

              {/* Total */}
              <div className="col-span-1 font-medium text-sm text-gray-900">
                {order.total ? formatPrice(order.total) : '-'}
              </div>

              {/* Actions */}
              <div className="col-span-1 flex justify-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onView(order)}
                  className="h-7 w-7 p-0"
                  title="Voir"
                >
                  <Eye className="w-3 h-3" />
                </Button>
                <PDFButton
                  contract={convertOrderToRentalContract(order)}
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  type="vendeur"
                />
              </div>
            </div>

            {/* Version mobile - Cards */}
            <div className="block md:hidden p-5 hover:bg-gray-50/30 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div className="text-left">
                  <div className="font-bold text-base text-amber-600 text-left">#{order.numero}</div>
                  <div className="text-xs text-gray-500 text-left font-medium">par {order.createdBy}</div>
                </div>
                <Badge className={`${statusColors[order.status] || 'bg-gray-500'} text-white text-xs`}>
                  {statusLabels[order.status] || order.status || 'Statut inconnu'}
                </Badge>
              </div>

              <div className="space-y-2 mb-3">
                <div className="font-bold text-lg text-gray-900 text-left">
                  {order.client.nom} {order.client.prenom}
                </div>
                
                {order.client.telephone && (
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <Phone className="w-3 h-3 flex-shrink-0" />
                    <span>{order.client.telephone}</span>
                  </div>
                )}

                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <Calendar className="w-3 h-3 flex-shrink-0" />
                  <span>Événement le {formatDate(order.dateCreation)}</span>
                </div>

                {order.dateLivraison && (
                  <div className="flex items-center gap-1 text-xs text-amber-600">
                    <Calendar className="w-3 h-3 flex-shrink-0" />
                    <span>Livraison: {formatDate(order.dateLivraison)}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{order.articleCount || order.items.length} article{(order.articleCount || order.items.length) > 1 ? 's' : ''}</span>
                  {(order.total !== undefined && order.total !== null && order.total > 0) && (
                    <span className="font-medium text-sm text-gray-900">{formatPrice(order.total)}</span>
                  )}
                </div>
              </div>

              {/* Actions mobile */}
              <div className="flex gap-3 pt-4 border-t border-gray-200/50">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onView(order)}
                  className="flex-1 bg-white border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl py-3 font-medium min-h-[48px]"
                >
                  <Eye className="w-5 h-5 mr-2" />
                  <span className="text-sm">Voir</span>
                </Button>
                <PDFButton
                  contract={convertOrderToRentalContract(order)}
                  variant="outline"
                  size="sm"
                  className="flex-1 bg-white border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl py-3 font-medium min-h-[48px]"
                  type="vendeur"
                  showText={true}
                />
              </div>
            </div>
          </div>
        ))}
        {/* Message si liste vide */}
        {filteredOrders.length === 0 && (
          <div className="border border-gray-200/50 rounded-xl p-8 text-left">
            <div className="text-gray-400 mb-4">
              {searchQuery || statusFilter !== 'all' || vendeurFilter !== 'all' || categoryFilter !== 'all' ? (
                <Search className="w-16 h-16 mb-2 opacity-50" />
              ) : (
                <Package className="w-16 h-16 mb-2 opacity-50" />
              )}
            </div>
            <div className="text-base sm:text-lg font-medium text-gray-600 mb-2">
              {searchQuery || statusFilter !== 'all' || vendeurFilter !== 'all' || categoryFilter !== 'all' ? 
                'Aucune commande trouvée pour cette recherche' : 
                'Aucune commande pour le moment'
              }
            </div>
     
        
          </div>
        )}
        </div>
      </div>
    </div>
  );
}