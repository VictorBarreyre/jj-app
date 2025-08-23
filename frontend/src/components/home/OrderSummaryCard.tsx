import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User, Phone, Eye, Edit, Trash2 } from 'lucide-react';
import { Order } from '@/types/order';

interface OrderSummaryCardProps {
  order: Order;
  onView: (order: Order) => void;
  onEdit: (order: Order) => void;
  onDelete: (orderId: string) => void;
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

export function OrderSummaryCard({ order, onView, onEdit, onDelete }: OrderSummaryCardProps) {
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
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Commande #{order.numero}
          </CardTitle>
          <Badge className={`${statusColors[order.status]} text-white`}>
            {statusLabels[order.status]}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Client */}
        <div className="flex items-center gap-2 text-sm">
          <User className="w-4 h-4 text-slate-500" />
          <span className="font-medium">{order.client.nom}</span>
          {order.client.prenom && <span>{order.client.prenom}</span>}
        </div>

        {/* Téléphone */}
        {order.client.telephone && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Phone className="w-4 h-4 text-slate-500" />
            <span>{order.client.telephone}</span>
          </div>
        )}

        {/* Dates */}
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Calendar className="w-4 h-4 text-slate-500" />
          <span>Créée le {formatDate(order.dateCreation)}</span>
        </div>

        {order.dateLivraison && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Calendar className="w-4 h-4 text-orange-500" />
            <span>Livraison prévue le {formatDate(order.dateLivraison)}</span>
          </div>
        )}

        {/* Articles */}
        <div className="text-sm text-slate-600">
          <span className="font-medium">{order.items.length}</span> article{order.items.length > 1 ? 's' : ''}
          {order.total && (
            <span className="ml-2 font-semibold text-slate-800">
              {formatPrice(order.total)}
            </span>
          )}
        </div>

        {/* Actions */}
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
      </CardContent>
    </Card>
  );
}