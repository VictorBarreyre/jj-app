import React from 'react';
import { FileText } from 'lucide-react';
import { Button } from './button';
import { PDFService, PDFType } from '../../services/pdfService';
import { RentalContract } from '../../types/rental-contract';

interface PDFButtonProps {
  contract: RentalContract;
  type?: PDFType;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  participantIndex?: number;
}

export const PDFButton: React.FC<PDFButtonProps> = ({
  contract,
  type = 'vendeur',
  className,
  variant = 'ghost',
  size = 'sm',
  showText = false,
  participantIndex
}) => {
  const handleExportPDF = () => {
    try {
      // Si c'est un groupe, générer un PDF par participant
      if (contract.groupDetails?.participants && contract.groupDetails.participants.length > 0) {
        if (participantIndex !== undefined) {
          // PDF pour un participant spécifique
          PDFService.generatePDF(contract, type, participantIndex);
        } else {
          // PDF pour tous les participants
          contract.groupDetails.participants.forEach((_, index) => {
            PDFService.generatePDF(contract, type, index);
          });
        }
      } else {
        // PDF pour un contrat individuel
        PDFService.generatePDF(contract, type);
      }
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleExportPDF}
      title={`Générer PDF ${type}`}
    >
      <FileText className="w-3 h-3" />
      {showText && <span className="ml-1">PDF</span>}
    </Button>
  );
};