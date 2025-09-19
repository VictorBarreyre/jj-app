import React from 'react';
import { FileText, Download } from 'lucide-react';
import { Button } from './button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import { PDFService, PDFType } from '../../services/pdfService';
import { RentalContract } from '../../types/rental-contract';

interface PDFExportButtonProps {
  contract: RentalContract;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const PDFExportButton: React.FC<PDFExportButtonProps> = ({
  contract,
  className,
  variant = 'outline',
  size = 'sm'
}) => {
  const handleExportPDF = (type: PDFType) => {
    try {
      PDFService.generatePDF(contract, type);
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      // Ici vous pourriez ajouter une notification d'erreur
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={className}
        >
          <FileText className="w-4 h-4 mr-2" />
          Exporter PDF
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExportPDF('vendeur')}>
          <Download className="w-4 h-4 mr-2" />
          PDF Vendeur (avec détachable)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExportPDF('client')}>
          <Download className="w-4 h-4 mr-2" />
          PDF Client (simplifié)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};