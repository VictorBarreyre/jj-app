import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { RentalContract } from '../types/rental-contract';

export type PDFType = 'vendeur' | 'client';

export class PDFService {
  private static formatDate(dateString: string | Date): string {
    if (typeof dateString === 'string') {
      return new Date(dateString).toLocaleDateString('fr-FR');
    }
    return dateString.toLocaleDateString('fr-FR');
  }

  private static formatPrice(price: number): string {
    return `${price.toFixed(2)} €`;
  }

  private static addHeader(doc: jsPDF, _contract: RentalContract, _type: PDFType) {
    // Centre pour A5 : 148mm / 2 = 74mm
    const centerX = 74;

    // Titre principal
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('JEAN JACQUES CÉRÉMONIES', centerX, 12, { align: 'center' });

    // Fondé en 1867
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Fondé en 1867', centerX, 18, { align: 'center' });

    // Site web
    doc.setFontSize(9);
    doc.text('www.jjloc.fr', centerX, 23, { align: 'center' });

    // Adresse
    doc.setFontSize(8);
    doc.text('2 rue Nicolas Flamel - 75004 Paris (Métro Châtelet)', centerX, 28, { align: 'center' });

    // Téléphone
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('01 43 54 25 56', centerX, 33, { align: 'center' });

    // Horaires
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text('Ouvert du mardi au samedi de 9h à 18h sans interruption', centerX, 38, { align: 'center' });
    doc.text('Fermé dimanche et lundi', centerX, 42, { align: 'center' });

    // Ligne de séparation - ajusté pour A5
    doc.line(10, 48, 138, 48);
  }

  private static addSimplifiedInfo(doc: jsPDF, contract: RentalContract, startY: number, participantIndex?: number): number {
    let currentY = startY;

    // Numéro de réservation - A5
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`N° Réservation: ${contract.numero}`, 10, currentY);
    currentY += 13;

    // Afficher le participant et ses vêtements
    let participant = null;
    let participantName = '';
    let showParticipantName = true; // Toujours afficher le nom maintenant

    // Pour un groupe avec un participant spécifique
    if (contract.groupDetails?.participants && contract.groupDetails.participants.length > 0 && participantIndex !== undefined) {
      participant = contract.groupDetails.participants[participantIndex];
      participantName = participant?.nom || '';
    }
    // Pour un contrat individuel, utiliser la tenue principale
    else if (contract.tenue && Object.keys(contract.tenue).length > 0) {
      participant = { tenue: contract.tenue };
      participantName = contract.client.nom;
    }

    // Téléphone - A5 (label en gras, valeur normale)
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`Téléphone: `, 10, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(`${contract.client.telephone}`, 35, currentY);
    currentY += 11;

    // Email - A5 (label en gras, valeur normale)
    doc.setFont('helvetica', 'bold');
    doc.text(`Email: `, 10, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(`${contract.client.email || 'Non renseigné'}`, 25, currentY);
    currentY += 13;

    if (participant) {
      // "Tenue de" + nom du participant (seulement pour les groupes) - A5
      if (showParticipantName && participantName) {
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(`Tenue de ${participantName}:`, 10, currentY);
        currentY += 11;
      }

      // Descriptif de ce qu'il a loué - A5 (même taille que téléphone/email)
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      const items = [];

      if (participant.tenue?.veste) {
        items.push(`Veste ${participant.tenue.veste.reference || ''} ${participant.tenue.veste.taille || ''} ${participant.tenue.veste.couleur || ''}`.trim());
      }
      if (participant.tenue?.gilet) {
        items.push(`Gilet ${participant.tenue.gilet.reference || ''} ${participant.tenue.gilet.taille || ''} ${participant.tenue.gilet.couleur || ''}`.trim());
      }
      if (participant.tenue?.pantalon) {
        items.push(`Pantalon ${participant.tenue.pantalon.reference || ''} ${participant.tenue.pantalon.taille || ''} ${participant.tenue.pantalon.couleur || ''}`.trim());
      }
      if (participant.tenue?.tailleChapeau) {
        items.push(`Chapeau taille ${participant.tenue.tailleChapeau}`);
      }
      if (participant.tenue?.tailleChaussures) {
        items.push(`Chaussures taille ${participant.tenue.tailleChaussures}`);
      }

      if (items.length > 0) {
        const itemsText = items.join(' / ');
        // Largeur maximum pour A5 (128mm utilisables)
        const maxWidth = 128;
        const textLines = doc.splitTextToSize(itemsText, maxWidth);

        textLines.forEach((line: string) => {
          doc.text(line, 10, currentY);
          currentY += 8;
        });
      } else {
        doc.text(`Aucun article`, 10, currentY);
        currentY += 8;
      }

      currentY += 8;
    }

    // À prendre le / À rendre le (sur une ligne) - A5
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`À prendre le: ${this.formatDate(contract.dateRetrait)}`, 10, currentY);
    doc.text(`À rendre le: ${this.formatDate(contract.dateRetour)}`, 138, currentY, { align: 'right' });
    currentY += 13;

