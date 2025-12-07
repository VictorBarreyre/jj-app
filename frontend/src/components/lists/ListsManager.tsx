import React, { useState, useMemo } from 'react';
import { List, ListParticipant } from '@/types/list';
import { Order } from '@/types/order';
import { useLists, useRemoveContractFromList } from '@/hooks/useLists';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Users, ChevronRight, ChevronDown, Search, Eye, Calendar, Phone } from 'lucide-react';
import { EditListModal } from './EditListModal';

interface ListsManagerProps {
  orders: Order[];
  onViewOrder: (order: Order) => void;
  onEditOrder: (order: Order) => void;
}

export function ListsManager({ orders, onViewOrder, onEditOrder }: ListsManagerProps) {
  const { data: lists = [], isLoading } = useLists();
  const removeContractMutation = useRemoveContractFromList();

  const [expandedListId, setExpandedListId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingList, setEditingList] = useState<List | null>(null);

  const handleRemoveContract = async (listId: string, contractId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await removeContractMutation.mutateAsync({ listId, contractId });
  };

  const handleEditList = (list: List, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingList(list);
  };

  const toggleExpand = (listId: string) => {
    setExpandedListId(expandedListId === listId ? null : listId);
  };

  // Récupérer les commandes d'une liste avec leurs infos de participant
  const getOrdersForList = (list: List): (Order & { participant?: ListParticipant })[] => {
    return orders
      .filter(order => list.contractIds.includes(order.id))
      .map(order => {
        const participant = list.participants?.find(p => p.contractId === order.id);
        return { ...order, participant };
      })
      .sort((a, b) => (a.participant?.order || 999) - (b.participant?.order || 999));
  };

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Filtrer les listes par recherche
  const filteredLists = useMemo(() => {
    if (!searchQuery.trim()) return lists;
    const query = searchQuery.toLowerCase().trim();
    return lists.filter(list =>
      list.name.toLowerCase().includes(query) ||
      list.numero?.toLowerCase().includes(query) ||
      (list.description && list.description.toLowerCase().includes(query)) ||
      (list.telephone && list.telephone.toLowerCase().includes(query))
    );
  }, [lists, searchQuery]);

  // Formater la date d'événement de manière lisible
  const formatEventDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-500">
        Chargement des listes...
      </div>
    );
  }

  return (
    <>
      <div>
        {/* Barre de recherche */}
        <div className="border-b border-gray-100 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Barre de recherche */}
            <div className="flex-1 min-w-0 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher une liste..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/70 border-gray-300 text-gray-900 focus:border-amber-500 focus:ring-amber-500/20 rounded-xl transition-all shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Contenu de la liste */}
        <div className="p-4 sm:p-6">
          {/* Version desktop - En-tête du tableau */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-3 lg:px-4 py-3 bg-gray-50/50 font-semibold text-xs lg:text-sm text-gray-700 border border-gray-200/50 rounded-xl mb-4">
            <div className="col-span-4 text-left">N° / Nom de la liste</div>
            <div className="col-span-2 text-left">Date événement</div>
            <div className="col-span-2 text-left">Téléphone</div>
            <div className="col-span-2 text-center">Commandes</div>
            <div className="col-span-2 text-center">Actions</div>
          </div>

          {/* Liste des listes */}
          {filteredLists.length === 0 ? (
            <div className="border border-gray-200/50 rounded-xl p-8 text-center">
              <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <div className="text-base sm:text-lg font-medium text-gray-600 mb-2">
                {searchQuery ? 'Aucune liste trouvée pour cette recherche' : 'Aucune liste pour le moment'}
              </div>
              {!searchQuery && (
                <p className="text-sm text-gray-500">
                  Cliquez sur "Nouvelle liste" pour créer votre première liste
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredLists.map((list) => {
                const listOrders = getOrdersForList(list);
                const isExpanded = expandedListId === list._id;

                return (
                  <div
                    key={list._id}
                    className="border border-gray-200/50 rounded-xl hover:shadow-lg transition-shadow duration-200 overflow-hidden"
                  >
                    {/* Version desktop */}
                    <div
                      className="hidden md:grid grid-cols-12 gap-4 p-3 lg:p-4 hover:bg-gray-50/30 transition-all duration-200 cursor-pointer"
                      onClick={() => toggleExpand(list._id)}
                    >
                      {/* Nom */}
                      <div className="col-span-4 flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: list.color || '#f59e0b' }}
                        />
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        )}
                        <span className="font-semibold text-amber-600 text-sm">#{list.numero}</span>
                        <span className="font-semibold text-gray-900 truncate">{list.name}</span>
                      </div>

                      {/* Date d'événement */}
                      <div className="col-span-2 text-sm text-gray-600 flex items-center gap-1">
                        {list.dateEvenement ? (
                          <>
                            <Calendar className="w-4 h-4 text-amber-500 flex-shrink-0" />
                            <span className="font-medium text-amber-700">{formatEventDate(list.dateEvenement)}</span>
                          </>
                        ) : (
                          <span className="text-gray-400 text-xs">Non définie</span>
                        )}
                      </div>

                      {/* Téléphone */}
                      <div className="col-span-2 text-sm text-gray-600 flex items-center gap-1">
                        {list.telephone ? (
                          <>
                            <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span>{list.telephone}</span>
                          </>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </div>

                      {/* Nombre de commandes */}
                      <div className="col-span-2 flex justify-center items-center">
                        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                          {listOrders.length} commande{listOrders.length > 1 ? 's' : ''}
                        </Badge>
                      </div>

                      {/* Actions */}
                      <div className="col-span-2 flex justify-center items-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleEditList(list, e)}
                          className="h-8 w-8 p-0 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                          title="Voir la liste"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Version mobile - Cards */}
                    <div
                      className="block md:hidden p-5 hover:bg-gray-50/30 transition-colors cursor-pointer"
                      onClick={() => toggleExpand(list._id)}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: list.color || '#f59e0b' }}
                          />
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          )}
                          <span className="font-semibold text-amber-600">#{list.numero}</span>
                          <span className="text-gray-400">•</span>
                          <span className="font-bold text-base text-gray-900">{list.name}</span>
                        </div>
                        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 text-xs">
                          {listOrders.length}
                        </Badge>
                      </div>

                      {/* Date d'événement et téléphone */}
                      <div className="flex flex-wrap items-center gap-4 text-sm mb-3">
                        {list.dateEvenement && (
                          <div className="flex items-center gap-1 text-amber-700">
                            <Calendar className="w-4 h-4 text-amber-500" />
                            <span className="font-medium">{formatEventDate(list.dateEvenement)}</span>
                          </div>
                        )}
                        {list.telephone && (
                          <div className="flex items-center gap-1 text-gray-600">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span>{list.telephone}</span>
                          </div>
                        )}
                        {!list.dateEvenement && !list.telephone && (
                          <span className="text-gray-400 text-xs">Aucune info de contact</span>
                        )}
                      </div>

                      {/* Actions mobile */}
                      <div className="pt-4 border-t border-gray-200/50">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => handleEditList(list, e)}
                          className="w-full bg-white border-amber-300 text-amber-600 hover:bg-amber-50 rounded-xl py-3 font-medium min-h-[48px]"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          <span className="text-sm">Voir la liste</span>
                        </Button>
                      </div>
                    </div>

                    {/* Contenu de la liste (commandes) - quand déplié */}
                    {isExpanded && (
                      <div className="border-t border-gray-200 bg-gray-50/50">
                        {listOrders.length === 0 ? (
                          <div className="p-6 text-center text-gray-500 text-sm">
                            <Users className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                            Aucune commande dans cette liste.
                            <br />
                            <span className="text-xs">Cliquez sur "Modifier" pour ajouter des commandes.</span>
                          </div>
                        ) : (
                          <div className="divide-y divide-gray-200">
                            {listOrders.map((order) => (
                              <div
                                key={order.id}
                                className="p-4 hover:bg-white transition-colors cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onViewOrder(order);
                                }}
                              >
                                {/* Version mobile - en colonnes */}
                                <div className="flex flex-col gap-1 sm:hidden">
                                  <div className="flex items-center justify-between">
                                    <span className="font-semibold text-amber-600">
                                      #{order.numero}
                                    </span>
                                    {order.participant?.role && (
                                      <span className="text-sm text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded-full">
                                        {order.participant.role}
                                      </span>
                                    )}
                                  </div>
                                  <div className="font-medium text-gray-900 text-left">
                                    {order.client.prenom} {order.client.nom}
                                  </div>
                                  <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                                    {order.client.telephone && (
                                      <div className="flex items-center gap-1">
                                        <Phone className="w-3 h-3" />
                                        <span>{order.client.telephone}</span>
                                      </div>
                                    )}
                                    <div className="flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      <span>{formatDate(order.dateLivraison || order.dateCreation)}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Version desktop - en ligne */}
                                <div className="hidden sm:block">
                                  <div className="flex items-center gap-3 mb-1">
                                    <span className="w-7 h-7 flex-shrink-0 rounded-full bg-amber-100 text-amber-700 text-sm font-bold flex items-center justify-center">
                                      {order.participant?.order || '?'}
                                    </span>
                                    <span className="font-semibold text-amber-600 hover:underline">
                                      #{order.numero}
                                    </span>
                                    <span className="text-gray-400">•</span>
                                    <span className="font-medium text-gray-900">
                                      {order.client.prenom} {order.client.nom}
                                    </span>
                                    {order.participant?.role && (
                                      <>
                                        <span className="text-gray-400">•</span>
                                        <span className="text-sm text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded-full">
                                          {order.participant.role}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-4 text-sm text-gray-500 ml-10">
                                    {order.client.telephone && (
                                      <div className="flex items-center gap-1">
                                        <Phone className="w-3 h-3" />
                                        <span>{order.client.telephone}</span>
                                      </div>
                                    )}
                                    <div className="flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      <span>{formatDate(order.dateLivraison || order.dateCreation)}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal d'édition de liste */}
      <EditListModal
        isOpen={!!editingList}
        onClose={() => setEditingList(null)}
        list={editingList}
        orders={orders}
      />
    </>
  );
}
