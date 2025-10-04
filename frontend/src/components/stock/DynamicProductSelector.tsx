import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { ArticleCategory } from '@/types/stock';
import { Loader2 } from 'lucide-react';
import { stockAPI } from '@/services/api';

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

  // Debug : afficher les props reçues
  useEffect(() => {
    console.log(`🔍 DynamicProductSelector [${category}] - selectedReference:`, selectedReference);
    console.log(`🔍 DynamicProductSelector [${category}] - selectedSize:`, selectedSize);
    console.log(`🔍 DynamicProductSelector [${category}] - selectedColor:`, selectedColor);
  }, [category, selectedReference, selectedSize, selectedColor]);

  // Charger les références pour la catégorie
  useEffect(() => {
    const fetchReferences = async () => {
      setLoadingReferences(true);
      try {
        const data = await stockAPI.getReferences(category);
        setReferences(data.references || []);
        console.log(`🔍 DynamicProductSelector [${category}] - references chargées:`, data.references);
      } catch (error) {
        console.error('Erreur lors du chargement des références:', error);
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
        const data = await stockAPI.getSizesForReference(selectedReference);
        setSizeInfo(data);
      } catch (error) {
        console.error('Erreur lors du chargement des tailles:', error);
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

  // Vérifier si la référence sélectionnée existe dans la liste
  useEffect(() => {
    if (selectedReference && references.length > 0) {
      const refExists = references.find(ref => ref.id === selectedReference);
      if (!refExists) {
        console.warn(`⚠️ DynamicProductSelector [${category}] - La référence "${selectedReference}" n'existe pas dans la liste!`);
        console.log(`🔍 DynamicProductSelector [${category}] - IDs disponibles:`, references.map(r => r.id));
      } else {
        console.log(`✅ DynamicProductSelector [${category}] - Référence "${selectedReference}" trouvée:`, refExists);
      }
    }
  }, [category, selectedReference, references]);

  // Vérifier si la référence sélectionnée est une ceinture scratch
  const isCeintureScratched = () => {
    if (!selectedReference) return false;
    const reference = references.find(ref => ref.id === selectedReference);
    return reference?.id === 'ceinture-scratch';
  };

  return (
    <div className="space-y-4">
      {/* Sélection de la référence */}
      <div>
        <Select
          value={selectedReference === null || selectedReference === undefined ? '' : (selectedReference === '' ? '__none__' : selectedReference)}
          onValueChange={(value) => onReferenceChange(value === '__none__' ? '' : value)}
          disabled={loadingReferences || references.length === 0}
        >
          <SelectTrigger className="bg-white/70 border-gray-300 text-gray-900 focus:border-amber-500 hover:bg-white/90 transition-all shadow-sm rounded-xl">
            {loadingReferences ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Chargement...</span>
              </div>
            ) : (
              <SelectValue placeholder={`Sélectionner un modèle de ${category === 'accessoire' ? 'ceinture' : category}`} />
            )}
          </SelectTrigger>
          <SelectContent className="bg-white border-gray-300 text-gray-900">
            <SelectItem value="__none__">
              <span className="text-gray-500 italic">
                {category === 'veste' ? 'Sans veste' : 
                 category === 'gilet' ? 'Sans gilet' : 
                 category === 'pantalon' ? 'Sans pantalon' : 
                 category === 'accessoire' ? 'Sans ceinture' : 
                 'Aucun modèle sélectionné'}
              </span>
            </SelectItem>
            {references.map(ref => (
              <SelectItem key={ref.id} value={ref.id}>
                {ref.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>


      {/* Sélection de la taille */}
      <div>
        {isCeintureScratched() ? (
          // Input libre pour ceinture scratch
          <Input
            value={selectedSize || ''}
            onChange={(e) => onSizeChange(e.target.value)}
            placeholder="Saisir la taille (ex: 85, 90-95, ajustable)"
            className="bg-white/70 border-gray-300 text-gray-900 focus:border-amber-500 hover:bg-white/90 transition-all shadow-sm rounded-xl"
          />
        ) : (
          // Select classique pour les autres références
          <Select
            value={selectedSize || ''}
            onValueChange={(value) => onSizeChange(value === '__none__' ? '' : value)}
            disabled={loadingSizes || !sizeInfo || sizeInfo.sizes.length === 0}
          >
            <SelectTrigger className="bg-white/70 border-gray-300 text-gray-900 focus:border-amber-500 hover:bg-white/90 transition-all shadow-sm rounded-xl">
              {loadingSizes ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Chargement des tailles...</span>
                </div>
              ) : (
                <SelectValue placeholder="Sélectionner une taille" />
              )}
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-300 text-gray-900">
              <SelectItem value="__none__">
                <span className="text-gray-500 italic">Aucune taille sélectionnée</span>
              </SelectItem>
              {sizeInfo?.sizes.map(size => (
                <SelectItem key={size} value={size}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

    </div>
  );
}