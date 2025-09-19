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
    // Titre principal
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('JEAN JACQUES CÉRÉMONIES', 105, 15, { align: 'center' });

    // Fondé en 1867
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Fondé en 1867', 105, 22, { align: 'center' });

    // Site web
    doc.setFontSize(10);
    doc.text('www.jjloc.fr', 105, 28, { align: 'center' });

    // Adresse
    doc.setFontSize(9);
    doc.text('2 rue Nicolas Flamel - 75004 Paris (Métro Châtelet)', 105, 34, { align: 'center' });

    // Téléphone
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('01 43 54 25 56', 105, 40, { align: 'center' });

    // Horaires
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Ouvert du mardi au samedi de 9h à 18h sans interruption', 105, 46, { align: 'center' });
    doc.text('Fermé dimanche et lundi', 105, 50, { align: 'center' });

    // Ligne de séparation
    doc.line(20, 55, 190, 55);
  }

  private static addSimplifiedInfo(doc: jsPDF, contract: RentalContract, startY: number): number {
    let currentY = startY;

    // Numéro de réservation et nombre d'articles
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`N° Réservation: ${contract.numero}`, 20, currentY);

    // Compter le nombre total d'articles
    let totalArticles = 0;
    if (contract.groupDetails?.participants) {
      contract.groupDetails.participants.forEach(participant => {
        if (participant.tenue?.veste) totalArticles++;
        if (participant.tenue?.gilet) totalArticles++;
        if (participant.tenue?.pantalon) totalArticles++;
        if (participant.tenue?.tailleChapeau) totalArticles++;
        if (participant.tenue?.tailleChaussures) totalArticles++;
      });
    } else if (contract.tenue) {
      if (contract.tenue.veste) totalArticles++;
      if (contract.tenue.gilet) totalArticles++;
      if (contract.tenue.pantalon) totalArticles++;
      if (contract.tenue.tailleChapeau) totalArticles++;
      if (contract.tenue.tailleChaussures) totalArticles++;
    }
    // Ajouter les articles stock
    if (contract.articlesStock) {
      totalArticles += contract.articlesStock.length;
    }

    doc.text(`${totalArticles} vêtements et accessoires`, 120, currentY);
    currentY += 12;

    // Nom du client ou groupe
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const clientName = contract.type === 'groupe' && contract.groupDetails?.participants
      ? `Groupe: ${contract.client.nom}`
      : contract.client.nom;
    doc.text(clientName, 20, currentY);
    currentY += 8;

    // Téléphone
    doc.setFontSize(10);
    doc.text(`Téléphone: ${contract.client.telephone}`, 20, currentY);
    currentY += 12;

    // À prendre le / À rendre le
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`À prendre le: ${this.formatDate(contract.dateRetrait)}`, 20, currentY);
    doc.text(`À rendre le: ${this.formatDate(contract.dateRetour)}`, 120, currentY);
    currentY += 15;

    // Prix
    const total = contract.tarifLocation + contract.depotGarantie;
    doc.setFontSize(11);
    doc.text(`Prix: ${this.formatPrice(total)}`, 20, currentY);
    currentY += 8;

    // Dépôt de garantie
    doc.text(`Dépôt de garantie: ${this.formatPrice(contract.depotGarantie)}`, 20, currentY);
    currentY += 8;

    // Arrhes
    doc.text(`Arrhes: ${this.formatPrice(contract.arrhes)}`, 20, currentY);
    currentY += 12;

    // Rendu le / Payé le
    doc.setFont('helvetica', 'normal');
    const dateRendu = contract.dateRendu ? this.formatDate(contract.dateRendu) : '___________';
    doc.text(`Rendu le: ${dateRendu}`, 20, currentY);

    const datePaiement = contract.paiementSolde?.date ? this.formatDate(contract.paiementSolde.date) : '___________';
    doc.text(`Payé le: ${datePaiement}`, 120, currentY);
    currentY += 15;

    return currentY;
  }

  private static addTenueInfo(doc: jsPDF, contract: RentalContract, startY: number, type: PDFType): number {
    let currentY = startY;

    // Créer un tableau unifié pour tous les types de contrats
    const allParticipants = [];

    // Pour contrats de groupe : utiliser les participants
    if (contract.groupDetails?.participants && contract.groupDetails.participants.length > 0) {
      contract.groupDetails.participants.forEach((participant, index) => {
        allParticipants.push({
          nom: participant.nom,
          tenue: participant.tenue,
          notes: participant.notes
        });
      });
    }
    // Pour contrats individuels : créer un "participant" avec la tenue principale
    else if (contract.tenue && Object.keys(contract.tenue).length > 0) {
      allParticipants.push({
        nom: contract.client.nom,
        tenue: contract.tenue,
        notes: contract.notes
      });
    }

    if (allParticipants.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('PARTICIPANTS ET TENUES', 20, currentY);
      currentY += 8;

      // Créer le tableau avec tous les participants
      const tableData: string[][] = [];

      allParticipants.forEach((participant) => {
        // Ligne de séparation pour chaque participant (sauf le premier)
        if (tableData.length > 0) {
          tableData.push(['', '', '', '', type === 'vendeur' ? '' : '']); // Ligne vide
        }

        // Nom du participant en gras (première ligne)
        tableData.push([
          `👤 ${participant.nom}`,
          '',
          '',
          '',
          type === 'vendeur' ? '' : ''
        ]);

        // Articles de la tenue
        if (participant.tenue?.veste) {
          const row = [
            '  • Veste',
            participant.tenue.veste.reference || '',
            participant.tenue.veste.taille || '',
            participant.tenue.veste.couleur || ''
          ];
          if (type === 'vendeur') {
            row.push(participant.tenue.veste.notes || '');
          }
          tableData.push(row);
        }

        if (participant.tenue?.gilet) {
          const row = [
            '  • Gilet',
            participant.tenue.gilet.reference || '',
            participant.tenue.gilet.taille || '',
            participant.tenue.gilet.couleur || ''
          ];
          if (type === 'vendeur') {
            row.push(participant.tenue.gilet.notes || '');
          }
          tableData.push(row);
        }

        if (participant.tenue?.pantalon) {
          const row = [
            '  • Pantalon',
            participant.tenue.pantalon.reference || '',
            participant.tenue.pantalon.taille || '',
            participant.tenue.pantalon.couleur || ''
          ];
          if (type === 'vendeur') {
            row.push(participant.tenue.pantalon.notes || '');
          }
          tableData.push(row);
        }

        if (participant.tenue?.tailleChapeau) {
          const row = [
            '  • Chapeau',
            '',
            participant.tenue.tailleChapeau,
            ''
          ];
          if (type === 'vendeur') {
            row.push('');
          }
          tableData.push(row);
        }

        if (participant.tenue?.tailleChaussures) {
          const row = [
            '  • Chaussures',
            '',
            participant.tenue.tailleChaussures,
            ''
          ];
          if (type === 'vendeur') {
            row.push('');
          }
          tableData.push(row);
        }

        // Notes du participant si présentes
        if (type === 'vendeur' && participant.notes) {
          tableData.push([
            '  📝 Notes:',
            participant.notes,
            '',
            '',
            ''
          ]);
        }
      });

      if (tableData.length > 0) {
        const headers = type === 'vendeur'
          ? ['Participant/Article', 'Référence', 'Taille', 'Couleur', 'Notes']
          : ['Participant/Article', 'Référence', 'Taille', 'Couleur'];

        autoTable(doc, {
          head: [headers],
          body: tableData,
          startY: currentY,
          theme: 'grid',
          headStyles: { fillColor: [220, 220, 220], textColor: [0, 0, 0] },
          styles: {
            fontSize: 9,
            cellPadding: 2
          },
          columnStyles: type === 'vendeur' ? {
            0: { cellWidth: 35 },
            1: { cellWidth: 35 },
            2: { cellWidth: 20 },
            3: { cellWidth: 25 },
            4: { cellWidth: 70 }
          } : {
            0: { cellWidth: 40 },
            1: { cellWidth: 50 },
            2: { cellWidth: 25 },
            3: { cellWidth: 30 }
          },
          didParseCell: function(data) {
            // Mettre en gras les noms de participants
            if (data.cell.text[0] && data.cell.text[0].startsWith('👤')) {
              data.cell.styles.fontStyle = 'bold';
              data.cell.styles.fillColor = [240, 240, 240];
            }
            // Style pour les lignes vides (séparation)
            if (data.cell.text[0] === '' && data.row.index > 0) {
              data.cell.styles.fillColor = [250, 250, 250];
              data.cell.styles.minCellHeight = 3;
            }
          }
        });

        currentY = (doc as any).lastAutoTable.finalY + 10;
      }
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

  private static addVendeurDetachableSection(doc: jsPDF, contract: RentalContract): number {
    // Position fixe pour la ligne de découpe (160mm = environ 160px)
    const y = 160;

    // Créer une ligne pointillée
    doc.setLineDashPattern([2, 2], 0);
    doc.line(20, y, 190, y);
    doc.setLineDashPattern([], 0); // Reset dash pattern

    let currentY = y + 8;

    // Titre de la section détachable
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('RÉCÉPISSÉ DE DÉPÔT', 105, currentY, { align: 'center' });
    currentY += 8;

    // Informations essentielles en 2 colonnes compactes
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`N° ${contract.numero}`, 20, currentY);
    doc.text(`Tel: ${contract.client.telephone}`, 120, currentY);
    currentY += 5;

    const clientName = contract.type === 'groupe' && contract.groupDetails?.participants
      ? `Groupe: ${contract.client.nom}`
      : contract.client.nom;
    doc.text(clientName, 20, currentY);
    doc.text(`Retour: ${this.formatDate(contract.dateRetour)}`, 120, currentY);
    currentY += 8;

    // Compter les articles
    let totalArticles = 0;
    if (contract.groupDetails?.participants) {
      contract.groupDetails.participants.forEach(participant => {
        if (participant.tenue?.veste) totalArticles++;
        if (participant.tenue?.gilet) totalArticles++;
        if (participant.tenue?.pantalon) totalArticles++;
        if (participant.tenue?.tailleChapeau) totalArticles++;
        if (participant.tenue?.tailleChaussures) totalArticles++;
      });
    } else if (contract.tenue) {
      if (contract.tenue.veste) totalArticles++;
      if (contract.tenue.gilet) totalArticles++;
      if (contract.tenue.pantalon) totalArticles++;
      if (contract.tenue.tailleChapeau) totalArticles++;
      if (contract.tenue.tailleChaussures) totalArticles++;
    }
    if (contract.articlesStock) {
      totalArticles += contract.articlesStock.length;
    }

    doc.text(`${totalArticles} articles`, 20, currentY);
    currentY += 8;

    // Total et dépôt - compacte
    const total = contract.tarifLocation + contract.depotGarantie;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total: ${this.formatPrice(total)}`, 20, currentY);
    doc.text(`Arrhes: ${this.formatPrice(contract.arrhes)}`, 75, currentY);
    doc.text(`Solde: ${this.formatPrice(total - contract.arrhes)}`, 130, currentY);
    currentY += 10;

    // Signature compacte
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Signature client:', 20, currentY);
    doc.text('Signature vendeur:', 120, currentY);

    return currentY + 15;
  }

  public static generatePDF(contract: RentalContract, type: PDFType): void {
    const doc = new jsPDF();

    // Header simplifié
    this.addHeader(doc, contract, type);

    // Informations simplifiées - hauteur fixe (plus d'espace après l'en-tête)
    let currentY = 65;
    currentY = this.addSimplifiedInfo(doc, contract, currentY);

    // Section détachable pour vendeur uniquement à position fixe
    if (type === 'vendeur') {
      this.addVendeurDetachableSection(doc, contract);
    } else {
      // Pour le client, afficher le tableau des tenues et les conditions
      currentY = this.addTenueInfo(doc, contract, currentY, type);

      // Stock items pour le client
      if (contract.articlesStock && contract.articlesStock.length > 0) {
        currentY = this.addStockItems(doc, contract, currentY);
      }

      // Conditions pour le client
      if (currentY < 240) { // S'assurer qu'on a la place
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text('Conditions: Location soumise aux conditions générales disponibles en magasin.', 20, 250);
        doc.text('Tout retard de retour fera l\'objet d\'une facturation supplémentaire.', 20, 255);
      }
    }

    // Sauvegarder le PDF
    const filename = `bon-location-${contract.numero}-${type}.pdf`;
    doc.save(filename);
  }
}