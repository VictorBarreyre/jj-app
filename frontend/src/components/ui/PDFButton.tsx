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
}

export const PDFButton: React.FC<PDFButtonProps> = ({
  contract,
  type = 'vendeur',
  className,
  variant = 'ghost',
  size = 'sm',
  showText = false
}) => {
  const handleExportPDF = () => {
    try {
      PDFService.generatePDF(contract, type);
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