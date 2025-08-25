import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';
import { StockItem } from '@/types/stock';
import { Trash2, AlertTriangle, Package } from 'lucide-react';

interface DeleteStockItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (itemId: string) => Promise<void>;
  item: StockItem | null;
}

export function DeleteStockItemModal({ isOpen, onClose, onConfirm, item }: DeleteStockItemModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleClose = () => {
    setError('');
    setIsDeleting(false);
    onClose();
  };

  const handleConfirm = async () => {
    if (!item) return;

    setError('');
    setIsDeleting(true);
    
    try {
      await onConfirm(item.id);
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!item) return null;

  // Vérifier si l'article peut être supprimé
  const canDelete = item.quantiteReservee === 0;
  const hasStock = item.quantiteStock > 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Supprimer un article"
      size="md"
    >
      <div className="space-y-6">
        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-3">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        {/* Informations de l'article */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border">
          <div className="flex items-start gap-3">
            <div className="bg-gradient-to-br from-gray-500 to-gray-600 p-2 rounded-lg shadow-md">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{item.reference}</h3>
              <p className="text-sm text-gray-600">
                {item.category} • {item.taille}
                {item.couleur && ` • ${item.couleur}`}
              </p>
              <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-gray-500">Stock:</span>
                  <span className="ml-1 font-semibold text-gray-900">{item.quantiteStock}</span>
                </div>
                <div>
                  <span className="text-gray-500">Réservé:</span>
                  <span className="ml-1 font-semibold text-gray-900">{item.quantiteReservee}</span>
                </div>
                <div>
                  <span className="text-gray-500">Disponible:</span>
                  <span className="ml-1 font-semibold text-gray-900">{item.quantiteDisponible}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Message d'avertissement */}
        {!canDelete ? (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 border border-red-200">
            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-red-800">Impossible de supprimer cet article</h4>
              <p className="text-sm text-red-700 mt-1">
                Cet article ne peut pas être supprimé car <strong>{item.quantiteReservee} unité(s)</strong> 
                {item.quantiteReservee > 1 ? ' sont actuellement réservées' : ' est actuellement réservée'}.
              </p>
              <p className="text-xs text-red-600 mt-2">
                Attendez que toutes les réservations soient terminées avant de supprimer cet article.
              </p>
            </div>
          </div>
        ) : hasStock ? (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200">
            <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-amber-800">Attention</h4>
              <p className="text-sm text-amber-700 mt-1">
                Vous êtes sur le point de supprimer un article qui a <strong>{item.quantiteStock} unité(s)</strong> en stock.
                Cette action est <strong>irréversible</strong>.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 border border-blue-200">
            <AlertTriangle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-blue-800">Confirmation</h4>
              <p className="text-sm text-blue-700 mt-1">
                Êtes-vous sûr de vouloir supprimer cet article ? Cette action est <strong>irréversible</strong>.
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isDeleting}
            className="px-6 bg-white/70 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl transition-all shadow-sm"
          >
            Annuler
          </Button>
          
          {canDelete && (
            <Button
              onClick={handleConfirm}
              disabled={isDeleting}
              className="px-6 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Suppression...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  Supprimer
                </div>
              )}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}