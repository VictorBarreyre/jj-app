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
  Users,
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
}

export function OrderViewEditModal({ 
  isOpen, 
  onClose, 
  order, 
  isEditing, 
  onEdit, 
  onSave, 
  onCancel 
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

  const getTypeIcon = (type: Order['type']) => {
    return type === 'groupe' ? <Users className="w-4 h-4" /> : <User className="w-4 h-4" />;
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


  return (
    <div className={`fixed inset-0 z-50 overflow-y-auto ${isOpen ? 'block' : 'hidden'}`}>
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
          <div className="max-h-[80vh] overflow-y-scroll scrollbar-none">
            {/* Header personnalisé avec titre, statut et actions */}
            <div className="px-8 py-6">
              <div className="flex items-center justify-between pl-4">
                {/* Titre avec statut */}
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-gray-900">Commande #{order.numero}</h2>
                  <Badge className={`${getStatusColor(order.status)} border text-sm font-semibold`}>
                    {getStatusLabel(order.status)}
                  </Badge>
                </div>
                
                {/* Actions à droite */}
                <div className="flex items-center gap-2">
                  {!isEditing ? (
                    <Button 
                      onClick={onEdit}
                      className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
                    >
                      Modifier
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button 
                        onClick={onCancel}
                        variant="outline"
                        className="px-4 py-2 rounded-xl border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        Annuler
                      </Button>
                      <Button 
                        onClick={handleSave}
                        className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        Sauvegarder
                      </Button>
                    </div>
                  )}
                  <Button 
                    onClick={onClose} 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 ml-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Métadonnées sous le titre */}
              <div className="flex items-center gap-4 mt-4 pl-4">
                <div className="text-xs text-gray-500 space-y-1 text-left">
                  <div className="text-left">Créée le {formatDate(order.dateCreation)}</div>
                  {order.updatedAt && (
                    <div className="text-left">Modifiée le {formatDate(order.updatedAt)}</div>
                  )}
                  {order.createdBy && (
                    <div className="text-left">Par {order.createdBy}</div>
                  )}
                </div>
                
                {/* Icône de type */}
                <div className="flex items-center">
                  {getTypeIcon(order.type)}
                </div>
              </div>
            </div>

            {/* Séparateur */}
            <div className="border-b border-gray-200"></div>

            <div className="space-y-6 px-8 py-6">
          {/* Informations client */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-3 text-left">
              <User className="w-6 h-6 text-amber-600" />
              Informations client
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-left">
                <label className="block text-sm font-semibold text-gray-800 mb-2 text-left">
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
                  <div className="flex items-start gap-2 text-left">
                    <span className="text-base font-medium text-gray-900 text-left">{order.client.nom} {order.client.prenom || ''}</span>
                  </div>
                )}
              </div>
              <div className="text-left">
                <label className="block text-sm font-semibold text-gray-800 mb-2 text-left">
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
                <label className="block text-sm font-semibold text-gray-800 mb-2 text-left">
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
                <label className="block text-sm font-semibold text-gray-800 mb-2 text-left">
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
          <div className="bg-gray-50 rounded-xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-3 text-left">
              <Calendar className="w-6 h-6 text-amber-600" />
              Dates importantes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-left">
                <label className="block text-sm font-semibold text-gray-800 mb-2 text-left">
                  Date de création
                </label>
                <span className="text-base text-gray-900 block text-left">{formatDate(order.dateCreation)}</span>
              </div>
              <div className="text-left">
                <label className="block text-sm font-semibold text-gray-800 mb-2 text-left">
                  Date de livraison prévue
                </label>
                {isEditing ? (
                  <Input
                    type="date"
                    value={formData.dateLivraison ? new Date(formData.dateLivraison).toISOString().split('T')[0] : ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      dateLivraison: e.target.value ? new Date(e.target.value) : undefined
                    }))}
                    className="bg-white text-left"
                  />
                ) : (
                  <span className="text-base text-gray-900 block text-left">
                    {order.dateLivraison ? formatDate(order.dateLivraison) : 'Non définie'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Articles commandés */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-3 text-left">
              <Package className="w-6 h-6 text-amber-600" />
              Articles commandés ({order.items.length})
            </h2>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2 mb-1 text-left">
                        <h4 className="font-medium text-gray-900 capitalize text-left">
                          {item.category === 'stock' ? 'Article de stock' : item.category}
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          x{item.quantity}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 font-medium mb-1 text-left">{item.reference}</p>
                      
                      {/* Affichage des mesures/tailles */}
                      {item.measurements && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {Object.entries(item.measurements).map(([key, value]) => (
                            <span key={key} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-amber-100 text-amber-800">
                              <strong className="mr-1 capitalize">
                                {key === 'taille' ? 'Taille' : 
                                 key === 'pointure' ? 'Pointure' : key}:
                              </strong>
                              {value}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      {item.unitPrice && (
                        <div className="text-sm font-semibold text-gray-900">{formatPrice(item.unitPrice)}</div>
                      )}
                      {item.unitPrice && item.quantity > 1 && (
                        <div className="text-xs text-gray-500">
                          {formatPrice(item.unitPrice * item.quantity)} total
                        </div>
                      )}
                    </div>
                  </div>
                  {item.notes && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-700">
                      <strong>Notes:</strong> {item.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Tarification */}
          {(order.sousTotal || order.tva || order.total) && (
            <div className="bg-gray-50 rounded-xl p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-3 text-left">
                <Euro className="w-6 h-6 text-amber-600" />
                Tarification
              </h2>
              <div className="space-y-2">
                {order.sousTotal && (
                  <div className="flex justify-between text-left">
                    <span className="text-gray-700 text-left">Sous-total:</span>
                    <span className="font-medium text-right">{formatPrice(order.sousTotal)}</span>
                  </div>
                )}
                {order.tva && (
                  <div className="flex justify-between text-left">
                    <span className="text-gray-700 text-left">TVA:</span>
                    <span className="font-medium text-right">{formatPrice(order.tva)}</span>
                  </div>
                )}
                {order.total && (
                  <div className="flex justify-between border-t border-gray-200 pt-2 text-left">
                    <span className="font-semibold text-gray-900 text-left">Total:</span>
                    <span className="font-bold text-lg text-amber-600 text-right">{formatPrice(order.total)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-3 text-left">
              <FileText className="w-6 h-6 text-amber-600" />
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