import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, FolderOpen, Search, Pencil, ChevronUp, ChevronDown, Phone, Calendar } from 'lucide-react';
import { useUpdateList } from '@/hooks/useLists';
import { Order } from '@/types/order';
import { List, ListParticipant } from '@/types/list';
import toast from 'react-hot-toast';

interface EditListModalProps {
  isOpen: boolean;
  onClose: () => void;
  list: List | null;
  orders: Order[];
}

interface ParticipantState {
  contractId: string;
  role: string;
  order: number;
}

export function EditListModal({ isOpen, onClose, list, orders }: EditListModalProps) {
  const [listName, setListName] = useState('');
  const [telephone, setTelephone] = useState('');
  const [dateEvenement, setDateEvenement] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [participants, setParticipants] = useState<ParticipantState[]>([]);
  const updateListMutation = useUpdateList();

  // Calculer la date d'événement la plus commune à partir des commandes
  const suggestedEventDate = useMemo(() => {
    if (participants.length === 0) return null;

    const dates: Record<string, number> = {};
    participants.forEach(p => {
      const order = orders.find(o => o.id === p.contractId);
      if (order?.dateLivraison) {
        const dateStr = new Date(order.dateLivraison).toISOString().split('T')[0];
        dates[dateStr] = (dates[dateStr] || 0) + 1;
      }
    });

    // Trouver la date la plus fréquente
    let maxCount = 0;
    let mostCommonDate: string | null = null;
    Object.entries(dates).forEach(([date, count]) => {
      if (count > maxCount) {
        maxCount = count;
        mostCommonDate = date;
      }
    });

    return mostCommonDate;
  }, [participants, orders]);

  // Initialiser le formulaire quand la modale s'ouvre ou quand la liste change
  useEffect(() => {
    if (isOpen && list) {
      setListName(list.name);
      setTelephone(list.telephone || '');
      setDateEvenement(list.dateEvenement ? new Date(list.dateEvenement).toISOString().split('T')[0] : '');
      setSearchQuery('');

      // Initialiser les participants à partir de la liste existante
      if (list.participants && list.participants.length > 0) {
        setParticipants(
          list.participants.map(p => ({
            contractId: p.contractId,
            role: p.role || '',
            order: p.order
          }))
        );
      } else {
        // Fallback: créer des participants à partir de contractIds
        setParticipants(
          (list.contractIds || []).map((id, index) => ({
            contractId: id,
            role: '',
            order: index + 1
          }))
        );
      }
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

  // Filtrer les commandes par recherche (exclure celles déjà sélectionnées)
  const selectedIds = new Set(participants.map(p => p.contractId));

  const filteredOrders = useMemo(() => {
    const availableOrders = orders.filter(order => !selectedIds.has(order.id));
    if (!searchQuery.trim()) return availableOrders;
    const query = searchQuery.toLowerCase().trim();
    return availableOrders.filter(order =>
      order.client.nom.toLowerCase().includes(query) ||
      order.client.prenom.toLowerCase().includes(query) ||
      order.numero?.toLowerCase().includes(query) ||
      order.client.telephone?.toLowerCase().includes(query)
    );
  }, [orders, searchQuery, selectedIds]);

  // Ajouter une commande à la liste
  const addParticipant = (orderId: string) => {
    const nextOrder = participants.length + 1;
    setParticipants([...participants, { contractId: orderId, role: '', order: nextOrder }]);
  };

  // Retirer une commande de la liste
  const removeParticipant = (contractId: string) => {
    const newParticipants = participants
      .filter(p => p.contractId !== contractId)
      .map((p, index) => ({ ...p, order: index + 1 }));
    setParticipants(newParticipants);
  };

  // Mettre à jour le rôle d'un participant
  const updateRole = (contractId: string, role: string) => {
    setParticipants(participants.map(p =>
      p.contractId === contractId ? { ...p, role } : p
    ));
  };

  // Déplacer un participant vers le haut
  const moveUp = (index: number) => {
    if (index === 0) return;
    const newParticipants = [...participants];
    [newParticipants[index - 1], newParticipants[index]] = [newParticipants[index], newParticipants[index - 1]];
    setParticipants(newParticipants.map((p, i) => ({ ...p, order: i + 1 })));
  };

  // Déplacer un participant vers le bas
  const moveDown = (index: number) => {
    if (index === participants.length - 1) return;
    const newParticipants = [...participants];
    [newParticipants[index], newParticipants[index + 1]] = [newParticipants[index + 1], newParticipants[index]];
    setParticipants(newParticipants.map((p, i) => ({ ...p, order: i + 1 })));
  };

  // Récupérer les infos d'une commande par ID
  const getOrderById = (contractId: string): Order | undefined => {
    return orders.find(o => o.id === contractId);
  };

  // Utiliser la date suggérée
  const useSuggestedDate = () => {
    if (suggestedEventDate) {
      setDateEvenement(suggestedEventDate);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!listName.trim() || !list) return;

    try {
      // Mettre à jour la liste avec tous les champs
      await updateListMutation.mutateAsync({
        id: list._id,
        data: {
          name: listName.trim(),
          telephone: telephone.trim() || undefined,
          dateEvenement: dateEvenement || undefined,
          participants: participants.map(p => ({
            contractId: p.contractId,
            role: p.role,
            order: p.order
          }))
        }
      });

      onClose();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error('Erreur lors de la mise à jour de la liste');
    }
  };

  if (!isOpen || !list) return null;

  const isLoading = updateListMutation.isPending;

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

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
          {/* Header avec nom de liste mis en évidence */}
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-t-2xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Pencil className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <div className="text-amber-100 text-sm font-medium">Liste #{list.numero}</div>
                  <h2 className="text-2xl font-bold text-white">{list.name}</h2>
                </div>
              </div>
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                className="h-10 w-10 p-0 text-white/80 hover:text-white hover:bg-white/20"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-6">
              {/* Informations principales */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Nom de la liste */}
                <div>
                  <label htmlFor="editListName" className="block text-sm font-medium text-gray-700 mb-2 text-left">
                    Nom de la liste
                  </label>
                  <Input
                    id="editListName"
                    placeholder="Ex: Mariage Dupont..."
                    value={listName}
                    onChange={(e) => setListName(e.target.value)}
                    className="w-full text-lg font-semibold"
                    autoFocus
                  />
                </div>

                {/* Téléphone */}
                <div>
                  <label htmlFor="editTelephone" className="block text-sm font-medium text-gray-700 mb-2 text-left">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Téléphone de contact
                  </label>
                  <Input
                    id="editTelephone"
                    type="tel"
                    placeholder="Ex: 06 12 34 56 78"
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    className="w-full"
                  />
                </div>

                {/* Date d'événement */}
                <div>
                  <label htmlFor="editDateEvenement" className="block text-sm font-medium text-gray-700 mb-2 text-left">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Date
                  </label>
                  <Input
                    id="editDateEvenement"
                    type="date"
                    value={dateEvenement}
                    onChange={(e) => setDateEvenement(e.target.value)}
                    className="w-32"
                  />
                </div>
              </div>

              {/* Participants actuels */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                  Participants ({participants.length})
                </label>

                {participants.length === 0 ? (
                  <div className="border border-dashed border-gray-300 rounded-xl p-6 text-center text-gray-500 text-sm">
                    <FolderOpen className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                    Aucun participant. Ajoutez des commandes ci-dessous.
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-xl overflow-hidden max-h-64 overflow-y-auto">
                    <div className="divide-y divide-gray-100">
                      {participants.map((participant, index) => {
                        const order = getOrderById(participant.contractId);
                        if (!order) return null;

                        return (
                          <div
                            key={participant.contractId}
                            className="flex items-center gap-3 p-3 bg-white hover:bg-gray-50 transition-colors"
                          >
                            {/* Numéro d'ordre */}
                            <span className="w-7 h-7 flex-shrink-0 rounded-full bg-amber-100 text-amber-700 text-sm font-bold flex items-center justify-center">
                              {participant.order}
                            </span>

                            {/* Boutons de réorganisation */}
                            <div className="flex flex-col gap-0.5">
                              <button
                                type="button"
                                onClick={() => moveUp(index)}
                                disabled={index === 0}
                                className={`p-0.5 rounded transition-colors ${
                                  index === 0
                                    ? 'text-gray-300 cursor-not-allowed'
                                    : 'text-gray-400 hover:text-amber-600 hover:bg-amber-50'
                                }`}
                              >
                                <ChevronUp className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => moveDown(index)}
                                disabled={index === participants.length - 1}
                                className={`p-0.5 rounded transition-colors ${
                                  index === participants.length - 1
                                    ? 'text-gray-300 cursor-not-allowed'
                                    : 'text-gray-400 hover:text-amber-600 hover:bg-amber-50'
                                }`}
                              >
                                <ChevronDown className="w-4 h-4" />
                              </button>
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
                            </div>

                            {/* Champ rôle */}
                            <Input
                              placeholder="Rôle (ex: Marié)"
                              value={participant.role}
                              onChange={(e) => updateRole(participant.contractId, e.target.value)}
                              className="w-40 text-sm h-8"
                            />

                            {/* Bouton supprimer */}
                            <button
                              type="button"
                              onClick={() => removeParticipant(participant.contractId)}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Ajouter des commandes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                  Ajouter des commandes
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

                {/* Liste des commandes disponibles */}
                <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-xl">
                  {filteredOrders.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      {searchQuery ? 'Aucune commande trouvée' : 'Toutes les commandes sont déjà dans la liste'}
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {filteredOrders.map((order) => (
                        <button
                          key={order.id}
                          type="button"
                          onClick={() => addParticipant(order.id)}
                          className="w-full flex items-center gap-3 p-3 text-left transition-colors hover:bg-amber-50"
                        >
                          {/* Icône d'ajout */}
                          <div className="w-5 h-5 rounded border-2 border-dashed border-gray-300 flex items-center justify-center flex-shrink-0 text-gray-400">
                            +
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
                      ))}
                    </div>
                  )}
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
