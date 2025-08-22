import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2, Calendar, Phone } from 'lucide-react';
import { Order } from '@/types/order';

interface OrdersListProps {
  orders: Order[];
  onView: (order: Order) => void;
  onEdit: (order: Order) => void;
  onDelete: (orderId: string) => void;
}

const statusColors: Record<Order['status'], string> = {
  'brouillon': 'bg-gray-500',
  'confirmee': 'bg-blue-500', 
  'en_production': 'bg-orange-500',
  'prete': 'bg-green-500',
  'livree': 'bg-emerald-600',
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

export function OrdersList({ orders, onView, onEdit, onDelete }: OrdersListProps) {
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
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Version desktop - En-tête du tableau */}
      <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-gray-50 font-semibold text-sm text-gray-700 border-b">
        <div className="col-span-2">Numéro</div>
        <div className="col-span-3 text-left ml-16">Client</div>
        <div className="col-span-2">Statut</div>
        <div className="col-span-2">Date création</div>
        <div className="col-span-1">Articles</div>
        <div className="col-span-1">Total</div>
        <div className="col-span-1">Actions</div>
      </div>

      {/* Liste des commandes */}
      <div className="divide-y">
        {orders.map((order) => (
          <div key={order.id}>
            {/* Version desktop */}
            <div className="hidden md:grid grid-cols-12 gap-4 p-4 hover:bg-gray-50 transition-colors">
              {/* Numéro */}
              <div className="col-span-2">
                <div className="font-semibold text-blue-700">#{order.numero}</div>
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
                  <div className="flex items-center justify-start gap-1 text-xs text-gray-500 mt-1 w-full">
                    <Phone className="w-3 h-3 flex-shrink-0" />
                    <span>{order.client.telephone}</span>
                  </div>
                )}
                {order.dateLivraison && (
                  <div className="flex items-center justify-start gap-1 text-xs text-orange-600 mt-1 w-full">
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
            <div className="md:hidden p-4 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="font-semibold text-blue-700">#{order.numero}</div>
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
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Phone className="w-3 h-3 flex-shrink-0" />
                    <span>{order.client.telephone}</span>
                  </div>
                )}

                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <Calendar className="w-3 h-3 flex-shrink-0" />
                  <span>Créée le {formatDate(order.dateCreation)}</span>
                </div>

                {order.dateLivraison && (
                  <div className="flex items-center gap-1 text-xs text-orange-600">
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
              <div className="flex gap-2 pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onView(order)}
                  className="flex-1"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Voir
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(order)}
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Modifier
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(order.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Message si liste vide */}
      {orders.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          <div className="text-lg">Aucune commande trouvée</div>
          <div className="text-sm mt-1">Utilisez les filtres ou créez une nouvelle commande</div>
        </div>
      )}
    </div>
  );
}