    // Dépôt, arrhes et prix - A5 compact (en gras) - bien espacé sur toute la largeur
    const total = contract.tarifLocation + contract.depotGarantie;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`Dépôt: ${this.formatPrice(contract.depotGarantie)}`, 10, currentY);
    doc.text(`Arrhes: ${this.formatPrice(contract.arrhes)}`, 74, currentY, { align: 'center' });
    doc.text(`Prix: ${this.formatPrice(total)}`, 138, currentY, { align: 'right' });
    currentY += 11;

    return currentY;
  }

  private static addTenueInfo(doc: jsPDF, contract: RentalContract, startY: number, type: PDFType): number {
    let currentY = startY;

    // Créer un tableau unifié pour tous les types de contrats
    const allParticipants = [];

    // Pour contrats de groupe : utiliser les participants
    if (contract.groupDetails?.participants && contract.groupDetails.participants.length > 0) {
      contract.groupDetails.participants.forEach((participant, _index) => {
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
          if (_type === 'vendeur') {
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
          if (_type === 'vendeur') {
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
          if (_type === 'vendeur') {
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
          if (_type === 'vendeur') {
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
          if (_type === 'vendeur') {
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

  private static addFinancialInfo(doc: jsPDF, contract: RentalContract, startY: number, _type: PDFType): number {
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
    if (_type === 'vendeur') {
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

  private static addVendeurDetachableSection(doc: jsPDF, contract: RentalContract, contentEndY: number, participantIndex?: number): number {
    // Utiliser des valeurs pour A5 (148mm x 210mm)
    const pageHeight = 200; // Hauteur A5 effective
    const sectionHeight = 35; // Hauteur de la section détachable
    const minSpacing = 10; // Espacement minimum après le contenu

    // Position idéale en bas de page
    const idealY = pageHeight - sectionHeight;

    // Position minimum après le contenu
    const minY = contentEndY + minSpacing;

    // Utiliser la position qui garde la section dans la page
    const y = Math.min(minY, idealY);

    // Créer une ligne pointillée avec marges A5 (10mm des bords)
    doc.setLineDashPattern([2, 2], 0);
    doc.line(10, y, 138, y);
    doc.setLineDashPattern([], 0); // Reset dash pattern

    let currentY = y + 8;

    // Section détachable - maintenant vide (montants supprimés)

    // Ajouter une séparation verticale avec tirets au 2/3 de la zone détachable
    const sectionWidth = 138 - 10; // Largeur utilisable (bords exclus)
    const separationX = 10 + (sectionWidth * 2 / 3); // Position à 2/3 de la largeur

    // Ligne verticale en tirets - de haut en bas de la section détachable
    doc.setLineDashPattern([1, 1], 0);
    doc.line(separationX, y + 3, separationX, pageHeight - 5);
    doc.setLineDashPattern([], 0); // Reset dash pattern

    // Partie gauche - texte vertical
    const leftSectionX = 15; // Position dans la partie gauche

    // Récupérer les informations pour la partie gauche
    let personName = '';
    let participant = null;

    if (contract.groupDetails?.participants && contract.groupDetails.participants.length > 0 && participantIndex !== undefined) {
      // Pour un groupe avec participant spécifique
      participant = contract.groupDetails.participants[participantIndex];
      personName = participant?.nom || '';
    } else {
      // Pour un client individuel
      personName = contract.client.nom;
      participant = { tenue: contract.tenue };
    }

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');

    // Ajouter le numéro de réservation et le texte dans la partie droite
    const rightSectionX = separationX + 5; // Position dans la partie droite

    // Numéro de réservation
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`N° ${contract.numero}`, rightSectionX, currentY);

    // Section détachable droite maintenant vide (texte supprimé)

    // Nom et prénom (texte vertical de haut en bas) - même taille que la partie droite
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(personName, leftSectionX, currentY - 2, { angle: -90 });

    // Date de prise (texte vertical de haut en bas) - même taille que la partie droite
    doc.setFont('helvetica', 'normal');
    const dateRetrait = this.formatDate(contract.dateRetrait);
    doc.text(`Prise: ${dateRetrait}`, leftSectionX + 8, currentY - 2, { angle: -90 });

    // Taille du chapeau si présente (texte vertical au niveau de la jointure)
    const tailleChapeau = participant?.tenue?.tailleChapeau;
    if (tailleChapeau) {
      doc.text(`Chapeau: ${tailleChapeau}`, separationX - 8, currentY - 2, { angle: -90 });
    }

    return currentY + 10;
  }

  public static generatePDF(contract: RentalContract, type: PDFType, participantIndex?: number): void {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a5'
    });

    // Header simplifié
    this.addHeader(doc, contract, type);

    // Informations simplifiées - plus d'espace après l'en-tête A5
    let currentY = 60;
    currentY = this.addSimplifiedInfo(doc, contract, currentY, participantIndex);

    // Section détachable pour vendeur uniquement à position dynamique
    if (_type === 'vendeur') {
      this.addVendeurDetachableSection(doc, contract, currentY, participantIndex);
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
    const participantSuffix = participantIndex !== undefined ? `-participant-${participantIndex + 1}` : '';
    const filename = `bon-location-${contract.numero}${participantSuffix}-${type}.pdf`;
    doc.save(filename);
  }
}