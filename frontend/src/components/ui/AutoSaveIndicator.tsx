import React, { useState, useEffect } from 'react';
import { Save, Check } from 'lucide-react';

interface AutoSaveIndicatorProps {
  isVisible: boolean;
  className?: string;
}

export function AutoSaveIndicator({ isVisible, className = '' }: AutoSaveIndicatorProps) {
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShowSaved(true);
      const timer = setTimeout(() => {
        setShowSaved(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!showSaved) return null;

  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs text-green-600 bg-green-50 rounded-md border border-green-200 ${className}`}>
      <Check className="w-3 h-3" />
      Données sauvegardées
    </div>
  );
}