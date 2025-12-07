import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, FolderOpen, Search, Check, Pencil } from 'lucide-react';
import { useUpdateList, useAddContractToList, useRemoveContractFromList } from '@/hooks/useLists';
import { Order } from '@/types/order';
import { List } from '@/types/list';
import toast from 'react-hot-toast';

interface EditListModalProps {
  isOpen: boolean;
  onClose: () => void;
  list: List | null;
  orders: Order[];
}

export function EditListModal({ isOpen, onClose, list, orders }: EditListModalProps) {
  const [listName, setListName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set());
  const updateListMutation = useUpdateList();
  const addContractMutation = useAddContractToList();
  const removeContractMutation = useRemoveContractFromList();

  // Initialiser le formulaire quand la modale s'ouvre ou quand la liste change
  useEffect(() => {
    if (isOpen && list) {
      setListName(list.name);
      setSearchQuery('');
      setSelectedOrderIds(new Set(list.contractIds || []));
    }
  }, [isOpen, list]);

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
    if (!listName.trim() || !list) return;

    try {
      // Mettre à jour le nom si changé
      if (listName.trim() !== list.name) {
        await updateListMutation.mutateAsync({
          id: list._id,
          data: { name: listName.trim() }
        });
      }

      // Calculer les différences pour les commandes
      const currentIds = new Set(list.contractIds || []);
      const newIds = selectedOrderIds;

      // Commandes à ajouter
      const toAdd = Array.from(newIds).filter(id => !currentIds.has(id));
      // Commandes à retirer
      const toRemove = Array.from(currentIds).filter(id => !newIds.has(id));

      // Exécuter les ajouts
      for (const contractId of toAdd) {
        await addContractMutation.mutateAsync({ listId: list._id, contractId });
      }

      // Exécuter les retraits
      for (const contractId of toRemove) {
        await removeContractMutation.mutateAsync({ listId: list._id, contractId });
      }

      toast.success('Liste mise à jour');
      onClose();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error('Erreur lors de la mise à jour de la liste');
    }
  };

  if (!isOpen || !list) return null;

  const isLoading = updateListMutation.isPending || addContractMutation.isPending || removeContractMutation.isPending;

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
          className="relative w-full max-w-lg transform rounded-2xl bg-white shadow-2xl transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <Pencil className="w-5 h-5 text-amber-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Modifier la liste</h2>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-4">
              {/* Nom de la liste */}
              <div>
                <label htmlFor="editListName" className="block text-sm font-medium text-gray-700 mb-2 text-left">
                  Nom de la liste
                </label>
                <Input
                  id="editListName"
                  placeholder="Ex: Mariage Dupont, Cérémonie 15 juin..."
                  value={listName}
                  onChange={(e) => setListName(e.target.value)}
                  className="w-full"
                  autoFocus
                />
              </div>

              {/* Sélection des commandes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                  Commandes dans la liste
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
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-xl">
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
                <div className="mt-2 text-sm text-gray-600 text-left">
                  {selectedOrderIds.size} commande{selectedOrderIds.size > 1 ? 's' : ''} dans la liste
                </div>
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
                disabled={!listName.trim() || isLoading}
                className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold rounded-xl py-3 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {isLoading ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
