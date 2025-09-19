import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { RentalContract } from '../types/rental-contract';

export type PDFType = 'vendeur' | 'client';

export class PDFService {
  private static formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR');
  }

  private static formatPrice(price: number): string {
    return `${price.toFixed(2)} €`;
  }

  private static addHeader(doc: jsPDF, contract: RentalContract, type: PDFType) {
    // Logo/Titre de l'entreprise
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('JEAN JACQUES CÉRÉMONIE', 105, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Location de costumes et accessoires', 105, 28, { align: 'center' });

    // Informations de contact
    doc.setFontSize(10);
    doc.text('Tél: 01 23 45 67 89 - Email: contact@jjceremonie.fr', 105, 35, { align: 'center' });

    // Ligne de séparation
    doc.line(20, 42, 190, 42);

    // Type de document
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    const title = type === 'vendeur' ? 'BON DE LOCATION - VENDEUR' : 'BON DE LOCATION - CLIENT';
    doc.text(title, 105, 52, { align: 'center' });

    // Numéro de contrat
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`N° ${contract.numero}`, 20, 65);
    doc.text(`Date: ${this.formatDate(contract.dateCreation)}`, 140, 65);
  }

  private static addClientInfo(doc: jsPDF, contract: RentalContract, startY: number): number {
    let currentY = startY;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMATIONS CLIENT', 20, currentY);
    currentY += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Nom: ${contract.client.nom}`, 20, currentY);
    doc.text(`Téléphone: ${contract.client.telephone}`, 120, currentY);
    currentY += 6;

    if (contract.client.email) {
      doc.text(`Email: ${contract.client.email}`, 20, currentY);
      currentY += 6;
    }

    currentY += 5;
    return currentY;
  }

  private static addEventInfo(doc: jsPDF, contract: RentalContract, startY: number): number {
    let currentY = startY;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMATIONS ÉVÉNEMENT', 20, currentY);
    currentY += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Date événement: ${this.formatDate(contract.dateEvenement)}`, 20, currentY);
    doc.text(`Date retrait: ${this.formatDate(contract.dateRetrait)}`, 20, currentY + 6);
    doc.text(`Date retour: ${this.formatDate(contract.dateRetour)}`, 20, currentY + 12);
    doc.text(`Vendeur: ${contract.vendeur}`, 120, currentY);

    currentY += 25;
    return currentY;
  }

  private static addTenueInfo(doc: jsPDF, contract: RentalContract, startY: number, type: PDFType): number {
    let currentY = startY;

    if (!contract.tenue || Object.keys(contract.tenue).length === 0) {
      return currentY;
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('TENUE', 20, currentY);
    currentY += 8;

    const tableData: string[][] = [];

    if (contract.tenue.veste) {
      const row = [
        'Veste',
        contract.tenue.veste.reference || '',
        contract.tenue.veste.taille || '',
        contract.tenue.veste.couleur || ''
      ];
      if (type === 'vendeur' && contract.tenue.veste.notes) {
        row.push(contract.tenue.veste.notes);
      }
      tableData.push(row);
    }

    if (contract.tenue.gilet) {
      const row = [
        'Gilet',
        contract.tenue.gilet.reference || '',
        contract.tenue.gilet.taille || '',
        contract.tenue.gilet.couleur || ''
      ];
      if (type === 'vendeur' && contract.tenue.gilet.notes) {
        row.push(contract.tenue.gilet.notes);
      }
      tableData.push(row);
    }

    if (contract.tenue.pantalon) {
      const row = [
        'Pantalon',
        contract.tenue.pantalon.reference || '',
        contract.tenue.pantalon.taille || '',
        contract.tenue.pantalon.couleur || ''
      ];
      if (type === 'vendeur' && contract.tenue.pantalon.notes) {
        row.push(contract.tenue.pantalon.notes);
      }
      tableData.push(row);
    }

    if (contract.tenue.tailleChapeau) {
      tableData.push(['Chapeau', '', contract.tenue.tailleChapeau, '', type === 'vendeur' ? '' : '']);
    }

    if (contract.tenue.tailleChaussures) {
      tableData.push(['Chaussures', '', contract.tenue.tailleChaussures, '', type === 'vendeur' ? '' : '']);
    }

    if (tableData.length > 0) {
      const headers = type === 'vendeur'
        ? ['Article', 'Référence', 'Taille', 'Couleur', 'Notes']
        : ['Article', 'Référence', 'Taille', 'Couleur'];

      autoTable(doc, {
        head: [headers],
        body: tableData,
        startY: currentY,
        theme: 'grid',
        headStyles: { fillColor: [220, 220, 220], textColor: [0, 0, 0] },
        styles: { fontSize: 9 },
        columnStyles: type === 'vendeur' ? {
          0: { cellWidth: 25 },
          1: { cellWidth: 35 },
          2: { cellWidth: 20 },
          3: { cellWidth: 25 },
          4: { cellWidth: 80 }
        } : {
          0: { cellWidth: 30 },
          1: { cellWidth: 50 },
          2: { cellWidth: 25 },
          3: { cellWidth: 30 }
        }
      });

      currentY = (doc as any).lastAutoTable.finalY + 10;
    }

    return currentY;
  }

  private static addStockItems(doc: jsPDF, contract: RentalContract, startY: number): number {
    if (!contract.articlesStock || contract.articlesStock.length === 0) {
      return startY;
    }

    let currentY = startY;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('ARTICLES STOCK', 20, currentY);
    currentY += 8;

    const tableData = contract.articlesStock.map(item => [
      item.reference,
      item.taille,
      item.couleur || '',
      item.quantiteReservee.toString(),
      this.formatPrice(item.prix)
    ]);

    autoTable(doc, {
      head: [['Référence', 'Taille', 'Couleur', 'Quantité', 'Prix']],
      body: tableData,
      startY: currentY,
      theme: 'grid',
      headStyles: { fillColor: [220, 220, 220], textColor: [0, 0, 0] },
      styles: { fontSize: 9 }
    });

    currentY = (doc as any).lastAutoTable.finalY + 10;
    return currentY;
  }

  private static addFinancialInfo(doc: jsPDF, contract: RentalContract, startY: number, type: PDFType): number {
    let currentY = startY;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMATIONS FINANCIÈRES', 20, currentY);
    currentY += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    const total = contract.tarifLocation + contract.depotGarantie;

    doc.text(`Tarif location: ${this.formatPrice(contract.tarifLocation)}`, 20, currentY);
    doc.text(`Dépôt de garantie: ${this.formatPrice(contract.depotGarantie)}`, 20, currentY + 6);
    doc.text(`Arrhes: ${this.formatPrice(contract.arrhes)}`, 20, currentY + 12);

    doc.setFont('helvetica', 'bold');
    doc.text(`TOTAL: ${this.formatPrice(total)}`, 20, currentY + 20);

    // Informations de paiement pour le vendeur uniquement
    if (type === 'vendeur') {
      currentY += 30;
      doc.setFont('helvetica', 'normal');

      if (contract.paiementArrhes) {
        doc.text(`Arrhes payées le ${this.formatDate(contract.paiementArrhes.date || '')} - ${contract.paiementArrhes.method}`, 20, currentY);
        currentY += 6;
      }

      if (contract.paiementSolde) {
        doc.text(`Solde payé le ${this.formatDate(contract.paiementSolde.date || '')} - ${contract.paiementSolde.method}`, 20, currentY);
        currentY += 6;
      }
    }

    return currentY + 25;
  }

  private static addVendeurDetachableSection(doc: jsPDF, contract: RentalContract, startY: number): number {
    // Ligne pointillée de séparation
    const y = Math.max(startY, 200); // S'assurer qu'il y a assez d'espace

    // Créer une ligne pointillée
    doc.setLineDashPattern([2, 2], 0);
    doc.line(20, y, 190, y);
    doc.setLineDashPattern([], 0); // Reset dash pattern

    // Texte "PARTIE DÉTACHABLE"
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text('PARTIE DÉTACHABLE - À CONSERVER', 105, y - 3, { align: 'center' });

    let currentY = y + 10;

    // Titre de la section détachable
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('RÉCÉPISSÉ DE DÉPÔT', 105, currentY, { align: 'center' });
    currentY += 10;

    // Informations essentielles
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Contrat N° ${contract.numero}`, 20, currentY);
    doc.text(`Client: ${contract.client.nom}`, 20, currentY + 6);
    doc.text(`Téléphone: ${contract.client.telephone}`, 20, currentY + 12);
    doc.text(`Date événement: ${this.formatDate(contract.dateEvenement)}`, 120, currentY);
    doc.text(`Date retour: ${this.formatDate(contract.dateRetour)}`, 120, currentY + 6);

    currentY += 20;

    // Total et dépôt
    const total = contract.tarifLocation + contract.depotGarantie;
    doc.setFont('helvetica', 'bold');
    doc.text(`Total: ${this.formatPrice(total)}`, 20, currentY);
    doc.text(`Dépôt versé: ${this.formatPrice(contract.arrhes)}`, 20, currentY + 6);
    doc.text(`Reste à payer: ${this.formatPrice(total - contract.arrhes)}`, 20, currentY + 12);

    // Signature
    currentY += 25;
    doc.setFont('helvetica', 'normal');
    doc.text('Signature client:', 20, currentY);
    doc.text('Signature vendeur:', 120, currentY);

    return currentY + 20;
  }

  public static generatePDF(contract: RentalContract, type: PDFType): void {
    const doc = new jsPDF();

    // Header
    this.addHeader(doc, contract, type);

    let currentY = 75;

    // Client info
    currentY = this.addClientInfo(doc, contract, currentY);

    // Event info
    currentY = this.addEventInfo(doc, contract, currentY);

    // Tenue
    currentY = this.addTenueInfo(doc, contract, currentY, type);

    // Stock items
    currentY = this.addStockItems(doc, contract, currentY);

    // Financial info
    currentY = this.addFinancialInfo(doc, contract, currentY, type);

    // Section détachable pour vendeur uniquement
    if (type === 'vendeur') {
      this.addVendeurDetachableSection(doc, contract, currentY);
    } else {
      // Pour le client, ajouter les conditions
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('Conditions: Location soumise aux conditions générales disponibles en magasin.', 20, currentY);
      doc.text('Tout retard de retour fera l\'objet d\'une facturation supplémentaire.', 20, currentY + 5);
    }

    // Sauvegarder le PDF
    const filename = `bon-commande-${contract.numero}-${type}.pdf`;
    doc.save(filename);
  }
}