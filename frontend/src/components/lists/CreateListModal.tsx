import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Search, Check, Phone, Calendar } from 'lucide-react';
import { useCreateList, useAddContractToList } from '@/hooks/useLists';
import { Order } from '@/types/order';
import toast from 'react-hot-toast';

interface CreateListModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
}

export function CreateListModal({ isOpen, onClose, orders }: CreateListModalProps) {
  const [listName, setListName] = useState('');
  const [telephone, setTelephone] = useState('');
  const [dateEvenement, setDateEvenement] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set());
  const createListMutation = useCreateList();
  const addContractMutation = useAddContractToList();

  // Reset le formulaire quand la modale s'ouvre
  useEffect(() => {
    if (isOpen) {
      setListName('');
      setTelephone('');
      setDateEvenement('');
      setSearchQuery('');
      setSelectedOrderIds(new Set());
    }
  }, [isOpen]);

  // Gestion de la touche Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Filtrer les commandes par recherche
  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders;
    const query = searchQuery.toLowerCase().trim();
    return orders.filter(order =>
      order.client.nom.toLowerCase().includes(query) ||
      order.client.prenom.toLowerCase().includes(query) ||
      order.numero?.toLowerCase().includes(query) ||
      order.client.telephone?.toLowerCase().includes(query)
    );
  }, [orders, searchQuery]);

  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrderIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!listName.trim()) return;

    try {
      // Créer la liste avec tous les champs
      const newList = await createListMutation.mutateAsync({
        name: listName.trim(),
        telephone: telephone.trim() || undefined,
        dateEvenement: dateEvenement || undefined
      });

      // Ajouter les commandes sélectionnées à la liste
      if (selectedOrderIds.size > 0) {
        const addPromises = Array.from(selectedOrderIds).map(contractId =>
          addContractMutation.mutateAsync({ listId: newList._id, contractId })
        );
        await Promise.all(addPromises);
      }

      const orderCount = selectedOrderIds.size;
      if (orderCount > 0) {
        toast.success(`Liste "${listName.trim()}" créée avec ${orderCount} commande${orderCount > 1 ? 's' : ''}`);
      } else {
        toast.success(`Liste "${listName.trim()}" créée`);
      }
      onClose();
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      toast.error('Erreur lors de la création de la liste');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative w-full max-w-4xl transform rounded-2xl bg-white shadow-2xl transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-4 sm:px-8 pt-6 sm:pt-8 pb-4 sm:pb-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-2xl font-bold text-gray-900 text-left">
                Nouvelle liste
              </h2>
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-6">
              {/* Informations principales */}
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                {/* Nom de la liste */}
                <div className="md:col-span-3">
                  <label htmlFor="listName" className="block text-sm font-medium text-gray-700 mb-2 text-left">
                    Nom de la liste
                  </label>
                  <Input
                    id="listName"
                    placeholder="Ex: Mariage Dupont..."
                    value={listName}
                    onChange={(e) => setListName(e.target.value)}
                    className="w-full text-lg font-semibold"
                    autoFocus
                  />
                </div>

                {/* Téléphone */}
                <div className="md:col-span-2">
                  <label htmlFor="telephone" className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4" />
                    Téléphone
                  </label>
                  <Input
                    id="telephone"
                    type="tel"
                    placeholder="06 12 34 56 78"
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    className="w-full"
                  />
                </div>

                {/* Date d'événement */}
                <div className="md:col-span-1">
                  <label htmlFor="dateEvenement" className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4" />
                    Date
                  </label>
                  <Input
                    id="dateEvenement"
                    type="date"
                    value={dateEvenement}
                    onChange={(e) => setDateEvenement(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Sélection des commandes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                  Ajouter des commandes <span className="text-gray-400 font-normal">(optionnel)</span>
                </label>

                {/* Barre de recherche */}
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Rechercher par nom, numéro, téléphone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-gray-50 border-gray-200"
                  />
                </div>

                {/* Liste des commandes */}
                <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-xl">
                  {filteredOrders.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      {searchQuery ? 'Aucune commande trouvée' : 'Aucune commande disponible'}
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {filteredOrders.map((order) => {
                        const isSelected = selectedOrderIds.has(order.id);
                        return (
                          <button
                            key={order.id}
                            type="button"
                            onClick={() => toggleOrderSelection(order.id)}
                            className={`w-full flex items-center gap-3 p-3 text-left transition-colors hover:bg-gray-50 ${
                              isSelected ? 'bg-amber-50' : ''
                            }`}
                          >
                            {/* Checkbox */}
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                              isSelected
                                ? 'bg-amber-500 border-amber-500'
                                : 'border-gray-300 bg-white'
                            }`}>
                              {isSelected && <Check className="w-3 h-3 text-white" />}
                            </div>

                            {/* Info commande */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-amber-600 text-sm">
                                  #{order.numero}
                                </span>
                                <span className="text-gray-900 font-medium text-sm truncate">
                                  {order.client.prenom} {order.client.nom}
                                </span>
                              </div>
                              {order.client.telephone && (
                                <div className="text-xs text-gray-500 truncate">
                                  {order.client.telephone}
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Compteur de sélection */}
                {selectedOrderIds.size > 0 && (
                  <div className="mt-2 text-sm text-amber-600 font-medium text-left">
                    {selectedOrderIds.size} commande{selectedOrderIds.size > 1 ? 's' : ''} sélectionnée{selectedOrderIds.size > 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl py-3"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={!listName.trim() || createListMutation.isPending || addContractMutation.isPending}
                className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold rounded-xl py-3 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {createListMutation.isPending || addContractMutation.isPending ? 'Création...' : 'Créer la liste'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
