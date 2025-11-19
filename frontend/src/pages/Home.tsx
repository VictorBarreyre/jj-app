import React, { useMemo, useState } from 'react';
import { OrdersList } from '../components/home/OrdersList';
import { OrderViewEditModal } from '../components/orders/OrderViewEditModal';
import { Order } from '@/types/order';
import { useOrders, useUpdateOrder, useDeleteOrder } from '@/hooks/useOrders';
import { Button } from '@/components/ui/button';
import { User, Users, Plus } from 'lucide-react';
import { rentalContractApi } from '@/services/rental-contract.api';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

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
  const [page, setPage] = useState(1);
  const { data: ordersData, isLoading, error } = useOrders({ page, limit: 20 });
  const updateOrderMutation = useUpdateOrder();
  const deleteOrderMutation = useDeleteOrder();
  const queryClient = useQueryClient();
  const [activeType, setActiveType] = useState<OrderType>('individuel');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [allOrders, setAllOrders] = useState<Order[]>([]);

  const orders = allOrders;

  // Mettre à jour allOrders quand de nouvelles données arrivent
  React.useEffect(() => {
    if (ordersData?.orders) {
      if (page === 1) {
        setAllOrders(ordersData.orders);
      } else {
        // Éviter les doublons lors de la concaténation
        setAllOrders(prev => {
          const existingIds = new Set(prev.map(o => o.id));
          const newOrders = ordersData.orders.filter(order => !existingIds.has(order.id));
          return [...prev, ...newOrders];
        });
      }
    }
  }, [ordersData, page]);

  const handleLoadMore = () => {
    if (ordersData && ordersData.page < ordersData.totalPages) {
      setPage(prev => prev + 1);
    }
  };

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

  const handleDeleteOrder = async (orderId: string) => {
    try {
      await deleteOrderMutation.mutateAsync(orderId);
      toast.success('Bon de commande supprimé avec succès');
      handleCloseModal();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression du bon de commande');
      throw error;
    }
  };

  const handleUpdateParticipantReturn = async (orderId: string, participantIndex: number, returned: boolean) => {
    try {
      console.log('Mise à jour statut participant:', { orderId, participantIndex, returned });

      // Mise à jour optimiste de selectedOrder pour un retour visuel immédiat
      if (selectedOrder && selectedOrder.id === orderId) {
        if (selectedOrder.type === 'groupe' && selectedOrder.groupDetails?.participants) {
          const updatedParticipants = selectedOrder.groupDetails.participants.map((p, idx) =>
            idx === participantIndex ? { ...p, rendu: returned } : p
          );
          // Vérifier si tous les participants ont rendu
          const allReturned = updatedParticipants.every(p => p.rendu);
          const newStatus = allReturned ? 'rendu' : 'livree';

          const updatedOrder = {
            ...selectedOrder,
            groupDetails: {
              ...selectedOrder.groupDetails,
              participants: updatedParticipants
            },
            status: newStatus
          };
          setSelectedOrder(updatedOrder);
        } else if (selectedOrder.type === 'individuel' && participantIndex === 0) {
          const newStatus = returned ? 'rendu' : 'livree';
          setSelectedOrder({
            ...selectedOrder,
            rendu: returned,
            status: newStatus
          });
        }
      }

      // Récupérer le contrat actuel
      const contract = await rentalContractApi.getById(orderId);
      console.log('Contrat récupéré:', contract);

      // Pour les commandes de groupe avec des participants réels
      if (contract.type === 'groupe' && contract.groupDetails && contract.groupDetails.participants && contract.groupDetails.participants[participantIndex]) {
        console.log('Participant de groupe trouvé, mise à jour...');
        contract.groupDetails.participants[participantIndex].rendu = returned;

        // Vérifier si tous les participants ont rendu leurs articles
        const allReturned = contract.groupDetails.participants.every(p => p.rendu);
        const newStatus = allReturned ? 'rendu' : 'livree';

        // Sauvegarder via l'endpoint de mise à jour général
        const updateData = {
          groupDetails: contract.groupDetails,
          status: newStatus
        };
        console.log('Données à envoyer pour groupe:', updateData);

        await rentalContractApi.update(orderId, updateData);
        console.log('Mise à jour groupe réussie, nouveau statut:', newStatus);

        // Mettre à jour selectedOrder pour forcer le rafraîchissement de la modale
        if (selectedOrder && selectedOrder.id === orderId && selectedOrder.groupDetails?.participants) {
          const updatedOrder = {
            ...selectedOrder,
            groupDetails: {
              ...selectedOrder.groupDetails,
              participants: selectedOrder.groupDetails.participants.map((p, idx) =>
                idx === participantIndex ? { ...p, rendu: returned } : p
              )
            },
            status: newStatus
          };
          setSelectedOrder(updatedOrder);
          console.log('selectedOrder mis à jour pour participant groupe:', participantIndex, 'rendu:', returned, 'status:', newStatus);
        }

        // Invalider et refetch les données des commandes
        queryClient.invalidateQueries({ queryKey: ['orders'] });

        // Afficher un message de succès
        toast.success(`Statut de rendu mis à jour pour ${contract.groupDetails.participants[participantIndex].nom}`);
      }
      // Pour les commandes individuelles (participant virtuel)
      else if (contract.type === 'individuel' && participantIndex === 0) {
        console.log('Commande individuelle, mise à jour du statut général...');

        // Pour les commandes individuelles: si rendu = true, status = 'rendu', sinon 'livree'
        const newStatus = returned ? 'rendu' : 'livree';

        // Mettre à jour le statut de rendu ET le status de la commande
        await rentalContractApi.update(orderId, {
          rendu: returned,
          status: newStatus
        });
        console.log('Mise à jour individuelle réussie, nouveau statut:', newStatus);

        // Mettre à jour selectedOrder pour forcer le rafraîchissement de la modale
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({
            ...selectedOrder,
            rendu: returned,
            status: newStatus
          });
          console.log('selectedOrder mis à jour avec rendu:', returned, 'status:', newStatus);
        }

        // Invalider et refetch les données des commandes
        queryClient.invalidateQueries({ queryKey: ['orders'] });

        // Afficher un message de succès
        toast.success(`Statut de rendu mis à jour pour ${contract.client.nom}`);
      }
      else {
        console.error('Configuration non supportée:', { 
          contractType: contract.type,
          hasGroupDetails: !!contract.groupDetails,
          hasParticipants: !!(contract.groupDetails?.participants),
          participantCount: contract.groupDetails?.participants?.length,
          requestedIndex: participantIndex
        });
        toast.error('Configuration de participant non supportée');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut de rendu:', error);
      toast.error('Erreur lors de la mise à jour du statut de rendu');
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
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 leading-tight text-left">Commandes</h1>
              <p className="text-gray-600 text-sm sm:text-sm mt-1 leading-tight sm:leading-relaxed">Gestion des commandes</p>
            </div>
            <div className="ml-4">
              <Button 
                onClick={onCreateNew}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold px-2 py-1 sm:px-6 sm:py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center w-10 sm:w-auto text-lg sm:text-base min-h-[40px] sm:min-h-0 sm:gap-3"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
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
                    flex items-center gap-2 py-3 sm:py-4 px-2 sm:px-1 border-b-2 font-semibold text-xs sm:text-sm transition-colors duration-200 whitespace-nowrap
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

          {/* Bouton Voir plus */}
          {ordersData && ordersData.page < ordersData.totalPages && (
            <div className="p-6 border-t border-gray-200 flex justify-center">
              <Button
                onClick={handleLoadMore}
                disabled={isLoading}
                variant="outline"
                className="px-6 py-3 text-amber-600 border-amber-300 hover:bg-amber-50 hover:border-amber-400 rounded-xl transition-all shadow-sm"
              >
                {isLoading ? 'Chargement...' : 'Voir plus de commandes'}
              </Button>
            </div>
          )}
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
        onDelete={handleDeleteOrder}
      />
    </div>
  );
}