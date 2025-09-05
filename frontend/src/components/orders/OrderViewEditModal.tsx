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

          {/* Informations du groupe/cérémonie */}
          <div className="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3 text-left">
              {order.type === 'groupe' ? (
                <>
                  <Package className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
                  Informations du groupe
                </>
              ) : (
                <>
                  <User className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
                  Détails de la commande
                </>
              )}
            </h2>
            
            {/* Résumé de la commande */}
            {order.type === 'groupe' ? (
              <div className="space-y-4">
                {/* Statistiques du groupe */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-amber-200">
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <p className="text-sm text-gray-600">Participants</p>
                        <p className="text-2xl font-bold text-amber-600">
                          {order.items?.filter(item => item.category !== 'stock').length || 1}
                        </p>
                      </div>
                      <User className="w-8 h-8 text-amber-400" />
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <p className="text-sm text-gray-600">Articles total</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {order.items?.reduce((total, item) => total + (item.quantity || 1), 0) || 0}
                        </p>
                      </div>
                      <Package className="w-8 h-8 text-blue-400" />
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 border border-green-200">
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <p className="text-sm text-gray-600">Montant total</p>
                        <p className="text-2xl font-bold text-green-600">
                          {formatPrice(order.total)}
                        </p>
                      </div>
                      <Euro className="w-8 h-8 text-green-400" />
                    </div>
                  </div>
                </div>

                {/* Détails de l'événement */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3 text-left">Détails de l'événement</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="text-left">
                      <p className="text-sm text-gray-600 mb-1">Type d'événement</p>
                      <p className="text-base font-medium text-gray-900">Cérémonie de groupe</p>
                    </div>
                    <div className="text-left">
                      <p className="text-sm text-gray-600 mb-1">Date de l'événement</p>
                      <p className="text-base font-medium text-gray-900">
                        {order.dateLivraison ? formatDate(order.dateLivraison) : 'Non définie'}
                      </p>
                    </div>
                    <div className="text-left">
                      <p className="text-sm text-gray-600 mb-1">Responsable du groupe</p>
                      <p className="text-base font-medium text-gray-900">{order.client.nom} {order.client.prenom || ''}</p>
                    </div>
                    <div className="text-left">
                      <p className="text-sm text-gray-600 mb-1">Contact</p>
                      <p className="text-base font-medium text-gray-900">{order.client.telephone || 'Non renseigné'}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Statistiques de la commande individuelle */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-amber-200">
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <p className="text-sm text-gray-600">Articles de tenue</p>
                        <p className="text-2xl font-bold text-amber-600">
                          {order.items?.filter(item => item.category !== 'stock').length || 0}
                        </p>
                      </div>
                      <User className="w-8 h-8 text-amber-400" />
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <p className="text-sm text-gray-600">Articles de stock</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {order.items?.filter(item => item.category === 'stock').reduce((total, item) => total + (item.quantity || 1), 0) || 0}
                        </p>
                      </div>
                      <Package className="w-8 h-8 text-blue-400" />
                    </div>
                  </div>
                </div>

                {/* Résumé de la tenue */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3 text-left">Résumé de la tenue</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {['veste', 'gilet', 'pantalon', 'chaussures'].map(category => {
                      const item = order.items?.find(item => item.category === category);
                      return (
                        <div key={category} className="text-center p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-600 mb-1 capitalize">{category}</p>
                          {item ? (
                            <div>
                              <p className="text-sm font-medium text-gray-900">{item.reference}</p>
                              {item.measurements?.taille && (
                                <p className="text-xs text-gray-500">T.{item.measurements.taille}</p>
                              )}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-400">Non sélectionné</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
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
                    <span className="font-bold text-lg text-amber-600 text-right">{formatPrice(order.total)}</span>
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