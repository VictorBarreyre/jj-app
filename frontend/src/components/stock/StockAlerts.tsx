import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { StockAlert } from '@/types/stock';

interface StockAlertsProps {
  alerts: StockAlert[];
}

export function StockAlerts({ alerts }: StockAlertsProps) {
  if (alerts.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-6 shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-gradient-to-br from-orange-500 to-amber-500 p-2 rounded-lg shadow-md">
          <AlertTriangle className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-base sm:text-lg font-bold text-orange-800">Alertes de stock ({alerts.length})</h3>
      </div>
      <div className="space-y-3">
        {alerts.slice(0, 3).map(alert => (
          <div key={alert.id} className="bg-white/80 backdrop-blur-sm border border-orange-100 rounded-xl p-4 shadow-sm">
            <p className="text-sm font-medium text-orange-800">{alert.message}</p>
            <p className="text-xs text-orange-600 mt-1">
              Détecté le {new Date(alert.dateDetection).toLocaleDateString('fr-FR')}
            </p>
          </div>
        ))}
        {alerts.length > 3 && (
          <p className="text-sm text-orange-700 font-semibold bg-white/60 p-3 rounded-xl">
            ... et {alerts.length - 3} autres alertes
          </p>
        )}
      </div>
    </div>
  );
}