import React, { useMemo } from 'react';
import { OrdersList } from '../components/home/OrdersList';
import { Order } from '@/types/order';
import { useOrders, useDeleteOrder } from '@/hooks/useOrders';

interface HomeProps {
  onCreateNew: () => void;
  onViewOrder: (order: Order) => void;
  onEditOrder: (order: Order) => void;
}

export function Home({ onCreateNew, onViewOrder, onEditOrder }: HomeProps) {
  const { data: ordersData, isLoading, error } = useOrders();
  const deleteOrderMutation = useDeleteOrder();

  const orders = ordersData?.orders || [];

  const handleDeleteOrder = (orderId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) {
      deleteOrderMutation.mutate(orderId);
    }
  };
  
  // Statistiques rapides
  const stats = useMemo(() => {
    const total = orders.length;
    const commandees = orders.filter(o => o.status === 'commandee').length;
    const livrees = orders.filter(o => o.status === 'livree').length;
    const rendues = orders.filter(o => o.status === 'rendue').length;
    
    return { total, commandees, livrees, rendues };
  }, [orders]);

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
      <div className="pt-4 sm:pt-16 mx-4 mb-6 sm:mb-8">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-start">Gestion des commandes</h1>
          <span className="hidden sm:inline text-sm sm:text-lg text-gray-600 font-medium">{orders.length} commande{orders.length > 1 ? 's' : ''}</span>
        </div>
        <p className="text-gray-600 text-xs sm:text-sm text-start">Consultez, modifiez et gérez toutes vos commandes de cérémonie</p>
      </div>
  
      {/* Liste des commandes avec recherche intégrée */}
      <OrdersList
        orders={orders}
        onView={onViewOrder}
        onEdit={onEditOrder}
        onDelete={handleDeleteOrder}
        onCreateNew={onCreateNew}
      />
    </div>
  );
}