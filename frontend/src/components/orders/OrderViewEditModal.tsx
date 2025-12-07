import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Edit3,
  Save,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Package,
  Euro,
  FileText,
  X,
  Trash2,
  FolderPlus,
  Check
} from 'lucide-react';
import { Order, OrderItem } from '@/types/order';
import { RentalContract } from '@/types/rental-contract';
import { EmailButton } from '@/components/ui/EmailButton';
import { formatReference } from '@/utils/formatters';
import { useLists, useAddContractToList, useRemoveContractFromList } from '@/hooks/useLists';
import toast from 'react-hot-toast';

interface OrderViewEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (updatedOrder: Partial<Order>) => Promise<void>;
  onCancel: () => void;
  onEditOrder?: (order: Order) => void; // Nouvelle prop pour rediriger vers le formulaire
  onUpdateParticipantReturn?: (orderId: string, participantIndex: number, returned: boolean) => Promise<void>;
  onDelete?: (orderId: string) => Promise<void>; // Nouvelle prop pour supprimer
}

export function OrderViewEditModal({
  isOpen,
  onClose,
  order,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onEditOrder,
  onUpdateParticipantReturn,
  onDelete
}: OrderViewEditModalProps) {
  const [formData, setFormData] = useState<Partial<Order>>({});
  const [displayOrder, setDisplayOrder] = useState<Order | null>(order);
  const [showListDropdown, setShowListDropdown] = useState(false);

  // Hooks pour les listes
  const { data: lists = [] } = useLists();
  const addToListMutation = useAddContractToList();
  const removeFromListMutation = useRemoveContractFromList();

  // Synchroniser displayOrder avec order - toujours mettre à jour
  useEffect(() => {
    if (order) {
      setDisplayOrder(order);
    }
  }, [order]);

  useEffect(() => {
    if (order && isEditing) {
      setFormData(order);
    }
  }, [order, isEditing]);

  // Gestion des touches et scroll
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

  if (!displayOrder) return null;

  // Handler local pour la mise à jour optimiste
  const handleLocalParticipantReturn = async (orderId: string, participantIndex: number, returned: boolean) => {
    console.log('🔄 handleLocalParticipantReturn appelé:', { orderId, participantIndex, returned });

    // Mise à jour locale immédiate
    if (displayOrder.type === 'groupe' && displayOrder.groupDetails?.participants) {
      const updatedParticipants = displayOrder.groupDetails.participants.map((p, idx) =>
        idx === participantIndex ? { ...p, rendu: returned } : p
      );
      const newDisplayOrder = {
        ...displayOrder,
        groupDetails: {
          ...displayOrder.groupDetails,
          participants: updatedParticipants
        }
      };
      console.log('✅ Nouveau displayOrder (groupe):', newDisplayOrder);
      setDisplayOrder(newDisplayOrder);
    } else if (displayOrder.type === 'individuel' && participantIndex === 0) {
      const newDisplayOrder = { ...displayOrder, rendu: returned };
      setDisplayOrder(newDisplayOrder);
    }

    // Appeler le handler parent
    if (onUpdateParticipantReturn) {
      await onUpdateParticipantReturn(orderId, participantIndex, returned);
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'livree': return 'bg-green-100 text-green-800 border-green-200';
      case 'rendue': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'brouillon': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getStatusLabel = (status: Order['status']) => {
    switch (status) {
      case 'livree': return 'Livrée';
      case 'rendue': return 'Rendue';
      case 'brouillon': return 'Brouillon';
      default: return 'Brouillon';
    }
  };


  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('fr-FR');
  };

  const formatPrice = (price?: number) => {
    return price ? `${price.toFixed(2)} €` : '0.00 €';
  };

  const handleSave = async () => {
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handleEditItem = (itemId: string) => {
    // La fonctionnalité d'édition est maintenant gérée au niveau de la page Home
  };

  const handleEditOrderRedirect = () => {
    if (order && onEditOrder) {
      onClose(); // Fermer la modal
      onEditOrder(order); // Rediriger vers le formulaire
    }
  };

  const handleDelete = async () => {
    if (!order || !onDelete) return;

    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir supprimer définitivement le bon de commande #${displayOrder.numero} ?\n\nCette action est irréversible.`
    );

    if (confirmed) {
      try {
        await onDelete(displayOrder.id);
        onClose();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression du bon de commande.');
      }
    }
  };


  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) return;

    try {
      // Supprimer l'article de la liste locale
      const updatedItems = formData.items?.filter(item => item.id !== itemId) || displayOrder.items.filter(item => item.id !== itemId);
      setFormData(prev => ({
        ...prev,
        items: updatedItems
      }));

      // TODO: Appeler l'API pour mettre à jour le backend et les stocks
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  // Vérifier si la commande est dans une liste
  const isInList = (listId: string) => {
    const list = lists.find(l => l._id === listId);
    return list?.contractIds?.includes(displayOrder?.id || '') || false;
  };

  // Ajouter ou retirer la commande d'une liste
  const handleToggleList = async (listId: string) => {
    if (!displayOrder) return;

    try {
      if (isInList(listId)) {
        await removeFromListMutation.mutateAsync({ listId, contractId: displayOrder.id });
        const listName = lists.find(l => l._id === listId)?.name;
        toast.success(`Retirée de "${listName}"`);
      } else {
        await addToListMutation.mutateAsync({ listId, contractId: displayOrder.id });
        const listName = lists.find(l => l._id === listId)?.name;
        toast.success(`Ajoutée à "${listName}"`);
      }
    } catch (error) {
      console.error('Erreur lors de la modification de la liste:', error);
      toast.error('Erreur lors de la modification');
    }
  };


  return (
    <div className={`fixed inset-0 z-50 overflow-y-auto ${isOpen ? 'block' : 'hidden'}`}>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-2 sm:p-4">
        <div 
          className="relative w-full max-w-4xl transform rounded-xl sm:rounded-2xl bg-white shadow-2xl transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="max-h-[90vh] sm:max-h-[80vh] overflow-y-scroll scrollbar-none">
            {/* Header personnalisé avec titre, statut et actions */}
            <div className="px-4 sm:px-8 pt-6 sm:pt-8 pb-4 sm:pb-6">
              <div className="flex items-center justify-between pl-2 sm:pl-4">
                {/* Titre */}
                <h2 className="text-lg sm:text-2xl font-bold text-gray-900 truncate text-left">Commande #{displayOrder.numero}</h2>

                {/* Bouton fermer */}
                <Button
                  onClick={onClose}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Métadonnées + Statut */}
              <div className="mt-3 sm:mt-4 pl-2 sm:pl-4 flex items-start justify-between">
                <div className="text-xs text-gray-500 text-left space-y-0.5">
                  <div>Créée le {formatDate(displayOrder.dateCreation)}</div>
                  {displayOrder.updatedAt && (
                    <div>Modifiée le {formatDate(displayOrder.updatedAt)}</div>
                  )}
                  {displayOrder.createdBy && (
                    <div>Par {displayOrder.createdBy}</div>
                  )}
                </div>
                <Badge className={`${getStatusColor(displayOrder.status)} border text-xs sm:text-sm font-semibold flex-shrink-0`}>
                  {getStatusLabel(displayOrder.status)}
                </Badge>
              </div>

              {/* Boutons d'action */}
              <div className="mt-3 pl-2 sm:pl-4 flex items-center gap-2 w-full">
                  {!isEditing ? (
                    <>
                      {/* Bouton Email - uniquement si client a un email */}
                      {order?.client?.email && (
                        <EmailButton
                          contract={order as RentalContract}
                          type="client"
                          variant="outline"
                          showText={true}
                          className="flex-1 sm:flex-initial bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 hover:border-blue-300 px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl transition-all duration-200 flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base"
                        />
                      )}

                      <Button
                        onClick={handleEditOrderRedirect}
                        className="flex-1 sm:flex-initial bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span>Modifier</span>
                      </Button>
                    </>
                  ) : (
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button
                        onClick={onCancel}
                        variant="outline"
                        className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl border-gray-300 text-gray-700 hover:bg-gray-50 text-sm sm:text-base"
                      >
                        Annuler
                      </Button>
                      <Button
                        onClick={handleSave}
                        className="flex-1 sm:flex-initial bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base"
                      >
                        <Save className="w-4 h-4" />
                        <span className="hidden sm:inline">Sauvegarder</span>
                        <span className="sm:hidden">Sauver</span>
                      </Button>
                    </div>
                  )}
              </div>
            </div>

            {/* Séparateur */}
            <div className="border-b border-gray-200"></div>

            <div className="space-y-4 sm:space-y-6 px-4 sm:px-8 py-4 sm:py-6">
          {/* Informations client */}
          <div className="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3 text-left">
              <User className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
              Informations client
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="text-left">
                <label className="block text-sm font-semibold text-gray-800 mb-3 text-left">
                  Nom complet
                </label>
                {isEditing ? (
                  <Input
                    value={`${formData.client?.nom || ''} ${formData.client?.prenom || ''}`.trim()}
                    onChange={(e) => {
                      const names = e.target.value.split(' ');
                      setFormData(prev => ({
                        ...prev,
                        client: {
                          ...prev.client!,
                          nom: names[0] || '',
                          prenom: names.slice(1).join(' ') || ''
                        }
                      }));
                    }}
                    className="bg-white"
                  />
                ) : (
                  <div className="text-left">
                    <span className="text-base font-medium text-gray-900 text-left">{displayOrder.client.nom} {displayOrder.client.prenom || ''}</span>
                  </div>
                )}
              </div>
              <div className="text-left">
                <label className="block text-sm font-semibold text-gray-800 mb-3 text-left">
                  Téléphone
                </label>
                {isEditing ? (
                  <Input
                    value={formData.client?.telephone || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      client: { ...prev.client!, telephone: e.target.value }
                    }))}
                    className="bg-white"
                  />
                ) : (
                  <div className="flex items-start gap-2 text-left">
                    <Phone className="w-4 h-4 text-gray-500 mt-0.5" />
                    <span className="text-base text-gray-900 text-left">{displayOrder.client.telephone || 'Non renseigné'}</span>
                  </div>
                )}
              </div>
              <div className="text-left">
                <label className="block text-sm font-semibold text-gray-800 mb-3 text-left">
                  Email
                </label>
                {isEditing ? (
                  <Input
                    value={formData.client?.email || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      client: { ...prev.client!, email: e.target.value }
                    }))}
                    className="bg-white"
                  />
                ) : (
                  <div className="flex items-start gap-2 text-left">
                    <Mail className="w-4 h-4 text-gray-500 mt-0.5" />
                    <span className="text-base text-gray-900 text-left">{displayOrder.client.email || 'Non renseigné'}</span>
                  </div>
                )}
              </div>
              <div className="text-left">
                <label className="block text-sm font-semibold text-gray-800 mb-3 text-left">
                  Adresse
                </label>
                {isEditing ? (
                  <Input
                    value={`${formData.client?.adresse?.rue || ''}, ${formData.client?.adresse?.ville || ''} ${formData.client?.adresse?.codePostal || ''}`.replace(/^, |, $/, '')}
                    onChange={(e) => {
                      const address = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        client: {
                          ...prev.client!,
                          adresse: { ...prev.client?.adresse, rue: address }
                        }
                      }));
                    }}
                    className="bg-white"
                  />
                ) : (
                  <div className="flex items-start gap-2 text-left">
                    <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                    <span className="text-base text-gray-900 text-left">
                      {displayOrder.client.adresse?.rue ? 
                        `${displayOrder.client.adresse.rue}, ${displayOrder.client.adresse.ville} ${displayOrder.client.adresse.codePostal}` :
                        'Non renseignée'
                      }
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Dates importantes */}
          <div className="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3 text-left">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
              Dates importantes
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="text-left">
                <label className="block text-sm font-semibold text-gray-800 mb-3 text-left">
                  Date de création
                </label>
                <span className="text-base text-gray-900 block text-left">{formatDate(displayOrder.dateCreation)}</span>
              </div>
              <div className="text-left">
                <label className="block text-sm font-semibold text-gray-800 mb-3 text-left">
                  Date de l'événement
                </label>
                <span className="text-base text-gray-900 block text-left">
                  {displayOrder.dateLivraison ? formatDate(displayOrder.dateLivraison) : 'Non définie'}
                </span>
              </div>
              <div className="text-left">
                <label className="block text-sm font-semibold text-gray-800 mb-3 text-left">
                  Date de livraison
                </label>
                <span className="text-base text-gray-900 block text-left">
                  {displayOrder.dateLivraison ? formatDate(new Date(new Date(displayOrder.dateLivraison).getTime() - 24 * 60 * 60 * 1000)) : 'Veille de l\'événement'}
                </span>
              </div>
            </div>
          </div>

          {/* Résumé détaillé de la commande */}
          <div className="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3 text-left">
              <Package className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
              Résumé de la commande
            </h2>
            
            {/* Informations principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="text-left">
                <span className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  {displayOrder.type === 'groupe' ? 'Groupe' : 'Client'}
                </span>
                <p className="font-semibold text-gray-900 text-sm">
                  {displayOrder.type === 'groupe' ? `Groupe ${displayOrder.client.nom}` : `${displayOrder.client.nom} ${displayOrder.client.prenom || ''}`}
                </p>
              </div>
              
              <div className="text-left">
                <span className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  {displayOrder.type === 'groupe' ? 'Participants' : 'Téléphone'}
                </span>
                <p className="font-semibold text-gray-900 text-sm">
                  {displayOrder.type === 'groupe' 
                    ? `${displayOrder.participantCount || 1} personne${(displayOrder.participantCount || 1) > 1 ? 's' : ''}` 
                    : displayOrder.client.telephone || 'Non renseigné'
                  }
                </p>
              </div>
              
              <div className="text-left">
                <span className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Vendeur
                </span>
                <p className="font-semibold text-gray-900 text-sm">{displayOrder.createdBy || 'Non renseigné'}</p>
              </div>
              
              <div className="text-left">
                <span className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Date événement
                </span>
                <p className="font-semibold text-gray-900 text-sm">
                  {displayOrder.dateLivraison ? formatDate(displayOrder.dateLivraison) : 'Non définie'}
                </p>
              </div>
            </div>
            
            {/* Participants pour les groupes */}
            {displayOrder.type === 'groupe' && displayOrder.groupDetails?.participants && displayOrder.groupDetails.participants.length > 1 && (
              <div className="pt-3 border-t border-gray-300">
                <span className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 text-left">
                  Liste des participants
                </span>
                <div className="flex flex-wrap gap-2">
                  {displayOrder.groupDetails.participants.map((participant, index) => (
                    <span key={index} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                      {participant.prenom ? `${participant.nom} ${participant.prenom}` : participant.nom}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Détails des tenues avec statut de rendu */}
            {(() => {
              // Pour les groupes, utiliser les participants existants
              if (displayOrder.groupDetails?.participants && displayOrder.groupDetails.participants.length > 0) {
                return (
                  <div className="pt-3 border-t border-gray-300 mt-3">
                    <span className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 text-left">
                      Pièces de tenue réservées & Statut de rendu
                    </span>
                    <div className="space-y-4 pb-4">
                      {displayOrder.groupDetails.participants.map((participant, index) => (
                    <div key={index} className="bg-white rounded-lg p-3 pb-6 pl-4 text-left border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold text-gray-800 text-left">
                          {participant.prenom ? `${participant.nom} ${participant.prenom}` : participant.nom}
                        </div>
                        {onUpdateParticipantReturn && (
                          <div className="flex items-center gap-3">
                            <span className={`text-sm font-medium ${
                              (displayOrder.status === 'rendu' || displayOrder.status === 'rendue') ? 'text-green-700' : 'text-gray-600'
                            }`}>
                              Article(s) rendu(s)
                            </span>
                            <button
                              onClick={() => {
                                const isOrderReturned = displayOrder.status === 'rendu' || displayOrder.status === 'rendue';
                                const newState = !isOrderReturned;
                                handleLocalParticipantReturn(displayOrder.id, index, newState);
                              }}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                (displayOrder.status === 'rendu' || displayOrder.status === 'rendue')
                                  ? 'bg-green-600 focus:ring-green-500' 
                                  : 'bg-gray-300 focus:ring-gray-400'
                              }`}
                              title={(displayOrder.status === 'rendu' || displayOrder.status === 'rendue') ? 'Marquer comme non rendu' : 'Marquer comme rendu'}
                            >
                              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 shadow-sm ${
                                (displayOrder.status === 'rendu' || displayOrder.status === 'rendue') ? 'translate-x-6' : 'translate-x-1'
                              }`} />
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="space-y-1">
                        {(() => {
                          const pieces = [];

                          // Générer les pièces à partir de participant.tenue
                          if (participant.tenue?.veste) {
                            const reference = formatReference(participant.tenue.veste.reference || '');
                            const taille = participant.tenue.veste.taille || '';
                            const couleur = participant.tenue.veste.couleur || '';
                            const longueurManche = participant.tenue.veste.longueurManche || '';
                            const parts = [reference, taille, couleur, longueurManche].filter(part => part);
                            const notes = participant.tenue.veste.notes || '';
                            pieces.push({ text: `Veste: ${parts.join(' / ')}`, notes });
                          }
                          if (participant.tenue?.gilet) {
                            const reference = formatReference(participant.tenue.gilet.reference || '');
                            const taille = participant.tenue.gilet.taille || '';
                            const couleur = participant.tenue.gilet.couleur || '';
                            const parts = [reference, taille, couleur].filter(part => part);
                            const notes = participant.tenue.gilet.notes || '';
                            pieces.push({ text: `Gilet: ${parts.join(' / ')}`, notes });
                          }
                          if (participant.tenue?.pantalon) {
                            const reference = formatReference(participant.tenue.pantalon.reference || '');
                            const taille = participant.tenue.pantalon.taille || '';
                            const couleur = participant.tenue.pantalon.couleur || '';
                            const longueur = participant.tenue.pantalon.longueur || '';
                            const parts = [reference, taille, couleur, longueur].filter(part => part);
                            const notes = participant.tenue.pantalon.notes || '';
                            pieces.push({ text: `Pantalon: ${parts.join(' / ')}`, notes });
                          }
                          if (participant.tenue?.tailleChapeau) {
                            pieces.push({ text: `Chapeau: ${participant.tenue.tailleChapeau}`, notes: '' });
                          }
                          if (participant.tenue?.tailleChaussures) {
                            const chaussuresText = participant.tenue.chaussuresType
                              ? `${participant.tenue.tailleChaussures} ${participant.tenue.chaussuresType}`
                              : participant.tenue.tailleChaussures;
                            pieces.push({ text: `Chaussures: ${chaussuresText}`, notes: '' });
                          }

                          return pieces.length > 0 ? (
                            pieces.map((piece, pieceIndex) => (
                              <div key={pieceIndex} className="text-sm text-gray-700 text-left pl-3">
                                <span className="text-amber-600 font-medium">•</span>
                                <span className="ml-2">
                                  {piece.text}
                                  {piece.notes && <span className="text-gray-500 italic ml-2">({piece.notes})</span>}
                                </span>
                              </div>
                            ))
                          ) : (
                            <div className="text-sm text-gray-400 text-left pl-3">
                              <span className="text-gray-400">•</span> <span className="ml-2">Aucune pièce spécifiée</span>
                            </div>
                          );
                        })()}
                      </div>
                      {participant.notes && (
                        <div className="mt-2 text-xs text-gray-500 italic text-left pl-3">
                          Note : {participant.notes}
                        </div>
                      )}
                    </div>
                        ))}
                      </div>
                    </div>
                  );
                }

              // Pour les commandes individuelles, créer un participant virtuel
              else if (displayOrder.type === 'individuel' && (displayOrder.items?.length > 0 || displayOrder.articlesStock?.length > 0 || displayOrder.tenue)) {
                const virtualParticipant = {
                  nom: displayOrder.client.nom,
                  prenom: displayOrder.client.prenom,
                  tenue: {},
                  rendu: displayOrder.rendu || false
                };

                // Construire la tenue à partir de displayOrder.tenue ou displayOrder.items ou displayOrder.articlesStock
                if (displayOrder.tenue) {
                  // Utiliser directement displayOrder.tenue s'il existe
                  virtualParticipant.tenue = { ...displayOrder.tenue };
                } else if (displayOrder.items && displayOrder.items.length > 0) {
                  // Construire à partir de displayOrder.items
                  displayOrder.items.forEach(item => {
                    if (item.category === 'veste') {
                      virtualParticipant.tenue.veste = {
                        reference: item.reference,
                        taille: item.measurements?.taille || '',
                        longueurManche: item.measurements?.manches,
                        couleur: item.measurements?.couleur || ''
                      };
                    } else if (item.category === 'gilet') {
                      virtualParticipant.tenue.gilet = {
                        reference: item.reference,
                        taille: item.measurements?.taille || '',
                        couleur: item.measurements?.couleur || ''
                      };
                    } else if (item.category === 'pantalon') {
                      virtualParticipant.tenue.pantalon = {
                        reference: item.reference,
                        taille: item.measurements?.taille || '',
                        longueur: item.measurements?.longueur,
                        couleur: item.measurements?.couleur || ''
                      };
                    } else if (item.category === 'chapeau') {
                      virtualParticipant.tenue.tailleChapeau = item.measurements?.taille || '';
                    } else if (item.category === 'chaussures') {
                      virtualParticipant.tenue.tailleChaussures = item.measurements?.pointure || item.measurements?.taille || '';
                    }
                  });
                } else if (displayOrder.articlesStock && displayOrder.articlesStock.length > 0) {
                  // Construire à partir de displayOrder.articlesStock
                  displayOrder.articlesStock.forEach(item => {
                    if (item.reference && item.reference.includes('jaquette') || item.reference && item.reference.includes('veste')) {
                      virtualParticipant.tenue.veste = {
                        reference: item.reference,
                        taille: item.taille || '',
                        couleur: item.couleur || ''
                      };
                    } else if (item.reference && item.reference.includes('gilet')) {
                      virtualParticipant.tenue.gilet = {
                        reference: item.reference,
                        taille: item.taille || '',
                        couleur: item.couleur || ''
                      };
                    } else if (item.reference && item.reference.includes('pantalon')) {
                      virtualParticipant.tenue.pantalon = {
                        reference: item.reference,
                        taille: item.taille || '',
                        couleur: item.couleur || ''
                      };
                    } else if (item.reference && item.reference.includes('chapeau')) {
                      virtualParticipant.tenue.tailleChapeau = item.taille || '';
                    } else if (item.reference && item.reference.includes('chaussures')) {
                      virtualParticipant.tenue.tailleChaussures = item.taille || '';
                    }
                  });
                }

                return (
                  <div className="pt-3 border-t border-gray-300 mt-3">
                    <span className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 text-left">
                      Pièces de tenue réservées & Statut de rendu
                    </span>
                    <div className="space-y-4 pb-4">
                      <div className="bg-white rounded-lg p-3 pb-6 pl-4 text-left border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-semibold text-gray-800 text-left">
                            {virtualParticipant.prenom ? `${virtualParticipant.nom} ${virtualParticipant.prenom}` : virtualParticipant.nom}
                          </div>
                          {onUpdateParticipantReturn && (
                            <div className="flex items-center gap-3">
                              <span className={`text-sm font-medium ${
                                (displayOrder.status === 'rendu' || displayOrder.status === 'rendue') ? 'text-green-700' : 'text-gray-600'
                              }`}>
                                Article(s) rendu(s) 
                              </span>
                              
                              <button
                                onClick={() => {
                                  const isOrderReturned = displayOrder.status === 'rendu' || displayOrder.status === 'rendue';
                                  const newState = !isOrderReturned;
                                  console.log('🎛️ SWITCH CLICK:', { 
                                    currentStatus: displayOrder.status,
                                    isOrderReturned,
                                    newState,
                                    id: displayOrder.id 
                                  });
                                  handleLocalParticipantReturn(displayOrder.id, 0, newState);
                                }}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                  (displayOrder.status === 'rendu' || displayOrder.status === 'rendue') 
                                    ? 'bg-green-600 focus:ring-green-500' 
                                    : 'bg-gray-300 focus:ring-gray-400'
                                }`}
                                title={(displayOrder.status === 'rendu' || displayOrder.status === 'rendue') ? 'Marquer comme non rendu' : 'Marquer comme rendu'}
                              >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 shadow-sm ${
                                  (displayOrder.status === 'rendu' || displayOrder.status === 'rendue') ? 'translate-x-6' : 'translate-x-1'
                                }`} />
                              </button>
                            </div>
                          )}
                        </div>
                        <div className="space-y-1">
                          {(() => {
                            const pieces = [];

                            // Générer les pièces à partir de virtualParticipant.tenue
                            if (virtualParticipant.tenue?.veste) {
                              const reference = formatReference(virtualParticipant.tenue.veste.reference || '');
                              const taille = virtualParticipant.tenue.veste.taille || '';
                              const couleur = virtualParticipant.tenue.veste.couleur || '';
                              const longueurManche = virtualParticipant.tenue.veste.longueurManche || '';
                              const parts = [reference, taille, couleur, longueurManche].filter(part => part);
                              const notes = virtualParticipant.tenue.veste.notes || '';
                              pieces.push({ text: `Veste: ${parts.join(' / ')}`, notes });
                            }
                            if (virtualParticipant.tenue?.gilet) {
                              const reference = formatReference(virtualParticipant.tenue.gilet.reference || '');
                              const taille = virtualParticipant.tenue.gilet.taille || '';
                              const couleur = virtualParticipant.tenue.gilet.couleur || '';
                              const parts = [reference, taille, couleur].filter(part => part);
                              const notes = virtualParticipant.tenue.gilet.notes || '';
                              pieces.push({ text: `Gilet: ${parts.join(' / ')}`, notes });
                            }
                            if (virtualParticipant.tenue?.pantalon) {
                              const reference = formatReference(virtualParticipant.tenue.pantalon.reference || '');
                              const taille = virtualParticipant.tenue.pantalon.taille || '';
                              const couleur = virtualParticipant.tenue.pantalon.couleur || '';
                              const longueur = virtualParticipant.tenue.pantalon.longueur || '';
                              const parts = [reference, taille, couleur, longueur].filter(part => part);
                              const notes = virtualParticipant.tenue.pantalon.notes || '';
                              pieces.push({ text: `Pantalon: ${parts.join(' / ')}`, notes });
                            }
                            if (virtualParticipant.tenue?.tailleChapeau) {
                              pieces.push({ text: `Chapeau: ${virtualParticipant.tenue.tailleChapeau}`, notes: '' });
                            }
                            if (virtualParticipant.tenue?.tailleChaussures) {
                              const chaussuresText = virtualParticipant.tenue.chaussuresType
                                ? `${virtualParticipant.tenue.tailleChaussures} ${virtualParticipant.tenue.chaussuresType}`
                                : virtualParticipant.tenue.tailleChaussures;
                              pieces.push({ text: `Chaussures: ${chaussuresText}`, notes: '' });
                            }

                            return pieces.length > 0 ? (
                              pieces.map((piece, pieceIndex) => (
                                <div key={pieceIndex} className="text-sm text-gray-700 text-left pl-3">
                                  <span className="text-amber-600 font-medium">•</span>
                                  <span className="ml-2">
                                    {piece.text}
                                    {piece.notes && <span className="text-gray-500 italic ml-2">({piece.notes})</span>}
                                  </span>
                                </div>
                              ))
                            ) : (
                              <div className="text-sm text-gray-400 text-left pl-3">
                                <span className="text-gray-400">•</span> <span className="ml-2">Aucune pièce spécifiée</span>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              return null;
            })()}
          </div>


          {/* Tarification */}
          {((displayOrder.sousTotal && displayOrder.sousTotal > 0) || (displayOrder.tva && displayOrder.tva > 0) || (displayOrder.total && displayOrder.total > 0)) && (
            <div className="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3 text-left">
                <Euro className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
                Tarification
              </h2>
              <div className="space-y-3">
                {displayOrder.sousTotal && displayOrder.sousTotal > 0 && (
                  <div className="flex justify-between text-left">
                    <span className="text-gray-700 text-left">Sous-total:</span>
                    <span className="font-medium text-right">{formatPrice(displayOrder.sousTotal)}</span>
                  </div>
                )}
                {displayOrder.tva && displayOrder.tva > 0 && (
                  <div className="flex justify-between text-left">
                    <span className="text-gray-700 text-left">TVA:</span>
                    <span className="font-medium text-right">{formatPrice(displayOrder.tva)}</span>
                  </div>
                )}
                {displayOrder.total && displayOrder.total > 0 && (
                  <div className="flex justify-between border-t border-gray-200 pt-2 text-left">
                    <span className="font-semibold text-gray-900 text-left">Total:</span>
                    <span className="font-bold text-base text-amber-600 text-right">{formatPrice(displayOrder.total)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3 text-left">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
              Notes
            </h2>
            {isEditing ? (
              <Textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Ajouter des notes sur cette commande..."
                className="bg-white min-h-[100px] text-left"
              />
            ) : (
              <div className="text-base text-gray-900 whitespace-pre-wrap text-left">
                {displayOrder.notes || 'Aucune note'}
              </div>
            )}
          </div>

          {/* Ajouter à une liste */}
          {!isEditing && lists.length > 0 && (
            <div className="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3 text-left">
                <FolderPlus className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
                Listes
              </h2>
              <div className="flex flex-wrap gap-2">
                {lists.map((list) => {
                  const isSelected = isInList(list._id);
                  return (
                    <button
                      key={list._id}
                      onClick={() => handleToggleList(list._id)}
                      disabled={addToListMutation.isPending || removeFromListMutation.isPending}
                      className={`
                        inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                        ${isSelected
                          ? 'bg-amber-100 text-amber-800 border-2 border-amber-400 hover:bg-amber-200'
                          : 'bg-white text-gray-700 border border-gray-300 hover:border-amber-400 hover:bg-amber-50'
                        }
                        disabled:opacity-50 disabled:cursor-not-allowed
                      `}
                    >
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: list.color || '#f59e0b' }}
                      />
                      <span>{list.name}</span>
                      {isSelected && <Check className="w-4 h-4 text-amber-600" />}
                    </button>
                  );
                })}
              </div>
              {lists.length === 0 && (
                <p className="text-sm text-gray-500">
                  Aucune liste créée. Créez une liste depuis l'onglet "Listes".
                </p>
              )}
            </div>
          )}

          {/* Bouton de suppression */}
          {onDelete && !isEditing && (
            <div className="border-t border-gray-200 pt-6 mt-6 flex justify-center">
              <Button
                onClick={handleDelete}
                variant="ghost"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors duration-200 flex items-center gap-2 text-sm"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Supprimer ce bon de commande</span>
              </Button>
            </div>
          )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}