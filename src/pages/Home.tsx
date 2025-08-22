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