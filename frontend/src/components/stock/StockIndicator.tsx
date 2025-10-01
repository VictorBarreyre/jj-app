import React, { useState, useEffect } from 'react';
import { stockAPI } from '@/services/api';

interface StockIndicatorProps {
  selectedReference?: string;
  selectedSize?: string;
}

export function StockIndicator({ selectedReference, selectedSize }: StockIndicatorProps) {
  const [stockInfo, setStockInfo] = useState<{ available: number; total: number } | null>(null);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    const fetchStock = async () => {
      if (!selectedReference || !selectedSize) {
        setStockInfo(null);
        return;
      }

      setLoading(true);
      try {
        
        // Récupérer d'abord le nom de la référence depuis le catalog
        const refData = await stockAPI.getSizesForReference(selectedReference);
        
        
        if (!refData.name) {
          return;
        }

        // Récupérer le stock pour cette référence et taille
        const stockData = await stockAPI.getItems({ reference: refData.name });
        
        
        if (stockData.items && stockData.items.length > 0) {
          // Filtrer par taille exacte
          const matchingItem = stockData.items.find((item: any) => 
            item.taille === selectedSize
          );
          
          
          if (matchingItem) {
            setStockInfo({
              available: matchingItem.quantiteDisponible,
              total: matchingItem.quantiteStock
            });
          } else {
            setStockInfo({ available: 0, total: 0 });
          }
        } else {
          setStockInfo({ available: 0, total: 0 });
        }
      } catch (error) {
        console.warn('Erreur lors de la récupération du stock:', error);
        setStockInfo(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStock();
  }, [selectedReference, selectedSize]);

  if (loading) {
    return null;
  }

  if (!stockInfo) {
    return null;
  }

  const { available, total } = stockInfo;
  
  if (total === 0) {
    return <span className="text-xs text-red-500">• Non en stock</span>;
  }

  return (
    <span className={`text-xs ${available > 0 ? 'text-green-600' : 'text-red-500'}`}>
      • {available} dispo sur {total}
    </span>
  );
}