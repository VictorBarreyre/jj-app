import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArticleCategory } from '@/types/stock';
import { Loader2 } from 'lucide-react';

interface ProductReference {
  id: string;
  name: string;
  subCategory: string;
  colors: string[];
  basePrice: number;
  availableSizes: string[];
}

interface ProductSizeInfo {
  referenceId: string;
  name: string;
  category: string;
  subCategory: string;
  colors: string[];
  sizes: string[];
  basePrice: number;
}

interface DynamicProductSelectorProps {
  category: ArticleCategory;
  selectedReference?: string;
  selectedSize?: string;
  selectedColor?: string;
  onReferenceChange: (referenceId: string) => void;
  onSizeChange: (size: string) => void;
  onColorChange?: (color: string) => void;
}

export function DynamicProductSelector({
  category,
  selectedReference,
  selectedSize,
  selectedColor,
  onReferenceChange,
  onSizeChange,
  onColorChange
}: DynamicProductSelectorProps) {
  const [references, setReferences] = useState<ProductReference[]>([]);
  const [sizeInfo, setSizeInfo] = useState<ProductSizeInfo | null>(null);
  const [loadingReferences, setLoadingReferences] = useState(false);
  const [loadingSizes, setLoadingSizes] = useState(false);

  // Charger les références pour la catégorie
  useEffect(() => {
    const fetchReferences = async () => {
      setLoadingReferences(true);
      try {
        const response = await fetch(`/api/stock/references/${category}`);
        if (response.ok) {
          const data = await response.json();
          setReferences(data.references || []);
        } else {
          console.error('Erreur lors du chargement des références');
        }
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoadingReferences(false);
      }
    };

    if (category) {
      fetchReferences();
    }
  }, [category]);

  // Charger les tailles pour la référence sélectionnée
  useEffect(() => {
    const fetchSizes = async () => {
      if (!selectedReference) {
        setSizeInfo(null);
        return;
      }

      setLoadingSizes(true);
      try {
        const response = await fetch(`/api/stock/sizes-for-reference/${selectedReference}`);
        if (response.ok) {
          const data = await response.json();
          setSizeInfo(data);
        } else {
          console.error('Erreur lors du chargement des tailles');
        }
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoadingSizes(false);
      }
    };

    fetchSizes();
  }, [selectedReference]);

  // Reset selections quand la catégorie change
  useEffect(() => {
    setSizeInfo(null);
  }, [category]);

  return (
    <div className="space-y-4">
      {/* Sélection de la référence */}
      <div>
        <Select
          value={selectedReference || ''}
          onValueChange={onReferenceChange}
          disabled={loadingReferences || references.length === 0}
        >
          <SelectTrigger className="bg-white/70 border-gray-300 text-gray-900 focus:border-amber-500 hover:bg-white/90 transition-all shadow-sm rounded-xl">
            {loadingReferences ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Chargement...</span>
              </div>
            ) : (
              <SelectValue placeholder={`Sélectionner un modèle de ${category}`} />
            )}
          </SelectTrigger>
          <SelectContent className="bg-white border-gray-300 text-gray-900">
            {references.map(ref => (
              <SelectItem key={ref.id} value={ref.id}>
                {ref.name} ({ref.subCategory})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Sélection de la couleur (si disponible) */}
      {sizeInfo && sizeInfo.colors && sizeInfo.colors.length > 0 && onColorChange && (
        <div>
          <Select
            value={selectedColor || ''}
            onValueChange={onColorChange}
          >
            <SelectTrigger className="bg-white/70 border-gray-300 text-gray-900 focus:border-amber-500 hover:bg-white/90 transition-all shadow-sm rounded-xl">
              <SelectValue placeholder="Sélectionner une couleur" />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-300 text-gray-900">
              {sizeInfo.colors.map(color => (
                <SelectItem key={color} value={color}>
                  {color}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Sélection de la taille */}
      <div>
        <Select
          value={selectedSize || ''}
          onValueChange={onSizeChange}
          disabled={loadingSizes || !sizeInfo || sizeInfo.sizes.length === 0}
        >
          <SelectTrigger className="bg-white/70 border-gray-300 text-gray-900 focus:border-amber-500 hover:bg-white/90 transition-all shadow-sm rounded-xl">
            {loadingSizes ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Chargement des tailles...</span>
              </div>
            ) : sizeInfo ? (
              <SelectValue placeholder="Sélectionner une taille" />
            ) : (
              <SelectValue placeholder="Choisir d'abord un modèle" />
            )}
          </SelectTrigger>
          <SelectContent className="bg-white border-gray-300 text-gray-900">
            {sizeInfo?.sizes.map(size => (
              <SelectItem key={size} value={size}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Informations sur le produit sélectionné */}
      {sizeInfo && (
        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
          <p><strong>Modèle:</strong> {sizeInfo.name}</p>
          <p><strong>Catégorie:</strong> {sizeInfo.subCategory}</p>
          <p><strong>Prix de base:</strong> {sizeInfo.basePrice}€</p>
          <p><strong>Tailles disponibles:</strong> {sizeInfo.sizes.length} taille(s)</p>
        </div>
      )}
    </div>
  );
}