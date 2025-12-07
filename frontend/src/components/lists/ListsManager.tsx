import React, { useState, useMemo } from 'react';
import { List } from '@/types/list';
import { Order } from '@/types/order';
import { useLists, useDeleteList, useRemoveContractFromList } from '@/hooks/useLists';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Trash2, FolderOpen, ChevronRight, ChevronDown, X, Search, Eye, Calendar, Phone } from 'lucide-react';

interface ListsManagerProps {
  orders: Order[];
  onViewOrder: (order: Order) => void;
  onEditOrder: (order: Order) => void;
}

export function ListsManager({ orders, onViewOrder, onEditOrder }: ListsManagerProps) {
  const { data: lists = [], isLoading } = useLists();
  const deleteListMutation = useDeleteList();
  const removeContractMutation = useRemoveContractFromList();

  const [expandedListId, setExpandedListId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleDeleteList = async (listId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette liste ?')) {
      await deleteListMutation.mutateAsync(listId);
    }
  };

  const handleRemoveContract = async (listId: string, contractId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await removeContractMutation.mutateAsync({ listId, contractId });
  };

  const toggleExpand = (listId: string) => {
    setExpandedListId(expandedListId === listId ? null : listId);
  };

  // Récupérer les commandes d'une liste
  const getOrdersForList = (list: List): Order[] => {
    return orders.filter(order => list.contractIds.includes(order.id));
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
      (list.description && list.description.toLowerCase().includes(query))
    );
  }, [lists, searchQuery]);

  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-500">
        Chargement des listes...
      </div>
    );
  }

  return (
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
          <div className="col-span-5 text-left">Nom de la liste</div>
          <div className="col-span-3 text-left">Description</div>
          <div className="col-span-2 text-center">Commandes</div>
          <div className="col-span-2 text-center">Actions</div>
        </div>

        {/* Liste des listes */}
        {filteredLists.length === 0 ? (
          <div className="border border-gray-200/50 rounded-xl p-8 text-center">
            <FolderOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
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
                    <div className="col-span-5 flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: list.color || '#f59e0b' }}
                      />
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      )}
                      <span className="font-semibold text-gray-900">{list.name}</span>
                    </div>

                    {/* Description */}
                    <div className="col-span-3 text-sm text-gray-600 flex items-center">
                      {list.description || '-'}
                    </div>

                    {/* Nombre de commandes */}
                    <div className="col-span-2 flex justify-center items-center">
                      <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                        {listOrders.length} commande{listOrders.length > 1 ? 's' : ''}
                      </Badge>
                    </div>

                    {/* Actions */}
                    <div className="col-span-2 flex justify-center items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpand(list._id);
                        }}
                        className="h-8 px-3 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Voir
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleDeleteList(list._id, e)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Version mobile - Cards */}
                  <div
                    className="block md:hidden p-5 hover:bg-gray-50/30 transition-colors cursor-pointer"
                    onClick={() => toggleExpand(list._id)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: list.color || '#f59e0b' }}
                        />
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        )}
                        <span className="font-bold text-base text-gray-900">{list.name}</span>
                      </div>
                      <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 text-xs">
                        {listOrders.length}
                      </Badge>
                    </div>

                    {list.description && (
                      <p className="text-sm text-gray-600 mb-3">{list.description}</p>
                    )}

                    {/* Actions mobile */}
                    <div className="flex gap-3 pt-4 border-t border-gray-200/50">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpand(list._id);
                        }}
                        className="flex-1 bg-white border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl py-3 font-medium min-h-[48px]"
                      >
                        <Eye className="w-5 h-5 mr-2" />
                        <span className="text-sm">{isExpanded ? 'Masquer' : 'Voir'}</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => handleDeleteList(list._id, e)}
                        className="bg-white border-red-300 text-red-600 hover:bg-red-50 rounded-xl py-3 font-medium min-h-[48px] px-4"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>

                  {/* Contenu de la liste (commandes) - quand déplié */}
                  {isExpanded && (
                    <div className="border-t border-gray-200 bg-gray-50/50">
                      {listOrders.length === 0 ? (
                        <div className="p-6 text-center text-gray-500 text-sm">
                          <FolderOpen className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                          Aucune commande dans cette liste.
                          <br />
                          <span className="text-xs">Ajoutez des commandes depuis l'onglet "Commandes".</span>
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-200">
                          {listOrders.map((order) => (
                            <div
                              key={order.id}
                              className="flex items-center justify-between p-4 hover:bg-white transition-colors"
                            >
                              <div
                                className="flex-1 cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onViewOrder(order);
                                }}
                              >
                                <div className="flex items-center gap-3 mb-1">
                                  <span className="font-semibold text-amber-600">
                                    #{order.numero}
                                  </span>
                                  <span className="text-gray-400">•</span>
                                  <span className="font-medium text-gray-900">
                                    {order.client.prenom} {order.client.nom}
                                  </span>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                  {order.client.telephone && (
                                    <div className="flex items-center gap-1">
                                      <Phone className="w-3 h-3" />
                                      <span>{order.client.telephone}</span>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    <span>{formatDate(order.dateEvenement || order.dateCreation)}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onViewOrder(order);
                                  }}
                                  className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => handleRemoveContract(list._id, order.id, e)}
                                  className="text-gray-400 hover:text-red-500 hover:bg-red-50"
                                  title="Retirer de la liste"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
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
  );
}
