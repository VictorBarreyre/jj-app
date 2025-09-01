import React, { useState, useEffect } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

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
        const refResponse = await fetch(`${API_BASE_URL}/stock/sizes-for-reference/${selectedReference}`);
        const refData = await refResponse.json();
        
        
        if (!refData.name) {
          return;
        }

        // Récupérer le stock pour cette référence et taille
        const params = new URLSearchParams();
        params.append('reference', refData.name);
        
        const stockResponse = await fetch(`${API_BASE_URL}/stock/items?${params}`);
        const stockData = await stockResponse.json();
        
        
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
    return <span className="text-xs text-gray-500">...</span>;
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