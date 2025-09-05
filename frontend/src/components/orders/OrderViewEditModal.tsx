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
  X
} from 'lucide-react';
import { Order, OrderItem } from '@/types/order';
import { RentalContract } from '@/types/rental-contract';

interface OrderViewEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (updatedOrder: Partial<Order>) => Promise<void>;
  onCancel: () => void;
  onEditOrder?: (order: Order) => void; // Nouvelle prop pour rediriger vers le formulaire
}

export function OrderViewEditModal({ 
  isOpen, 
  onClose, 
  order, 
  isEditing, 
  onEdit, 
  onSave, 
  onCancel,
  onEditOrder 
}: OrderViewEditModalProps) {
  const [formData, setFormData] = useState<Partial<Order>>({});

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

  if (!order) return null;

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'commandee': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'livree': return 'bg-green-100 text-green-800 border-green-200';
      case 'rendue': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: Order['status']) => {
    switch (status) {
      case 'commandee': return 'Commandée';
      case 'livree': return 'Livrée';
      case 'rendue': return 'Rendue';
      default: return status;
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
    console.log('Edit item:', itemId);
    // La fonctionnalité d'édition est maintenant gérée au niveau de la page Home
  };

  const handleEditOrderRedirect = () => {
    if (order && onEditOrder) {
      onClose(); // Fermer la modal
      onEditOrder(order); // Rediriger vers le formulaire
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) return;
    
    try {
      // Supprimer l'article de la liste locale
      const updatedItems = formData.items?.filter(item => item.id !== itemId) || order.items.filter(item => item.id !== itemId);
      setFormData(prev => ({
        ...prev,
        items: updatedItems
      }));
      
      // TODO: Appeler l'API pour mettre à jour le backend et les stocks
      console.log('Delete item:', itemId);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
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
              <div className="flex items-start sm:items-center justify-between pl-2 sm:pl-4">
                {/* Titre avec statut */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate text-left">Commande #{order.numero}</h2>
                  <Badge className={`${getStatusColor(order.status)} border text-xs sm:text-sm font-semibold self-start`}>
                    {getStatusLabel(order.status)}
                  </Badge>
                </div>
                
                {/* Bouton fermer seulement */}
                <div className="flex items-center flex-shrink-0">
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

              {/* Métadonnées sous le titre avec boutons d'action */}
              <div className="mt-3 sm:mt-4 pl-2 sm:pl-4 flex justify-between items-end">
                <div className="text-xs sm:text-xs text-gray-500 space-y-1 text-left">
                  <div className="text-left">Créée le {formatDate(order.dateCreation)}</div>
                  {order.updatedAt && (
                    <div className="text-left">Modifiée le {formatDate(order.updatedAt)}</div>
                  )}
                  {order.createdBy && (
                    <div className="text-left">Par {order.createdBy}</div>
                  )}
                </div>
                
                {/* Boutons d'action en bas à droite */}
                <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                  {!isEditing ? (
                    <Button 
                      onClick={handleEditOrderRedirect}
                      className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-1 sm:gap-2 text-sm sm:text-base"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>Modifier</span>
                    </Button>
                  ) : (
                    <div className="flex gap-1 sm:gap-2">
                      <Button 
                        onClick={onCancel}
                        variant="outline"
                        className="px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl border-gray-300 text-gray-700 hover:bg-gray-50 text-sm sm:text-base"
                      >
                        Annuler
                      </Button>
                      <Button 
                        onClick={handleSave}
                        className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-1 sm:gap-2 text-sm sm:text-base"
                      >
                        <Save className="w-4 h-4" />
                        <span className="hidden sm:inline">Sauvegarder</span>
                        <span className="sm:hidden">Sauver</span>
                      </Button>
                    </div>
                  )}
                </div>
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
                    <span className="text-base font-medium text-gray-900 text-left">{order.client.nom} {order.client.prenom || ''}</span>
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
                    <span className="text-base text-gray-900 text-left">{order.client.telephone || 'Non renseigné'}</span>
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
                    <span className="text-base text-gray-900 text-left">{order.client.email || 'Non renseigné'}</span>
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
                      {order.client.adresse?.rue ? 
                        `${order.client.adresse.rue}, ${order.client.adresse.ville} ${order.client.adresse.codePostal}` :
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
                <span className="text-base text-gray-900 block text-left">{formatDate(order.dateCreation)}</span>
              </div>
              <div className="text-left">
                <label className="block text-sm font-semibold text-gray-800 mb-3 text-left">
                  Date de l'événement
                </label>
                <span className="text-base text-gray-900 block text-left">
                  {order.dateLivraison ? formatDate(order.dateLivraison) : 'Non définie'}
                </span>
              </div>
              <div className="text-left">
                <label className="block text-sm font-semibold text-gray-800 mb-3 text-left">
                  Date de livraison
                </label>
                <span className="text-base text-gray-900 block text-left">
                  {order.dateLivraison ? formatDate(new Date(new Date(order.dateLivraison).getTime() - 24 * 60 * 60 * 1000)) : 'Veille de l\'événement'}
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
                  {order.type === 'groupe' ? 'Groupe' : 'Client'}
                </span>
                <p className="font-semibold text-gray-900 text-sm">
                  {order.type === 'groupe' ? `Groupe ${order.client.nom}` : `${order.client.nom} ${order.client.prenom || ''}`}
                </p>
              </div>
              
              <div className="text-left">
                <span className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  {order.type === 'groupe' ? 'Participants' : 'Téléphone'}
                </span>
                <p className="font-semibold text-gray-900 text-sm">
                  {order.type === 'groupe' 
                    ? `${order.participantCount || 1} personne${(order.participantCount || 1) > 1 ? 's' : ''}` 
                    : order.client.telephone || 'Non renseigné'
                  }
                </p>
              </div>
              
              <div className="text-left">
                <span className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Vendeur
                </span>
                <p className="font-semibold text-gray-900 text-sm">{order.createdBy || 'Non renseigné'}</p>
              </div>
              
              <div className="text-left">
                <span className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Date événement
                </span>
                <p className="font-semibold text-gray-900 text-sm">
                  {order.dateLivraison ? formatDate(order.dateLivraison) : 'Non définie'}
                </p>
              </div>
            </div>
            
            {/* Participants pour les groupes */}
            {order.type === 'groupe' && order.groupDetails?.participants && order.groupDetails.participants.length > 1 && (
              <div className="pt-3 border-t border-gray-300">
                <span className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 text-left">
                  Liste des participants
                </span>
                <div className="flex flex-wrap gap-2">
                  {order.groupDetails.participants.map((participant, index) => (
                    <span key={index} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                      {participant.nom}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Détails des tenues */}
            {order.groupDetails?.participants && order.groupDetails.participants.length > 0 && (
              <div className="pt-3 border-t border-gray-300 mt-3">
                <span className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 text-left">
                  Pièces de tenue réservées
                </span>
                <div className="space-y-4">
                  {order.groupDetails.participants.map((participant, index) => (
                    <div key={index} className="bg-white rounded-lg p-3 text-left border border-gray-200">
                      <div className="font-semibold text-gray-800 text-left mb-2">
                        {order.groupDetails!.participants.length > 1 ? participant.nom : 'Tenue sélectionnée'}
                      </div>
                      <div className="space-y-1">
                        {participant.pieces && participant.pieces.length > 0 ? (
                          participant.pieces.map((piece, pieceIndex) => (
                            <div key={pieceIndex} className="text-sm text-gray-700 text-left pl-3">
                              <span className="text-amber-600 font-medium">•</span> <span className="ml-2">{piece}</span>
                            </div>
                          ))
                        ) : (
                          <div className="text-sm text-gray-400 text-left pl-3">
                            <span className="text-gray-400">•</span> <span className="ml-2">Aucune pièce spécifiée</span>
                          </div>
                        )}
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
            )}
          </div>


          {/* Tarification */}
          {((order.sousTotal && order.sousTotal > 0) || (order.tva && order.tva > 0) || (order.total && order.total > 0)) && (
            <div className="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3 text-left">
                <Euro className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
                Tarification
              </h2>
              <div className="space-y-3">
                {order.sousTotal && order.sousTotal > 0 && (
                  <div className="flex justify-between text-left">
                    <span className="text-gray-700 text-left">Sous-total:</span>
                    <span className="font-medium text-right">{formatPrice(order.sousTotal)}</span>
                  </div>
                )}
                {order.tva && order.tva > 0 && (
                  <div className="flex justify-between text-left">
                    <span className="text-gray-700 text-left">TVA:</span>
                    <span className="font-medium text-right">{formatPrice(order.tva)}</span>
                  </div>
                )}
                {order.total && order.total > 0 && (
                  <div className="flex justify-between border-t border-gray-200 pt-2 text-left">
                    <span className="font-semibold text-gray-900 text-left">Total:</span>
                    <span className="font-bold text-base text-amber-600 text-right">{formatPrice(order.total)}</span>
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
                {order.notes || 'Aucune note'}
              </div>
            )}
          </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}