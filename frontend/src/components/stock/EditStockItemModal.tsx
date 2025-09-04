import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StockItem, UpdateStockItemData } from '@/types/stock';
import { Edit, AlertTriangle } from 'lucide-react';

interface EditStockItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (itemId: string, data: UpdateStockItemData) => Promise<void>;
  item: StockItem | null;
}

export function EditStockItemModal({ isOpen, onClose, onSubmit, item }: EditStockItemModalProps) {
  const [formData, setFormData] = useState<UpdateStockItemData>({
    quantiteStock: 0,
    seuilAlerte: 0,
    couleur: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Remplir le formulaire quand l'item change
  useEffect(() => {
    if (item) {
      setFormData({
        quantiteStock: item.quantiteStock,
        seuilAlerte: item.seuilAlerte,
        couleur: item.couleur || ''
      });
    }
  }, [item]);

  const handleInputChange = (field: keyof UpdateStockItemData, value: string | number) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const resetForm = () => {
    setFormData({
      quantiteStock: item?.quantiteStock || 0,
      seuilAlerte: item?.seuilAlerte || 0,
      couleur: item?.couleur || ''
    });
    setError('');
    setIsSubmitting(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;

    setError('');

    // Validation
    if (formData.quantiteStock !== undefined && formData.quantiteStock < 0) {
      setError('La quantité en stock ne peut pas être négative');
      return;
    }

    if (formData.seuilAlerte !== undefined && formData.seuilAlerte < 0) {
      setError('Le seuil d\'alerte ne peut pas être négatif');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(item.id, formData);
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la modification de l\'article');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!item) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Modifier l'article"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-3">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        {/* Informations non modifiables */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">Informations de l'article</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-600">Catégorie:</span>
              <span className="ml-2 font-medium text-gray-900 capitalize">{item.category}</span>
            </div>
            {item.subCategory && (
              <div>
                <span className="text-gray-600">Sous-catégorie:</span>
                <span className="ml-2 font-medium text-gray-900">{item.subCategory}</span>
              </div>
            )}
            <div>
              <span className="text-gray-600">Référence:</span>
              <span className="ml-2 font-medium text-gray-900">{item.reference}</span>
            </div>
            <div>
              <span className="text-gray-600">Taille:</span>
              <span className="ml-2 font-medium text-gray-900">{item.taille}</span>
            </div>
            <div>
              <span className="text-gray-600">Quantité réservée:</span>
              <span className="ml-2 font-medium text-gray-900">{item.quantiteReservee}</span>
            </div>
            <div>
              <span className="text-gray-600">Quantité disponible:</span>
              <span className="ml-2 font-medium text-gray-900">{item.quantiteDisponible}</span>
            </div>
          </div>
        </div>

        {/* Champs modifiables */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="couleur" className="text-sm font-semibold text-gray-700 mb-2 block">
              Couleur
            </Label>
            <Input
              id="couleur"
              type="text"
              value={formData.couleur || ''}
              onChange={(e) => handleInputChange('couleur', e.target.value)}
              className="bg-white/70 border-gray-300 text-gray-900 focus:border-amber-500 focus:ring-amber-500/20 rounded-xl transition-all shadow-sm"
              placeholder="Couleur de l'article"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quantiteStock" className="text-sm font-semibold text-gray-700 mb-2 block">
                Quantité en stock
              </Label>
              <Input
                id="quantiteStock"
                type="number"
                min="0"
                value={formData.quantiteStock || ''}
                onChange={(e) => handleInputChange('quantiteStock', parseInt(e.target.value) || 0)}
                className="bg-white/70 border-gray-300 text-gray-900 focus:border-amber-500 focus:ring-amber-500/20 rounded-xl transition-all shadow-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                ⚠️ Attention: modifier cette valeur peut affecter la disponibilité
              </p>
            </div>

            <div>
              <Label htmlFor="seuilAlerte" className="text-sm font-semibold text-gray-700 mb-2 block">
                Seuil d'alerte
              </Label>
              <Input
                id="seuilAlerte"
                type="number"
                min="0"
                value={formData.seuilAlerte || ''}
                onChange={(e) => handleInputChange('seuilAlerte', parseInt(e.target.value) || 0)}
                className="bg-white/70 border-gray-300 text-gray-900 focus:border-amber-500 focus:ring-amber-500/20 rounded-xl transition-all shadow-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Déclenche une alerte quand le stock descend à ce niveau
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-6 bg-white/70 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl transition-all shadow-sm"
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Modification...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Edit className="w-4 h-4" />
                Sauvegarder
              </div>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}