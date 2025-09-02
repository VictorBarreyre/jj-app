import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DynamicProductSelector } from './DynamicProductSelector';
import { ArticleCategory, CreateStockItemData } from '@/types/stock';
import { Plus, AlertTriangle } from 'lucide-react';

interface AddStockItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateStockItemData) => Promise<void>;
  defaultCategory?: ArticleCategory;
}

export function AddStockItemModal({ isOpen, onClose, onSubmit, defaultCategory }: AddStockItemModalProps) {
  const [formData, setFormData] = useState<Partial<CreateStockItemData>>({
    category: defaultCategory,
    reference: '',
    taille: '',
    couleur: '',
    quantiteStock: 1,
    seuilAlerte: 2
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const categories: { value: ArticleCategory; label: string }[] = [
    { value: 'veste', label: 'Veste' },
    { value: 'gilet', label: 'Gilet' },
    { value: 'pantalon', label: 'Pantalon' },
    { value: 'accessoire', label: 'Accessoire' }
  ];

  const handleCategoryChange = (category: ArticleCategory) => {
    setFormData({
      ...formData,
      category,
      reference: '',
      taille: '',
      couleur: ''
    });
  };

  const handleReferenceChange = (referenceId: string) => {
    setFormData({
      ...formData,
      reference: referenceId,
      taille: '',
      couleur: ''
    });
  };

  const handleSizeChange = (size: string) => {
    setFormData({
      ...formData,
      taille: size
    });
  };

  const handleColorChange = (color: string) => {
    setFormData({
      ...formData,
      couleur: color
    });
  };

  const handleInputChange = (field: keyof CreateStockItemData, value: string | number) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const resetForm = () => {
    setFormData({
      category: defaultCategory,
      reference: '',
      taille: '',
      couleur: '',
      quantiteStock: 1,
      seuilAlerte: 2
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
    setError('');

    // Validation
    if (!formData.category || !formData.reference || !formData.taille) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (formData.quantiteStock! <= 0) {
      setError('La quantité en stock doit être supérieure à 0');
      return;
    }


    setIsSubmitting(true);
    try {
      await onSubmit(formData as CreateStockItemData);
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création de l\'article');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.category && formData.reference && formData.taille && formData.quantiteStock! > 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Ajouter un nouvel article"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-3">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        {/* Sélection de catégorie */}
        <div>
          <Label htmlFor="category" className="text-sm font-semibold text-gray-700 mb-2 block">
            Catégorie *
          </Label>
          <Select
            value={formData.category || ''}
            onValueChange={handleCategoryChange}
          >
            <SelectTrigger className="bg-white/70 border-gray-300 text-gray-900 focus:border-amber-500 hover:bg-white/90 transition-all shadow-sm rounded-xl">
              <SelectValue placeholder="Sélectionner une catégorie" />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-300 text-gray-900">
              {categories.map(cat => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sélection dynamique du produit */}
        {formData.category && (
          <div>
            <Label className="text-sm font-semibold text-gray-700 mb-2 block">
              Référence et taille *
            </Label>
            <DynamicProductSelector
              category={formData.category}
              selectedReference={formData.reference}
              selectedSize={formData.taille}
              selectedColor={formData.couleur}
              onReferenceChange={handleReferenceChange}
              onSizeChange={handleSizeChange}
              onColorChange={handleColorChange}
            />
          </div>
        )}

        {/* Informations de stock */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="quantiteStock" className="text-sm font-semibold text-gray-700 mb-2 block">
              Quantité en stock *
            </Label>
            <Input
              id="quantiteStock"
              type="number"
              min="1"
              value={formData.quantiteStock || ''}
              onChange={(e) => handleInputChange('quantiteStock', parseInt(e.target.value) || 0)}
              className="bg-white/70 border-gray-300 text-gray-900 focus:border-amber-500 focus:ring-amber-500/20 rounded-xl transition-all shadow-sm"
              required
            />
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
            disabled={!isFormValid || isSubmitting}
            className="px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Ajout...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Ajouter l'article
              </div>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}