import React, { useMemo, useState } from 'react';
import { OrdersList } from '../components/home/OrdersList';
import { Order } from '@/types/order';
import { useOrders, useDeleteOrder } from '@/hooks/useOrders';
import { Button } from '@/components/ui/button';
import { User, Users, Plus } from 'lucide-react';

interface HomeProps {
  onCreateNew: () => void;
  onViewOrder: (order: Order) => void;
  onEditOrder: (order: Order) => void;
}

type OrderType = 'individuel' | 'groupe';

interface TypeTab {
  id: OrderType;
  label: string;
  icon: React.ReactNode;
  count: number;
}

export function Home({ onCreateNew, onViewOrder, onEditOrder }: HomeProps) {
  const { data: ordersData, isLoading, error } = useOrders();
  const deleteOrderMutation = useDeleteOrder();
  const [activeType, setActiveType] = useState<OrderType>('individuel');

  const orders = ordersData?.orders || [];

  const handleDeleteOrder = (orderId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) {
      deleteOrderMutation.mutate(orderId);
    }
  };
  
  // Statistiques rapides
  const stats = useMemo(() => {
    const individuel = orders.filter(o => o.type === 'individuel').length;
    const groupe = orders.filter(o => o.type === 'groupe').length;
    
    return { individuel, groupe };
  }, [orders]);

  // Définir les onglets avec leurs icônes
  const typeTabs: TypeTab[] = [
    {
      id: 'individuel',
      label: 'Commandes individuelles',
      icon: <User className="w-5 h-5" />,
      count: stats.individuel
    },
    {
      id: 'groupe',
      label: 'Mariages/Cérémonies',
      icon: <Users className="w-5 h-5" />,
      count: stats.groupe
    }
  ];

  // Filtrer les commandes par type actif
  const filteredOrders = useMemo(() => {
    return orders.filter(order => order.type === activeType);
  }, [orders, activeType]);

  const handleTypeChange = (type: OrderType) => {
    setActiveType(type);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
      {/* En-tête avec titre et bouton */}
      <div className="pt-4 sm:pt-16">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-left">Gestion des commandes</h1>
            <p className="text-gray-600 text-sm mt-1 text-left">Consultez, modifiez et gérez toutes vos commandes de cérémonie</p>
          </div>
          <Button 
            onClick={onCreateNew}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Nouvelle commande</span>
            <span className="sm:hidden">Nouveau</span>
          </Button>
        </div>
      </div>

      {/* Bloc onglets et liste */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Onglets par type */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {typeTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTypeChange(tab.id)}
                className={`
                  flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200
                  ${activeType === tab.id
                    ? 'border-amber-500 text-amber-600 bg-amber-50/50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {tab.icon}
                {tab.label}
                <span className={`
                  ml-2 py-0.5 px-2 rounded-full text-xs
                  ${activeType === tab.id
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-gray-100 text-gray-600'
                  }
                `}>
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Liste des commandes */}
        <OrdersList
          orders={filteredOrders}
          onView={onViewOrder}
          onEdit={onEditOrder}
          onDelete={handleDeleteOrder}
          onCreateNew={onCreateNew}
          hideHeader={true}
          activeType={activeType}
        />
      </div>
    </div>
  );
}