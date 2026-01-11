import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { contractsAPI } from '@/services/api';
import { RentalContract, PaymentMethod } from '@/types/rental-contract';
import { Order } from '@/types/order';
import {
  Calendar,
  Euro,
  CreditCard,
  Banknote,
  Building2,
  Receipt,
  ChevronLeft,
  ChevronRight,
  Users,
  User,
  Phone,
  Package,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { OrderViewEditModal } from '@/components/orders/OrderViewEditModal';
import { useUpdateOrder, useDeleteOrder } from '@/hooks/useOrders';
import { rentalContractApi } from '@/services/rental-contract.api';
import toast from 'react-hot-toast';

interface DailyRevenuePageProps {
  onBack?: () => void;
  onEditOrder?: (order: Order) => void;
}

interface PaymentSummary {
  total: number;
  especes: number;
  carte: number;
  virement: number;
  cheque: number;
  count: number;
}

export function DailyRevenuePage({ onBack, onEditOrder }: DailyRevenuePageProps) {
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  // State pour la modal de visualisation
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Hooks pour les mutations
  const updateOrderMutation = useUpdateOrder();
  const deleteOrderMutation = useDeleteOrder();
  const queryClient = useQueryClient();

  // Calculer les dates de début et fin pour le jour sélectionné
  const dateStart = `${selectedDate}T00:00:00.000Z`;
  const dateEnd = `${selectedDate}T23:59:59.999Z`;

  // Fetch contracts for the selected day
  const { data: contractsData, isLoading } = useQuery({
    queryKey: ['daily-revenue', selectedDate],
    queryFn: async () => {
      const response = await contractsAPI.getAll({
        dateStart,
        dateEnd,
        limit: 100
      });
      return response;
    }
  });

  // Calculer les recettes
  const revenueSummary = useMemo(() => {
    if (!contractsData?.contracts) {
      return {
        arrhes: { total: 0, especes: 0, carte: 0, virement: 0, cheque: 0, count: 0 },
        solde: { total: 0, especes: 0, carte: 0, virement: 0, cheque: 0, count: 0 },
        depotGarantie: { total: 0, especes: 0, carte: 0, virement: 0, cheque: 0, count: 0 },
        grandTotal: 0
      };
    }

    const arrhes: PaymentSummary = { total: 0, especes: 0, carte: 0, virement: 0, cheque: 0, count: 0 };
    const solde: PaymentSummary = { total: 0, especes: 0, carte: 0, virement: 0, cheque: 0, count: 0 };
    const depotGarantie: PaymentSummary = { total: 0, especes: 0, carte: 0, virement: 0, cheque: 0, count: 0 };

    contractsData.contracts.forEach((contract: RentalContract) => {
      // Arrhes
      if (contract.paiementArrhes?.amount && contract.paiementArrhes?.method) {
        const paymentDate = contract.paiementArrhes.date ? new Date(contract.paiementArrhes.date).toISOString().split('T')[0] : null;
        if (paymentDate === selectedDate) {
          arrhes.total += contract.paiementArrhes.amount;
          arrhes.count++;
          const method = contract.paiementArrhes.method as PaymentMethod;
          if (method === 'especes') arrhes.especes += contract.paiementArrhes.amount;
          else if (method === 'carte') arrhes.carte += contract.paiementArrhes.amount;
          else if (method === 'virement') arrhes.virement += contract.paiementArrhes.amount;
          else if (method === 'cheque') arrhes.cheque += contract.paiementArrhes.amount;
        }
      }

      // Solde
      if (contract.paiementSolde?.amount && contract.paiementSolde?.method) {
        const paymentDate = contract.paiementSolde.date ? new Date(contract.paiementSolde.date).toISOString().split('T')[0] : null;
        if (paymentDate === selectedDate) {
          solde.total += contract.paiementSolde.amount;
          solde.count++;
          const method = contract.paiementSolde.method as PaymentMethod;
          if (method === 'especes') solde.especes += contract.paiementSolde.amount;
          else if (method === 'carte') solde.carte += contract.paiementSolde.amount;
          else if (method === 'virement') solde.virement += contract.paiementSolde.amount;
          else if (method === 'cheque') solde.cheque += contract.paiementSolde.amount;
        }
      }

      // Dépôt de garantie
      if (contract.paiementDepotGarantie?.amount && contract.paiementDepotGarantie?.method) {
        const paymentDate = contract.paiementDepotGarantie.date ? new Date(contract.paiementDepotGarantie.date).toISOString().split('T')[0] : null;
        if (paymentDate === selectedDate) {
          depotGarantie.total += contract.paiementDepotGarantie.amount;
          depotGarantie.count++;
          const method = contract.paiementDepotGarantie.method as PaymentMethod;
          if (method === 'especes') depotGarantie.especes += contract.paiementDepotGarantie.amount;
          else if (method === 'carte') depotGarantie.carte += contract.paiementDepotGarantie.amount;
          else if (method === 'virement') depotGarantie.virement += contract.paiementDepotGarantie.amount;
          else if (method === 'cheque') depotGarantie.cheque += contract.paiementDepotGarantie.amount;
        }
      }
    });

    return {
      arrhes,
      solde,
      depotGarantie,
      grandTotal: arrhes.total + solde.total + depotGarantie.total
    };
  }, [contractsData, selectedDate]);

  // Liste des commandes avec leurs paiements du jour (groupés)
  const ordersWithPayments = useMemo(() => {
    if (!contractsData?.contracts) return [];

    interface PaymentInfo {
      type: 'arrhes' | 'solde' | 'depot';
      amount: number;
      method: PaymentMethod;
    }

    interface OrderWithPayments {
      id: string;
      numero: string;
      client: {
        nom: string;
        prenom?: string;
        telephone?: string;
      };
      dateEvenement?: string;
      status: string;
      articleCount: number;
      total?: number;
      isGroup: boolean;
      payments: PaymentInfo[];
      totalPaymentsToday: number;
    }

    const ordersList: OrderWithPayments[] = [];

    contractsData.contracts.forEach((contract: RentalContract) => {
      const paymentsForContract: PaymentInfo[] = [];

      // Arrhes
      if (contract.paiementArrhes?.amount && contract.paiementArrhes?.method) {
        const paymentDate = contract.paiementArrhes.date ? new Date(contract.paiementArrhes.date).toISOString().split('T')[0] : null;
        if (paymentDate === selectedDate) {
          paymentsForContract.push({
            type: 'arrhes',
            amount: contract.paiementArrhes.amount,
            method: contract.paiementArrhes.method as PaymentMethod
          });
        }
      }

      // Solde
      if (contract.paiementSolde?.amount && contract.paiementSolde?.method) {
        const paymentDate = contract.paiementSolde.date ? new Date(contract.paiementSolde.date).toISOString().split('T')[0] : null;
        if (paymentDate === selectedDate) {
          paymentsForContract.push({
            type: 'solde',
            amount: contract.paiementSolde.amount,
            method: contract.paiementSolde.method as PaymentMethod
          });
        }
      }

      // Depot de garantie
      if (contract.paiementDepotGarantie?.amount && contract.paiementDepotGarantie?.method) {
        const paymentDate = contract.paiementDepotGarantie.date ? new Date(contract.paiementDepotGarantie.date).toISOString().split('T')[0] : null;
        if (paymentDate === selectedDate) {
          paymentsForContract.push({
            type: 'depot',
            amount: contract.paiementDepotGarantie.amount,
            method: contract.paiementDepotGarantie.method as PaymentMethod
          });
        }
      }

      // Ajouter la commande si elle a des paiements ce jour
      if (paymentsForContract.length > 0) {
        // Calculer le nombre d'articles
        let articleCount = 0;
        if (contract.articlesStock?.length > 0) {
          articleCount = contract.articlesStock.reduce((sum: number, item: any) => sum + (item.quantiteReservee || 1), 0);
        } else if (contract.tenue) {
          if (contract.tenue.veste) articleCount++;
          if (contract.tenue.gilet) articleCount++;
          if (contract.tenue.pantalon) articleCount++;
          if (contract.tenue.tailleChapeau) articleCount++;
          if (contract.tenue.tailleChaussures) articleCount++;
        }

        ordersList.push({
          id: contract._id,
          numero: contract.numero,
          client: {
            nom: contract.client?.nom || 'Client inconnu',
            prenom: contract.client?.prenom,
            telephone: contract.client?.telephone
          },
          dateEvenement: contract.dateEvenement,
          status: contract.status === 'brouillon' ? 'brouillon' : contract.rendu ? 'rendue' : 'livree',
          articleCount,
          total: contract.tarifLocation,
          isGroup: contract.isGroup || false,
          payments: paymentsForContract,
          totalPaymentsToday: paymentsForContract.reduce((sum, p) => sum + p.amount, 0)
        });
      }
    });

    return ordersList;
  }, [contractsData, selectedDate]);

  // Nombre total de paiements (pour le compteur)
  const totalPaymentsCount = useMemo(() => {
    return ordersWithPayments.reduce((sum, order) => sum + order.payments.length, 0);
  }, [ordersWithPayments]);

  // Navigation entre les jours
  const goToPreviousDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() - 1);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const goToNextDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + 1);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const goToToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  // Formater la date pour l'affichage
  const formatDisplayDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  // Formater le montant
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  // Icône pour le mode de paiement
  const PaymentMethodIcon = ({ method }: { method: PaymentMethod }) => {
    switch (method) {
      case 'carte':
        return <CreditCard className="w-4 h-4" />;
      case 'especes':
        return <Banknote className="w-4 h-4" />;
      case 'virement':
        return <Building2 className="w-4 h-4" />;
      case 'cheque':
        return <Receipt className="w-4 h-4" />;
      default:
        return <Euro className="w-4 h-4" />;
    }
  };

  // Label pour le type de paiement
  const getPaymentTypeLabel = (type: 'arrhes' | 'solde' | 'depot') => {
    switch (type) {
      case 'arrhes': return 'Arrhes';
      case 'solde': return 'Solde';
      case 'depot': return 'Depot garantie';
    }
  };

  // Couleur pour le type de paiement
  const getPaymentTypeColor = (type: 'arrhes' | 'solde' | 'depot') => {
    switch (type) {
      case 'arrhes': return 'bg-blue-100 text-blue-700';
      case 'solde': return 'bg-green-100 text-green-700';
      case 'depot': return 'bg-purple-100 text-purple-700';
    }
  };

  // Handlers pour la modal de visualisation
  const handleViewOrder = async (orderId: string) => {
    try {
      // Récupérer le contrat complet depuis l'API
      const contract = await rentalContractApi.getById(orderId);

      // Convertir en Order pour la modal
      const order: Order = {
        id: contract._id || contract.id,
        numero: contract.numero,
        client: {
          nom: contract.client?.nom || '',
          prenom: contract.client?.prenom || '',
          telephone: contract.client?.telephone || '',
          email: contract.client?.email || '',
          adresse: contract.client?.adresse || {}
        },
        dateCreation: contract.dateCreation,
        dateLivraison: contract.dateEvenement,
        dateRetrait: contract.dateRetrait,
        dateRetour: contract.dateRetour,
        items: [],
        articleCount: 0,
        status: contract.status === 'brouillon' ? 'brouillon' : contract.rendu ? 'rendue' : 'livree',
        type: contract.type || 'individuel',
        notes: contract.notes,
        createdBy: contract.vendeur || 'N/A',
        tarifLocation: contract.tarifLocation,
        depotGarantie: contract.depotGarantie,
        arrhes: contract.arrhes,
        paiementArrhes: contract.paiementArrhes,
        paiementSolde: contract.paiementSolde,
        paiementDepotGarantie: contract.paiementDepotGarantie,
        groupDetails: contract.groupDetails,
        tenue: contract.tenue,
        total: contract.tarifLocation,
        rendu: contract.rendu
      };

      setSelectedOrder(order);
      setIsModalOpen(true);
      setIsEditing(false);
    } catch (error) {
      console.error('Erreur lors du chargement de la commande:', error);
      toast.error('Erreur lors du chargement de la commande');
    }
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
      // Rafraîchir les données
      queryClient.invalidateQueries({ queryKey: ['daily-revenue'] });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      throw error;
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      await deleteOrderMutation.mutateAsync(orderId);
      toast.success('Bon de commande supprime avec succes');
      handleCloseModal();
      // Rafraîchir les données
      queryClient.invalidateQueries({ queryKey: ['daily-revenue'] });
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression du bon de commande');
      throw error;
    }
  };

  const handleUpdateParticipantReturn = async (orderId: string, participantIndex: number, returned: boolean) => {
    try {
      const contract = await rentalContractApi.getById(orderId);

      if (contract.type === 'groupe' && contract.groupDetails?.participants?.[participantIndex]) {
        contract.groupDetails.participants[participantIndex].rendu = returned;
        const allReturned = contract.groupDetails.participants.every((p: any) => p.rendu);
        const newStatus = allReturned ? 'rendu' : 'livree';

        await rentalContractApi.update(orderId, {
          groupDetails: contract.groupDetails,
          status: newStatus
        });
      } else if (contract.type === 'individuel' && participantIndex === 0) {
        await rentalContractApi.update(orderId, {
          rendu: returned,
          status: returned ? 'rendu' : 'livree'
        });
      }

      // Rafraîchir les données
      queryClient.invalidateQueries({ queryKey: ['daily-revenue'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error('Erreur lors de la mise a jour');
    }
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
      <div className="pt-2 sm:pt-16">
        {/* Bloc principal */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* En-tête */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 sm:p-8 border-b border-gray-200 gap-4">
            {/* Titre avec bouton Aujourd'hui sur mobile */}
            <div className="flex items-center justify-between w-full sm:w-auto">
              <div className="text-left">
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900 leading-tight">
                  Recettes du jour
                </h1>
                <p className="text-gray-600 text-sm mt-1 capitalize">
                  {formatDisplayDate(selectedDate)}
                </p>
              </div>
              {/* Bouton Aujourd'hui - Mobile uniquement */}
              {!isToday && (
                <Button
                  onClick={goToToday}
                  variant="outline"
                  className="sm:hidden border-amber-300 text-amber-600 hover:bg-amber-50"
                >
                  Aujourd'hui
                </Button>
              )}
            </div>

            {/* Navigation date */}
            <div className="flex items-center gap-2">
              <button
                onClick={goToPreviousDay}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>

              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-xl focus:border-amber-500 focus:ring-amber-500/20 focus:outline-none bg-white"
              />

              <button
                onClick={goToNextDay}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>

              {/* Bouton Aujourd'hui - Desktop uniquement */}
              {!isToday && (
                <Button
                  onClick={goToToday}
                  variant="outline"
                  className="hidden sm:inline-flex ml-2 border-amber-300 text-amber-600 hover:bg-amber-50"
                >
                  Aujourd'hui
                </Button>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-600"></div>
            </div>
          ) : (
            <div className="p-6 sm:p-8 space-y-6">
              {/* Total du jour */}
              <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <p className="text-amber-100 text-sm font-medium text-left">Total du jour</p>
                    <p className="text-3xl sm:text-4xl font-bold mt-1 text-left">{formatAmount(revenueSummary.grandTotal)}</p>
                    <p className="text-amber-100 text-sm mt-2 text-left">
                      {totalPaymentsCount} paiement{totalPaymentsCount > 1 ? 's' : ''} sur {ordersWithPayments.length} commande{ordersWithPayments.length > 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="bg-white/20 p-4 rounded-xl hidden sm:block">
                    <Euro className="w-10 h-10" />
                  </div>
                </div>
              </div>

              {/* Résumé par type */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Arrhes */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-800 text-sm text-left">
                      <span className="text-gray-500 font-normal">{revenueSummary.arrhes.count}</span> Arrhes
                    </h3>
                    <p className="text-xl font-bold text-gray-900">{formatAmount(revenueSummary.arrhes.total)}</p>
                  </div>
                  {revenueSummary.arrhes.total > 0 && (
                    <div className="mt-2 space-y-0.5 text-xs text-gray-500 text-left">
                      {revenueSummary.arrhes.especes > 0 && <p>Especes: {formatAmount(revenueSummary.arrhes.especes)}</p>}
                      {revenueSummary.arrhes.carte > 0 && <p>Carte: {formatAmount(revenueSummary.arrhes.carte)}</p>}
                      {revenueSummary.arrhes.virement > 0 && <p>Virement: {formatAmount(revenueSummary.arrhes.virement)}</p>}
                      {revenueSummary.arrhes.cheque > 0 && <p>Cheque: {formatAmount(revenueSummary.arrhes.cheque)}</p>}
                    </div>
                  )}
                </div>

                {/* Solde */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-800 text-sm text-left">
                      <span className="text-gray-500 font-normal">{revenueSummary.solde.count}</span> Solde location
                    </h3>
                    <p className="text-xl font-bold text-gray-900">{formatAmount(revenueSummary.solde.total)}</p>
                  </div>
                  {revenueSummary.solde.total > 0 && (
                    <div className="mt-2 space-y-0.5 text-xs text-gray-500 text-left">
                      {revenueSummary.solde.especes > 0 && <p>Especes: {formatAmount(revenueSummary.solde.especes)}</p>}
                      {revenueSummary.solde.carte > 0 && <p>Carte: {formatAmount(revenueSummary.solde.carte)}</p>}
                      {revenueSummary.solde.virement > 0 && <p>Virement: {formatAmount(revenueSummary.solde.virement)}</p>}
                      {revenueSummary.solde.cheque > 0 && <p>Cheque: {formatAmount(revenueSummary.solde.cheque)}</p>}
                    </div>
                  )}
                </div>

                {/* Dépôt */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-800 text-sm text-left">
                      <span className="text-gray-500 font-normal">{revenueSummary.depotGarantie.count}</span> Depot garantie
                    </h3>
                    <p className="text-xl font-bold text-gray-900">{formatAmount(revenueSummary.depotGarantie.total)}</p>
                  </div>
                  {revenueSummary.depotGarantie.total > 0 && (
                    <div className="mt-2 space-y-0.5 text-xs text-gray-500 text-left">
                      {revenueSummary.depotGarantie.especes > 0 && <p>Especes: {formatAmount(revenueSummary.depotGarantie.especes)}</p>}
                      {revenueSummary.depotGarantie.carte > 0 && <p>Carte: {formatAmount(revenueSummary.depotGarantie.carte)}</p>}
                      {revenueSummary.depotGarantie.virement > 0 && <p>Virement: {formatAmount(revenueSummary.depotGarantie.virement)}</p>}
                      {revenueSummary.depotGarantie.cheque > 0 && <p>Cheque: {formatAmount(revenueSummary.depotGarantie.cheque)}</p>}
                    </div>
                  )}
                </div>
              </div>

              {/* Répartition par mode */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-800 text-sm mb-3 text-left">Repartition par mode de paiement</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="flex items-center gap-2 p-2 bg-white rounded-lg">
                    <div className="p-1.5 bg-green-100 rounded-lg">
                      <Banknote className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Especes</p>
                      <p className="font-semibold text-gray-900 text-sm">
                        {formatAmount(revenueSummary.arrhes.especes + revenueSummary.solde.especes + revenueSummary.depotGarantie.especes)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-white rounded-lg">
                    <div className="p-1.5 bg-blue-100 rounded-lg">
                      <CreditCard className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Carte</p>
                      <p className="font-semibold text-gray-900 text-sm">
                        {formatAmount(revenueSummary.arrhes.carte + revenueSummary.solde.carte + revenueSummary.depotGarantie.carte)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-white rounded-lg">
                    <div className="p-1.5 bg-purple-100 rounded-lg">
                      <Building2 className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Virement</p>
                      <p className="font-semibold text-gray-900 text-sm">
                        {formatAmount(revenueSummary.arrhes.virement + revenueSummary.solde.virement + revenueSummary.depotGarantie.virement)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-white rounded-lg">
                    <div className="p-1.5 bg-amber-100 rounded-lg">
                      <Receipt className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Cheque</p>
                      <p className="font-semibold text-gray-900 text-sm">
                        {formatAmount(revenueSummary.arrhes.cheque + revenueSummary.solde.cheque + revenueSummary.depotGarantie.cheque)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Liste des commandes avec paiements */}
              <div>
                <h3 className="font-semibold text-gray-800 text-sm mb-3 text-left">Commandes avec paiements du jour</h3>
                {ordersWithPayments.length === 0 ? (
                  <div className="bg-gray-50 rounded-xl p-10 text-center text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Aucun paiement enregistre pour cette date</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {ordersWithPayments.map((order) => (
                      <div key={order.id} className="border border-gray-200/50 rounded-xl hover:shadow-lg transition-shadow duration-200 bg-white">
                        {/* Version desktop */}
                        <div className="hidden md:block p-4 hover:bg-gray-50/30 transition-all duration-200">
                          <div className="grid grid-cols-12 gap-4 items-center">
                            {/* Numero */}
                            <div className="col-span-2 text-left">
                              <div className="font-semibold text-amber-600 text-left">#{order.numero}</div>
                              <div className="flex items-center gap-1 mt-1">
                                {order.isGroup ? (
                                  <Users className="w-3 h-3 text-purple-600" />
                                ) : (
                                  <User className="w-3 h-3 text-gray-400" />
                                )}
                                <span className="text-xs text-gray-500">{order.isGroup ? 'Groupe' : 'Individuel'}</span>
                              </div>
                            </div>

                            {/* Client */}
                            <div className="col-span-2 flex flex-col justify-start items-start">
                              <div className="font-medium text-gray-900 w-full text-left">
                                {order.client.nom} {order.client.prenom}
                              </div>
                              {order.client.telephone && (
                                <div className="flex items-center justify-start gap-1 text-xs text-gray-600 mt-1 w-full">
                                  <Phone className="w-3 h-3 flex-shrink-0" />
                                  <span>{order.client.telephone}</span>
                                </div>
                              )}
                            </div>

                            {/* Articles */}
                            <div className="col-span-1 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Package className="w-3 h-3" />
                                <span>{order.articleCount}</span>
                              </div>
                            </div>

                            {/* Paiements du jour */}
                            <div className="col-span-4">
                              <div className="flex flex-wrap gap-2">
                                {order.payments.map((payment, idx) => (
                                  <div key={idx} className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs ${getPaymentTypeColor(payment.type)}`}>
                                    <PaymentMethodIcon method={payment.method} />
                                    <span>{getPaymentTypeLabel(payment.type)}</span>
                                    <span className="font-semibold">{formatAmount(payment.amount)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Total paiements du jour */}
                            <div className="col-span-2 text-right">
                              <p className="font-bold text-gray-900">{formatAmount(order.totalPaymentsToday)}</p>
                              {order.total && (
                                <p className="text-xs text-gray-500 mt-1">Total location: {formatAmount(order.total)}</p>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="col-span-1 flex justify-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewOrder(order.id)}
                                className="h-8 w-8 p-0 text-gray-400 hover:text-amber-600"
                                title="Voir"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Version mobile */}
                        <div className="block md:hidden p-5 hover:bg-gray-50/30 transition-colors">
                          <div className="flex justify-between items-start mb-3">
                            <div className="text-left">
                              <div className="font-bold text-base text-amber-600 text-left">#{order.numero}</div>
                              <div className="flex items-center gap-1 mt-1">
                                {order.isGroup ? (
                                  <Users className="w-3 h-3 text-purple-600" />
                                ) : (
                                  <User className="w-3 h-3 text-gray-400" />
                                )}
                                <span className="text-xs text-gray-500">{order.isGroup ? 'Groupe' : 'Individuel'}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-gray-900">{formatAmount(order.totalPaymentsToday)}</p>
                            </div>
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
                              <Package className="w-3 h-3 flex-shrink-0" />
                              <span>{order.articleCount} article{order.articleCount > 1 ? 's' : ''}</span>
                            </div>
                          </div>

                          {/* Paiements du jour - mobile */}
                          <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-200/50">
                            {order.payments.map((payment, idx) => (
                              <div key={idx} className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs ${getPaymentTypeColor(payment.type)}`}>
                                <PaymentMethodIcon method={payment.method} />
                                <span>{getPaymentTypeLabel(payment.type)}</span>
                                <span className="font-semibold">{formatAmount(payment.amount)}</span>
                              </div>
                            ))}
                          </div>

                          {/* Actions mobile */}
                          <div className="flex gap-3 pt-4 mt-3 border-t border-gray-200/50">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewOrder(order.id)}
                              className="flex-1 bg-white border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl py-3 font-medium min-h-[48px]"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              <span className="text-sm">Voir</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
