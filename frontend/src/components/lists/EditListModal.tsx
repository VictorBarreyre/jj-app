import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { X, Users, Search, ChevronUp, ChevronDown, Phone, Calendar, Edit3, FileText, Trash2, Euro } from 'lucide-react';
import { useUpdateList, useDeleteList } from '@/hooks/useLists';
import { Order } from '@/types/order';
import { List, ListParticipant } from '@/types/list';
import { calculateTenuePrice, GROUP_THRESHOLD } from '@/utils/priceCalculation';
import { rentalContractApi } from '@/services/rental-contract.api';
import { useQueryClient } from '@tanstack/react-query';
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
  const [notes, setNotes] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [participants, setParticipants] = useState<ParticipantState[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isApplyingGroupPricing, setIsApplyingGroupPricing] = useState(false);
  const [hasGroupPricingApplied, setHasGroupPricingApplied] = useState(false);
  const [originalPrices, setOriginalPrices] = useState<Record<string, number>>({});
  const [localPrices, setLocalPrices] = useState<Record<string, number>>({});
  const prevParticipantsCountRef = useRef<number>(0);
  const updateListMutation = useUpdateList();
  const deleteListMutation = useDeleteList();
  const queryClient = useQueryClient();

  // Appliquer le tarif préférentiel (groupe 6+) à toutes les commandes
  const handleApplyGroupPricing = async () => {
    if (participants.length === 0) return;

    setIsApplyingGroupPricing(true);
    const groupSize = Math.max(participants.length, GROUP_THRESHOLD); // Force au moins 6 pour le tarif groupe

    // Sauvegarder les prix originaux avant modification
    const pricesBeforeChange: Record<string, number> = {};
    for (const p of participants) {
      const order = orders.find(o => o.id === p.contractId);
      if (order?.tarifLocation) {
        pricesBeforeChange[p.contractId] = order.tarifLocation;
      }
    }

    try {
      let updatedCount = 0;
      let skippedNoTenue = 0;
      let skippedSamePrice = 0;
      let skippedNoCombination = 0;
      const newPrices: Record<string, number> = {};

      console.log(`=== APPLICATION TARIF PRÉFÉRENTIEL ===`);
      console.log(`Nombre de participants: ${participants.length}, groupSize utilisé: ${groupSize}`);

      for (const p of participants) {
        const order = orders.find(o => o.id === p.contractId);

        // Vérifier si la commande a une tenue avec au moins une référence
        const hasTenue = order?.tenue && (
          order.tenue.veste?.reference ||
          order.tenue.gilet?.reference ||
          order.tenue.pantalon?.reference
        );

        if (!hasTenue) {
          console.log(`❌ Commande ${order?.numero || p.contractId}: pas de tenue ou tenue vide`);
          skippedNoTenue++;
          continue;
        }

        // Calculer le prix standard (individuel) et le prix groupe
        const prixStandard = calculateTenuePrice(order.tenue, 1);
        const prixGroupe = calculateTenuePrice(order.tenue, groupSize);

        console.log(`📦 Commande ${order.numero}:`);
        console.log(`   Veste: ${order.tenue.veste?.reference}`);
        console.log(`   Gilet: ${order.tenue.gilet?.reference}`);
        console.log(`   Pantalon: ${order.tenue.pantalon?.reference}`);
        console.log(`   Prix actuel: ${order.tarifLocation}€`);
        console.log(`   Prix standard calculé: ${prixStandard}€`);
        console.log(`   Prix groupe calculé: ${prixGroupe}€`);

        if (prixGroupe === undefined) {
          console.log(`   ⚠️ Impossible de calculer le prix groupe (combinaison non trouvée)`);
          skippedNoCombination++;
          continue;
        }

        // Si le prix groupe est le même que le standard, pas de réduction possible
        if (prixGroupe === prixStandard) {
          console.log(`   ℹ️ Pas de réduction groupe pour cette combinaison`);
          skippedSamePrice++;
          continue;
        }

        // Si le prix actuel est déjà le prix groupe
        if (prixGroupe === order.tarifLocation) {
          console.log(`   ✓ Prix groupe déjà appliqué`);
          skippedSamePrice++;
          newPrices[order.id] = prixGroupe; // Garder le prix dans localPrices pour l'affichage
          continue;
        }

        // Appliquer le nouveau prix
        console.log(`   🔄 Mise à jour: ${order.tarifLocation}€ → ${prixGroupe}€`);
        await rentalContractApi.update(order.id, { tarifLocation: prixGroupe });
        newPrices[order.id] = prixGroupe;
        updatedCount++;
      }

      // Mettre à jour les prix locaux immédiatement
      setLocalPrices(prev => ({ ...prev, ...newPrices }));

      // Rafraîchir les données en arrière-plan
      queryClient.invalidateQueries({ queryKey: ['orders'] });

      console.log(`=== RÉSULTAT ===`);
      console.log(`✓ Mis à jour: ${updatedCount}`);
      console.log(`○ Déjà au prix groupe: ${skippedSamePrice}`);
      console.log(`○ Sans tenue: ${skippedNoTenue}`);
      console.log(`○ Sans combinaison: ${skippedNoCombination}`);

      // Déterminer le résultat à afficher
      const hasGroupPriceApplied = updatedCount > 0 || Object.keys(newPrices).length > 0;

      if (updatedCount > 0) {
        toast.success(`Tarif préférentiel appliqué à ${updatedCount} commande${updatedCount > 1 ? 's' : ''}`);
        setOriginalPrices(pricesBeforeChange);
        setHasGroupPricingApplied(true);
      } else if (hasGroupPriceApplied || skippedSamePrice > 0) {
        // Au moins une commande a le tarif groupe (soit déjà appliqué, soit mis à jour)
        toast.success('Tarif préférentiel déjà appliqué');
        setHasGroupPricingApplied(true);
      } else if (skippedNoCombination > 0) {
        toast.error(`Combinaisons non reconnues (${skippedNoCombination}). Voir console pour détails.`);
      } else if (skippedNoTenue > 0) {
        toast.error('Aucune commande avec tenue trouvée');
      }
    } catch (error) {
      console.error('Erreur lors de l\'application du tarif:', error);
      toast.error('Erreur lors de l\'application du tarif préférentiel');
    } finally {
      setIsApplyingGroupPricing(false);
    }
  };

  // Revenir au tarif normal (individuel)
  const handleApplyNormalPricing = async () => {
    if (participants.length === 0) return;

    setIsApplyingGroupPricing(true);

    try {
      let updatedCount = 0;
      const newPrices: Record<string, number> = {};

      console.log(`=== RETOUR AU TARIF NORMAL ===`);

      for (const p of participants) {
        const order = orders.find(o => o.id === p.contractId);

        // Vérifier si la commande a une tenue avec au moins une référence
        const hasTenue = order?.tenue && (
          order.tenue.veste?.reference ||
          order.tenue.gilet?.reference ||
          order.tenue.pantalon?.reference
        );

        if (!hasTenue) {
          continue;
        }

        // Recalculer le prix avec le tarif normal (groupSize = 1)
        const prixStandard = calculateTenuePrice(order.tenue, 1);

        // Prix actuel (depuis localPrices ou order)
        const currentPrice = localPrices[order.id] ?? order.tarifLocation;

        console.log(`📦 Commande ${order.numero}:`);
        console.log(`   Prix actuel: ${currentPrice}€`);
        console.log(`   Prix standard: ${prixStandard}€`);

        if (prixStandard === undefined) {
          console.log(`   ⚠️ Prix standard non calculable`);
          continue;
        }

        if (prixStandard === currentPrice) {
          console.log(`   ✓ Déjà au prix standard`);
          continue;
        }

        console.log(`   🔄 Mise à jour: ${currentPrice}€ → ${prixStandard}€`);
        await rentalContractApi.update(order.id, { tarifLocation: prixStandard });
        newPrices[order.id] = prixStandard;
        updatedCount++;
      }

      // Mettre à jour les prix locaux
      setLocalPrices(newPrices);

      // Rafraîchir les données en arrière-plan
      queryClient.invalidateQueries({ queryKey: ['orders'] });

      console.log(`=== RÉSULTAT: ${updatedCount} commande(s) mise(s) à jour ===`);

      if (updatedCount > 0) {
        toast.success(`Tarif normal appliqué à ${updatedCount} commande${updatedCount > 1 ? 's' : ''}`);
      } else {
        toast.success('Tarif normal déjà appliqué');
      }
      setOriginalPrices({});
      setHasGroupPricingApplied(false);
    } catch (error) {
      console.error('Erreur lors de l\'application du tarif:', error);
      toast.error('Erreur lors de l\'application du tarif normal');
    } finally {
      setIsApplyingGroupPricing(false);
    }
  };

  // Supprimer la liste
  const handleDeleteList = async () => {
    if (!list) return;

    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir supprimer la liste "${list.name}" ?\n\nCette action est irréversible.`
    );

    if (confirmed) {
      try {
        await deleteListMutation.mutateAsync(list._id);
        onClose();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        toast.error('Erreur lors de la suppression de la liste');
      }
    }
  };

  // Calculer le prix total de la liste (utiliser localPrices si disponible)
  const totalPrice = useMemo(() => {
    return participants.reduce((total, p) => {
      const order = orders.find(o => o.id === p.contractId);
      // Utiliser le prix local s'il existe, sinon le prix de la commande
      const price = localPrices[p.contractId] ?? order?.tarifLocation ?? 0;
      return total + price;
    }, 0);
  }, [participants, orders, localPrices]);

  // Calculer le prix total original (avant réduction groupe)
  // Pour chaque participant: si on a un prix original stocké, l'utiliser, sinon prendre le prix actuel
  const originalTotalPrice = useMemo(() => {
    return participants.reduce((total, p) => {
      const order = orders.find(o => o.id === p.contractId);
      // Utiliser le prix original s'il existe (pour les commandes avec réduction), sinon le prix actuel
      const price = originalPrices[p.contractId] ?? localPrices[p.contractId] ?? order?.tarifLocation ?? 0;
      return total + price;
    }, 0);
  }, [participants, orders, localPrices, originalPrices]);

  // Formater le prix
  const formatPrice = (price: number): string => {
    return `${price}€`;
  };

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
      setNotes(list.description || '');
      setSearchQuery('');
      setIsEditing(false); // Toujours ouvrir en mode visualisation
      setLocalPrices({}); // Réinitialiser les prix locaux

      // Initialiser les participants à partir de la liste existante
      let participantsList: ParticipantState[] = [];
      if (list.participants && list.participants.length > 0) {
        participantsList = list.participants.map(p => ({
          contractId: p.contractId,
          role: p.role || '',
          order: p.order
        }));
      } else {
        // Fallback: créer des participants à partir de contractIds
        participantsList = (list.contractIds || []).map((id, index) => ({
          contractId: id,
          role: '',
          order: index + 1
        }));
      }
      setParticipants(participantsList);

      // Détecter si le tarif préférentiel est déjà appliqué
      // en comparant les prix actuels avec les prix groupe calculés
      const groupSize = Math.max(participantsList.length, GROUP_THRESHOLD);
      let groupPricingCount = 0;
      let checkableOrders = 0;
      const detectedOriginalPrices: Record<string, number> = {};

      console.log(`=== DÉTECTION TARIF PRÉFÉRENTIEL À L'OUVERTURE ===`);
      console.log(`Nombre de participants: ${participantsList.length}`);

      for (const p of participantsList) {
        const order = orders.find(o => o.id === p.contractId);
        if (!order) continue;

        const hasTenue = order.tenue && (
          order.tenue.veste?.reference ||
          order.tenue.gilet?.reference ||
          order.tenue.pantalon?.reference
        );

        if (!hasTenue || !order.tarifLocation) continue;

        const prixStandard = calculateTenuePrice(order.tenue, 1);
        const prixGroupe = calculateTenuePrice(order.tenue, groupSize);

        if (prixStandard === undefined || prixGroupe === undefined) continue;

        checkableOrders++;

        console.log(`📦 Commande ${order.numero}: actuel=${order.tarifLocation}€, standard=${prixStandard}€, groupe=${prixGroupe}€`);

        // Si le prix actuel correspond au prix groupe ET le prix groupe est différent du standard
        if (order.tarifLocation === prixGroupe && prixGroupe !== prixStandard) {
          groupPricingCount++;
          detectedOriginalPrices[order.id] = prixStandard; // Stocker le prix standard comme "original"
          console.log(`   ✓ Tarif préférentiel détecté`);
        }
      }

      // Si au moins une commande a le tarif préférentiel appliqué, considérer que c'est actif
      const isGroupPricingApplied = groupPricingCount > 0;
      console.log(`=== RÉSULTAT: ${groupPricingCount}/${checkableOrders} commandes avec tarif préférentiel ===`);

      setHasGroupPricingApplied(isGroupPricingApplied);
      setOriginalPrices(isGroupPricingApplied ? detectedOriginalPrices : {});

      // Initialiser le ref avec le nombre actuel de participants pour éviter le déclenchement automatique à l'ouverture
      prevParticipantsCountRef.current = participantsList.length;
    }
  }, [isOpen, list, orders]);

  // Appliquer automatiquement le tarif préférentiel quand on atteint 6+ participants
  // Ne se déclenche que lors d'ajouts de participants (pas à l'ouverture du modal)
  useEffect(() => {
    const prevCount = prevParticipantsCountRef.current;
    const currentCount = participants.length;

    // Si on vient de passer de <6 à >=6 participants ET que le tarif n'est pas déjà appliqué
    if (prevCount < GROUP_THRESHOLD && currentCount >= GROUP_THRESHOLD && !isApplyingGroupPricing && !hasGroupPricingApplied) {
      handleApplyGroupPricing();
    }

    prevParticipantsCountRef.current = currentCount;
  }, [participants.length, hasGroupPricingApplied]);

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
          description: notes.trim() || undefined,
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
          {/* Header */}
          <div className="px-4 sm:px-8 pt-6 sm:pt-8 pb-4 sm:pb-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-2xl font-bold text-gray-900 text-left">
                Liste #{list.numero}
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
            {/* Métadonnées avec boutons d'action */}
            <div className="mt-3 sm:mt-4 flex justify-between items-end">
              <div className="text-xs text-gray-500 space-y-1 text-left">
                <div>Créée le {new Date(list.createdAt).toLocaleDateString('fr-FR')}</div>
                {list.updatedAt && list.updatedAt !== list.createdAt && (
                  <div>Modifiée le {new Date(list.updatedAt).toLocaleDateString('fr-FR')}</div>
                )}
                {list.createdBy && (
                  <div>Par {list.createdBy}</div>
                )}
              </div>

              {/* Bouton Modifier */}
              {!isEditing && (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-1 sm:gap-2 text-sm sm:text-base"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Modifier</span>
                </Button>
              )}
            </div>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-6">
              {/* Informations principales */}
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                {/* Nom de la liste */}
                <div className="md:col-span-2">
                  <label htmlFor="editListName" className="block text-sm font-medium text-gray-700 mb-2 text-left">
                    Nom de la liste
                  </label>
                  <Input
                    id="editListName"
                    placeholder="Ex: Mariage Dupont..."
                    value={listName}
                    onChange={(e) => setListName(e.target.value)}
                    className={`w-full text-lg font-semibold ${!isEditing ? 'bg-gray-50 cursor-default' : ''}`}
                    autoFocus={isEditing}
                    readOnly={!isEditing}
                  />
                </div>

                {/* Téléphone */}
                <div className="md:col-span-2">
                  <label htmlFor="editTelephone" className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4" />
                    Téléphone
                  </label>
                  <Input
                    id="editTelephone"
                    type="tel"
                    placeholder="06 12 34 56 78"
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    className={`w-full ${!isEditing ? 'bg-gray-50 cursor-default' : ''}`}
                    readOnly={!isEditing}
                  />
                </div>

                {/* Date d'événement */}
                <div className="md:col-span-2">
                  <label htmlFor="editDateEvenement" className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4" />
                    Date
                  </label>
                  <Input
                    id="editDateEvenement"
                    type="date"
                    value={dateEvenement}
                    onChange={(e) => setDateEvenement(e.target.value)}
                    className={`w-40 border-gray-300 text-gray-900 focus:border-amber-500 focus:ring-amber-500/20 rounded-xl transition-all shadow-sm pl-3 pr-1 text-left date-input-tight ${!isEditing ? 'bg-gray-50 cursor-default' : 'bg-white/70'}`}
                    readOnly={!isEditing}
                  />
                </div>

                {/* Notes */}
                <div className="md:col-span-6">
                  <label htmlFor="editNotes" className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-2">
                    <FileText className="w-4 h-4" />
                    Notes
                  </label>
                  <Textarea
                    id="editNotes"
                    placeholder="Notes ou informations complémentaires..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className={`w-full min-h-[80px] resize-none ${!isEditing ? 'bg-gray-50 cursor-default' : ''}`}
                    readOnly={!isEditing}
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
                    <Users className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                    {isEditing ? 'Aucun participant. Ajoutez des commandes ci-dessous.' : 'Aucun participant dans cette liste.'}
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
                            className="p-3 bg-white hover:bg-gray-50 transition-colors"
                          >
                            {/* Version mobile - en colonne */}
                            <div className="flex flex-col gap-2 sm:hidden">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-amber-600 text-sm">
                                  #{order.numero}
                                </span>
                                <div className="flex items-center gap-2">
                                  {!isEditing && participant.role && (
                                    <span className="text-sm text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded-full">
                                      {participant.role}
                                    </span>
                                  )}
                                  {isEditing && (
                                    <div className="flex items-center gap-1">
                                      <button
                                        type="button"
                                        onClick={() => moveUp(index)}
                                        disabled={index === 0}
                                        className={`p-1 rounded ${index === 0 ? 'text-gray-300' : 'text-gray-400 hover:text-amber-600'}`}
                                      >
                                        <ChevronUp className="w-4 h-4" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => moveDown(index)}
                                        disabled={index === participants.length - 1}
                                        className={`p-1 rounded ${index === participants.length - 1 ? 'text-gray-300' : 'text-gray-400 hover:text-amber-600'}`}
                                      >
                                        <ChevronDown className="w-4 h-4" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => removeParticipant(participant.contractId)}
                                        className="p-1 text-gray-400 hover:text-red-500 rounded"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="text-gray-900 font-medium text-sm text-left">
                                {order.client.prenom} {order.client.nom}
                              </div>
                              {isEditing && (
                                <Input
                                  placeholder="Rôle (ex: Marié)"
                                  value={participant.role}
                                  onChange={(e) => updateRole(participant.contractId, e.target.value)}
                                  className="text-sm h-8"
                                />
                              )}
                            </div>

                            {/* Version desktop - en ligne */}
                            <div className="hidden sm:flex items-center gap-3">
                              <span className="w-7 h-7 flex-shrink-0 rounded-full bg-amber-100 text-amber-700 text-sm font-bold flex items-center justify-center">
                                {participant.order}
                              </span>

                              {isEditing && (
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
                              )}

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

                              {isEditing ? (
                                <Input
                                  placeholder="Rôle (ex: Marié)"
                                  value={participant.role}
                                  onChange={(e) => updateRole(participant.contractId, e.target.value)}
                                  className="w-40 text-sm h-8"
                                />
                              ) : (
                                participant.role && (
                                  <span className="text-sm text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded-full">
                                    {participant.role}
                                  </span>
                                )
                              )}

                              {isEditing && (
                                <button
                                  type="button"
                                  onClick={() => removeParticipant(participant.contractId)}
                                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Tarification */}
              {totalPrice > 0 && (
                <div className="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2 sm:gap-3 text-left">
                      <Euro className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
                      Tarification
                    </h2>
                    {hasGroupPricingApplied ? (
                      <button
                        type="button"
                        onClick={handleApplyNormalPricing}
                        disabled={isApplyingGroupPricing}
                        className="text-sm text-gray-900 underline hover:text-gray-700 disabled:opacity-50"
                        title="Cliquer pour revenir au tarif normal"
                      >
                        {isApplyingGroupPricing ? 'Application...' : 'Tarif préférentiel appliqué'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleApplyGroupPricing}
                        disabled={isApplyingGroupPricing}
                        className="text-sm text-gray-900 underline hover:text-gray-700 disabled:opacity-50"
                      >
                        {isApplyingGroupPricing ? 'Application...' : 'Appliquer le tarif préférentiel'}
                      </button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {/* Total */}
                    <div className="flex justify-between text-left">
                      <span className="font-semibold text-gray-900 text-left">Total:</span>
                      <div className="text-right">
                        {hasGroupPricingApplied && originalTotalPrice > totalPrice && (
                          <span className="text-sm text-gray-400 line-through mr-2">
                            {formatPrice(originalTotalPrice)}
                          </span>
                        )}
                        <span className="font-bold text-base text-amber-600">{formatPrice(totalPrice)}</span>
                      </div>
                    </div>
                    {/* Détail par commande */}
                    <div className="border-t border-gray-200 pt-3 mt-3 space-y-1.5">
                      {participants.map((p) => {
                        const order = orders.find(o => o.id === p.contractId);
                        // Utiliser le prix local s'il existe, sinon le prix de la commande
                        const currentPrice = localPrices[p.contractId] ?? order?.tarifLocation;
                        if (!order || !currentPrice) return null;
                        const originalPrice = originalPrices[p.contractId];
                        const hasDiscount = hasGroupPricingApplied && originalPrice && originalPrice !== currentPrice;
                        return (
                          <div key={p.contractId} className="flex justify-between text-sm text-gray-600">
                            <span className="text-left">
                              #{order.numero} - {order.client.prenom} {order.client.nom}
                              {p.role && <span className="text-amber-600 ml-1">({p.role})</span>}
                            </span>
                            <div className="text-right">
                              {hasDiscount && (
                                <span className="text-gray-400 line-through mr-2">
                                  {formatPrice(originalPrice)}
                                </span>
                              )}
                              <span className={hasDiscount ? 'text-green-600 font-medium' : ''}>
                                {formatPrice(currentPrice)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Ajouter des commandes - seulement en mode édition */}
              {isEditing && (
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
              )}
            </div>

            {/* Actions - seulement en mode édition */}
            {isEditing && (
              <div className="flex gap-3 mt-6">
                <Button
                  type="button"
                  onClick={() => {
                    // Réinitialiser les valeurs et quitter le mode édition
                    if (list) {
                      setListName(list.name);
                      setTelephone(list.telephone || '');
                      setDateEvenement(list.dateEvenement ? new Date(list.dateEvenement).toISOString().split('T')[0] : '');
                      setNotes(list.description || '');
                      if (list.participants && list.participants.length > 0) {
                        setParticipants(list.participants.map(p => ({
                          contractId: p.contractId,
                          role: p.role || '',
                          order: p.order
                        })));
                      }
                    }
                    setIsEditing(false);
                  }}
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
            )}

            {/* Bouton de suppression */}
            {!isEditing && (
              <div className="border-t border-gray-200 pt-6 mt-6 flex justify-center">
                <Button
                  type="button"
                  onClick={handleDeleteList}
                  variant="ghost"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors duration-200 flex items-center gap-2 text-sm"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Supprimer cette liste</span>
                </Button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
