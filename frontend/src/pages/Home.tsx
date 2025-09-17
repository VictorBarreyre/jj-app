import React, { useMemo, useState } from 'react';
import { OrdersList } from '../components/home/OrdersList';
import { OrderViewEditModal } from '../components/orders/OrderViewEditModal';
import { Order } from '@/types/order';
import { useOrders, useUpdateOrder } from '@/hooks/useOrders';
import { Button } from '@/components/ui/button';
import { User, Users, Plus } from 'lucide-react';
import { rentalContractApi } from '@/services/rental-contract.api';
import { useQueryClient } from '@tanstack/react-query';

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
  const updateOrderMutation = useUpdateOrder();
  const queryClient = useQueryClient();
  const [activeType, setActiveType] = useState<OrderType>('individuel');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const orders = ordersData?.orders || [];


  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
    setIsEditing(false);
  };

  const handleEditOrder = (order: Order) => {
    // Appeler la fonction fournie par App.tsx pour naviguer vers le formulaire en mode édition
    onEditOrder(order);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
    setIsEditing(false);
  };

  const handleStartEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveOrder = async (updatedOrder: Partial<Order>) => {
    if (!selectedOrder) return;
    
    try {
      await updateOrderMutation.mutateAsync({
        id: selectedOrder.id,
        data: updatedOrder
      });
      setIsEditing(false);
      // La commande sera automatiquement mise à jour grâce à la réactualisation de la query
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      throw error;
    }
  };

  const handleUpdateParticipantReturn = async (orderId: string, participantIndex: number, returned: boolean) => {
    try {
      await rentalContractApi.updateParticipantReturn(orderId, participantIndex, returned);
      // Invalider et refetch les données des commandes
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut de rendu:', error);
      throw error;
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
      <div className="pt-2 sm:pt-16">
        {/* Bloc principal avec titre et contenu */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* En-tête avec titre et bouton - maintenant dans le bloc */}
          <div className="flex justify-between items-start p-6 sm:p-8 border-b border-gray-200">
            <div className="text-left flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight text-left">Gestion des commandes</h1>
              <p className="text-gray-600 text-sm sm:text-sm mt-1 leading-relaxed">Consultez, modifiez et gérez toutes vos commandes de cérémonie</p>
            </div>
            <div className="ml-4">
              <Button 
                onClick={onCreateNew}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold px-3 py-2 sm:px-6 sm:py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center w-12 sm:w-auto text-lg sm:text-base min-h-[48px] sm:min-h-0 sm:gap-3"
              >
                <Plus className="w-5 h-5 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline ml-0 sm:ml-0">Nouvelle commande</span>
              </Button>
            </div>
          </div>

          {/* Onglets par type */}
          <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto px-4 sm:px-6 scrollbar-hide" aria-label="Tabs">
            <div className="flex space-x-6 sm:space-x-8 min-w-max">
              {typeTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTypeChange(tab.id)}
                  className={`
                    flex items-center gap-2 py-3 sm:py-4 px-2 sm:px-1 border-b-2 font-semibold text-base sm:text-sm transition-colors duration-200 whitespace-nowrap
                    ${activeType === tab.id
                      ? 'border-amber-500 text-amber-600 bg-amber-50/50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <span className="w-4 h-4 sm:w-5 sm:h-5">{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.id === 'individuel' ? 'Individuelles' : 'Groupes'}</span>
                  <span className={`
                    ml-1 sm:ml-2 py-0.5 px-1.5 sm:px-2 rounded-full text-sm sm:text-xs font-bold
                    ${activeType === tab.id
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-gray-100 text-gray-600'
                    }
                  `}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </nav>
        </div>

          {/* Liste des commandes */}
          <OrdersList
            orders={filteredOrders}
            onView={handleViewOrder}
            onEdit={handleEditOrder}
            onCreateNew={onCreateNew}
            hideHeader={true}
            activeType={activeType}
          />
        </div>
      </div>

      {/* Modal de visualisation/édition */}
      <OrderViewEditModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        order={selectedOrder}
        isEditing={isEditing}
        onEdit={handleStartEdit}
        onSave={handleSaveOrder}
        onCancel={handleCancelEdit}
        onEditOrder={onEditOrder}
        onUpdateParticipantReturn={handleUpdateParticipantReturn}
      />
    </div>
  );
}