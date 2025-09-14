import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { StockMovement, MovementType } from '@/types/stock';
import { History, TrendingUp, TrendingDown, RotateCcw, X, Trash2, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface StockMovementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  movements: StockMovement[];
  loading: boolean;
  itemInfo: {
    reference: string;
    taille: string;
    couleur?: string;
  } | null;
}

export function StockMovementsModal({ isOpen, onClose, movements, loading, itemInfo }: StockMovementsModalProps) {
  const getMovementTypeLabel = (type: MovementType): string => {
    const labels: Record<MovementType, string> = {
      'entree': 'Entrée en stock',
      'sortie': 'Sortie de stock',
      'reservation': 'Réservation',
      'retour': 'Retour',
      'annulation': 'Annulation',
      'destruction': 'Destruction',
      'perte': 'Perte'
    };
    return labels[type] || type;
  };

  const getMovementTypeIcon = (type: MovementType) => {
    switch (type) {
      case 'entree':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'sortie':
      case 'reservation':
        return <TrendingDown className="w-4 h-4 text-orange-600" />;
      case 'retour':
      case 'annulation':
        return <RotateCcw className="w-4 h-4 text-blue-600" />;
      case 'destruction':
      case 'perte':
        return <Trash2 className="w-4 h-4 text-red-600" />;
      default:
        return <History className="w-4 h-4 text-gray-600" />;
    }
  };

  const getMovementTypeColor = (type: MovementType): string => {
    switch (type) {
      case 'entree':
        return 'bg-green-50 text-green-800 border-green-200';
      case 'sortie':
      case 'reservation':
        return 'bg-orange-50 text-orange-800 border-orange-200';
      case 'retour':
      case 'annulation':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'destruction':
      case 'perte':
        return 'bg-red-50 text-red-800 border-red-200';
      default:
        return 'bg-gray-50 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy à HH:mm', { locale: fr });
    } catch {
      return 'Date invalide';
    }
  };

  const getQuantityDisplay = (type: MovementType, quantite: number) => {
    const isPositive = ['entree', 'retour', 'annulation'].includes(type);
    const sign = isPositive ? '+' : '-';
    const color = isPositive ? 'text-green-600' : 'text-red-600';
    
    return (
      <span className={`font-bold ${color}`}>
        {sign}{quantite}
      </span>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Historique des mouvements"
      size="xl"
    >
      <div className="space-y-4 sm:space-y-8 text-left">
        {/* Informations de l'article */}
        {itemInfo && (
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-3 sm:p-5 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-gray-500 to-gray-600 p-2 rounded-lg shadow-md">
                <History className="w-5 h-5 text-white" />
              </div>
              <div className="text-left py-2 sm:py-0">
                <h3 className="font-semibold text-gray-900">
                  {itemInfo.reference} - Taille {itemInfo.taille}
                </h3>
                {itemInfo.couleur && (
                  <p className="text-sm text-gray-700 mt-0.5 sm:mt-1">Couleur : {itemInfo.couleur}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Liste des mouvements */}
        <div className="max-h-96 sm:max-h-[500px] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
              <span className="ml-3 text-gray-600">Chargement de l'historique...</span>
            </div>
          ) : movements.length === 0 ? (
            <div className="text-center sm:text-center py-8">
              <History className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Aucun mouvement enregistré pour cet article</p>
            </div>
          ) : (
            <div className="space-y-4">
              {movements.map((movement) => (
                <div
                  key={movement.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 sm:p-5 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-1">
                        {getMovementTypeIcon(movement.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900">
                            {getMovementTypeLabel(movement.type)}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getMovementTypeColor(movement.type)}`}>
                            {movement.type}
                          </span>
                        </div>
                        
                        <div className="text-sm text-gray-600 space-y-2">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                            <span>
                              <strong>Quantité:</strong> {getQuantityDisplay(movement.type, movement.quantite)}
                            </span>
                            <span>
                              <strong>Date:</strong> {formatDate(movement.dateMovement)}
                            </span>
                          </div>
                          
                          {movement.datePrevue && (
                            <div className="text-left">
                              <strong>Date prévue:</strong> {formatDate(movement.datePrevue)}
                            </div>
                          )}
                          
                          {movement.dateRetour && (
                            <div className="text-left">
                              <strong>Date de retour:</strong> {formatDate(movement.dateRetour)}
                            </div>
                          )}
                          
                          {movement.vendeur && (
                            <div className="text-left">
                              <strong>Vendeur:</strong> {movement.vendeur}
                            </div>
                          )}
                          
                          {movement.contractId && (
                            <div className="text-left">
                              <strong>Contrat:</strong> {movement.contractId}
                            </div>
                          )}
                          
                          {movement.commentaire && (
                            <div className="mt-6 p-2 bg-gray-50 rounded border-l-4 border-gray-300 text-left">
                              <strong>Commentaire:</strong> {movement.commentaire}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </Modal>
  );
}