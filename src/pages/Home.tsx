import React, { useMemo } from 'react';
import { OrdersList } from '../components/home/OrdersList';
import { Order } from '@/types/order';

interface HomeProps {
  orders: Order[];
  onCreateNew: () => void;
  onViewOrder: (order: Order) => void;
  onEditOrder: (order: Order) => void;
  onDeleteOrder: (orderId: string) => void;
}

export function Home({ orders, onCreateNew, onViewOrder, onEditOrder, onDeleteOrder }: HomeProps) {
  
  // Statistiques rapides
  const stats = useMemo(() => {
    const total = orders.length;
    const brouillons = orders.filter(o => o.status === 'brouillon').length;
    const enProduction = orders.filter(o => o.status === 'en_production').length;
    const pretes = orders.filter(o => o.status === 'prete').length;
    
    return { total, brouillons, enProduction, pretes };
  }, [orders]);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="pt-16 flex justify-between items-center ml-4 mr-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 text-start">Gestion des commandes</h1>
        <span className="text-lg text-gray-600 font-medium">{orders.length} commande{orders.length > 1 ? 's' : ''}</span>
      </div>
  
      {/* Liste des commandes avec recherche intégrée */}
      <OrdersList
        orders={orders}
        onView={onViewOrder}
        onEdit={onEditOrder}
        onDelete={onDeleteOrder}
        onCreateNew={onCreateNew}
      />
    </div>
  );
}