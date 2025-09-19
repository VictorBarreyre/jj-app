import { useState } from 'react';
import { PDFService, PDFType } from '../services/pdfService';
import { RentalContract } from '../types/rental-contract';

export const usePDFExport = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportPDF = async (contract: RentalContract, type: PDFType) => {
    setIsGenerating(true);
    setError(null);

    try {
      // Si vous voulez récupérer les données du backend avant génération
      // const response = await fetch(`/api/contracts/${contract.id}/pdf/${type}`);
      // const data = await response.json();

      PDFService.generatePDF(contract, type);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la génération du PDF';
      setError(errorMessage);
      console.error('Erreur PDF export:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    exportPDF,
    isGenerating,
    error,
    clearError: () => setError(null)
  };
};