import React, { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Edit, Trash2, Calendar, Phone, Package, Search, Filter, Plus } from 'lucide-react';
import { Order } from '@/types/order';

interface OrdersListProps {
  orders: Order[];
  onView: (order: Order) => void;
  onEdit: (order: Order) => void;
  onDelete: (orderId: string) => void;
  onCreateNew: () => void;
}

const statusColors: Record<Order['status'], string> = {
  'brouillon': 'bg-gray-500',
  'confirmee': 'bg-amber-500', 
  'en_production': 'bg-orange-500',
  'prete': 'bg-amber-600',
  'livree': 'bg-orange-600',
  'annulee': 'bg-red-500'
};

const statusLabels: Record<Order['status'], string> = {
  'brouillon': 'Brouillon',
  'confirmee': 'Confirmée',
  'en_production': 'En production',
  'prete': 'Prête',
  'livree': 'Livrée',
  'annulee': 'Annulée'
};

export function OrdersList({ orders, onView, onEdit, onDelete, onCreateNew }: OrdersListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Filtrage des commandes
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

    // Filtre par statut
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Tri par date de création (plus récent en premier)
    return filtered.sort((a, b) => new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime());
  }, [orders, searchQuery, statusFilter]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    }).format(date);
  };

  const formatPrice = (price?: number) => {
    if (!price) return '';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6 mt-20">
      {/* Actions et recherche */}
      <div className="border-b border-gray-200 pb-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
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

          {/* Filtre par statut */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-56 bg-white/70 border-gray-300 text-gray-900 rounded-xl focus:border-amber-500 hover:bg-white/90 transition-all shadow-sm">
              <Filter className="w-4 h-4 mr-2 text-amber-600" />
              <SelectValue placeholder="Filtrer par statut" />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-300 text-gray-900">
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="brouillon">Brouillon</SelectItem>
              <SelectItem value="confirmee">Confirmée</SelectItem>
              <SelectItem value="en_production">En production</SelectItem>
              <SelectItem value="prete">Prête</SelectItem>
              <SelectItem value="livree">Livrée</SelectItem>
              <SelectItem value="annulee">Annulée</SelectItem>
            </SelectContent>
          </Select>

          {/* Bouton nouvelle commande */}
          <Button 
            onClick={onCreateNew} 
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nouvelle prise de mesure
          </Button>
        </div>

      
      </div>

      {/* Version desktop - En-tête du tableau */}
      <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50/50 font-semibold text-sm text-gray-700 border border-gray-200/50 rounded-xl mb-4">
        <div className="col-span-2">Numéro</div>
        <div className="col-span-3 text-left ml-16">Client</div>
        <div className="col-span-2">Statut</div>
        <div className="col-span-2">Date création</div>
        <div className="col-span-1">Articles</div>
        <div className="col-span-1">Total</div>
        <div className="col-span-1">Actions</div>
      </div>

      {/* Contenu de la liste */}
      <div className="space-y-2">
        {filteredOrders.map((order) => (
          <div key={order.id} className="border border-gray-200/50 rounded-xl hover:shadow-md transition-all duration-200">
            {/* Version desktop */}
            <div className="hidden md:grid grid-cols-12 gap-4 p-4 hover:bg-gray-50/30 transition-all duration-200">
              {/* Numéro */}
              <div className="col-span-2">
                <div className="font-semibold text-amber-600">#{order.numero}</div>
                <div className="text-xs text-gray-500 mt-1">
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

              {/* Statut */}
              <div className="col-span-2">
                <Badge className={`${statusColors[order.status]} text-white text-xs`}>
                  {statusLabels[order.status]}
                </Badge>
              </div>

              {/* Date création */}
              <div className="col-span-2 text-sm text-gray-600">
                {formatDate(order.dateCreation)}
              </div>

              {/* Nombre d'articles */}
              <div className="col-span-1 text-sm text-gray-600">
                {order.items.length}
              </div>

              {/* Total */}
              <div className="col-span-1 font-semibold text-gray-900">
                {order.total ? formatPrice(order.total) : '-'}
              </div>

              {/* Actions */}
              <div className="col-span-1 flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onView(order)}
                  className="h-7 w-7 p-0"
                  title="Voir"
                >
                  <Eye className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(order)}
                  className="h-7 w-7 p-0"
                  title="Modifier"
                >
                  <Edit className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(order.id)}
                  className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  title="Supprimer"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {/* Version mobile - Cards */}
            <div className="md:hidden p-4 hover:bg-gray-50/30 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="font-semibold text-amber-600">#{order.numero}</div>
                  <div className="text-xs text-gray-500">par {order.createdBy}</div>
                </div>
                <Badge className={`${statusColors[order.status]} text-white text-xs`}>
                  {statusLabels[order.status]}
                </Badge>
              </div>

              <div className="space-y-2 mb-3">
                <div className="font-medium text-gray-900">
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
                  <span>Créée le {formatDate(order.dateCreation)}</span>
                </div>

                {order.dateLivraison && (
                  <div className="flex items-center gap-1 text-xs text-amber-600">
                    <Calendar className="w-3 h-3 flex-shrink-0" />
                    <span>Livraison: {formatDate(order.dateLivraison)}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{order.items.length} article{order.items.length > 1 ? 's' : ''}</span>
                  {order.total && (
                    <span className="font-semibold text-gray-900">{formatPrice(order.total)}</span>
                  )}
                </div>
              </div>

              {/* Actions mobile */}
              <div className="flex gap-2 pt-3 border-t border-gray-200/50">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onView(order)}
                  className="flex-1 bg-white/70 border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Voir
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(order)}
                  className="flex-1 bg-white/70 border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Modifier
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(order.id)}
                  className="bg-red-50 border-red-300 text-red-600 hover:bg-red-100"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
        {/* Message si liste vide */}
        {filteredOrders.length === 0 && (
          <div className="border border-gray-200/50 rounded-xl p-8 text-center">
            <div className="text-gray-400 mb-4">
              {searchQuery || statusFilter !== 'all' ? (
                <Search className="w-16 h-16 mx-auto mb-2 opacity-50" />
              ) : (
                <Package className="w-16 h-16 mx-auto mb-2 opacity-50" />
              )}
            </div>
            <div className="text-lg font-medium text-gray-600 mb-2">
              {searchQuery || statusFilter !== 'all' ? 
                'Aucune commande trouvée pour cette recherche' : 
                'Aucune commande pour le moment'
              }
            </div>
            <div className="text-sm text-gray-500">
              {searchQuery || statusFilter !== 'all' ? 
                'Essayez de modifier vos critères de recherche' : 
                'Créez votre première commande pour commencer'
              }
            </div>
            {!searchQuery && statusFilter === 'all' && (
              <Button 
                onClick={onCreateNew} 
                variant="outline" 
                className="mt-4"
              >
                Créer la première commande
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}