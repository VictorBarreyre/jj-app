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
    doc.text('RC PARIS 90B 16427', centerX, 46, { align: 'center' });

    // Ligne de séparation - ajusté pour A5
    doc.line(10, 52, 138, 52);
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
      participantName = participant?.prenom ? `${participant.prenom} ${participant.nom}` : participant?.nom || '';
    }
    // Pour un contrat individuel, utiliser la tenue principale
    else if (contract.tenue && Object.keys(contract.tenue).length > 0) {
      participant = { tenue: contract.tenue };
      participantName = contract.client.prenom ? `${contract.client.prenom} ${contract.client.nom}` : contract.client.nom;
    }

    // Téléphone et Email sur la même ligne - A5 (justify-content: space-between)
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`Téléphone: `, 10, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(`${contract.client.telephone}`, 32, currentY);
    
    // Email aligné à droite comme "À rendre" et "Arrhes"
    const emailLabel = 'Email: ';
    const emailValue = contract.client.email || 'Non renseigné';
    const spacing = 2; // Petit espacement entre label et valeur
    
    // Calculer la position pour aligner le tout à droite
    const totalWidth = doc.getTextWidth(emailLabel) + spacing + doc.getTextWidth(emailValue);
    const startPosition = 138 - totalWidth;
    
    doc.setFont('helvetica', 'bold');
    doc.text(emailLabel, startPosition, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(emailValue, startPosition + doc.getTextWidth(emailLabel) + spacing, currentY);
    currentY += 13;

    if (participant) {
      // "Tenue de" + nom du participant (seulement pour les groupes) - A5
      if (showParticipantName && participantName) {
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(`Tenue de ${participantName}:`, 10, currentY);
        currentY += 8;
      }

      // Descriptif de ce qu'il a loué - A5 (même taille que téléphone/email)
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      const items = [];

      if (participant.tenue?.veste) {
        const reference = participant.tenue.veste.reference || '';
        const taille = participant.tenue.veste.taille || '';
        const couleur = participant.tenue.veste.couleur || '';
        const longueurManche = participant.tenue.veste.longueurManche || '';
        const parts = [reference, taille, couleur, longueurManche].filter(part => part);
        items.push(`Veste:  ${parts.join(' / ')}`);
      }
      if (participant.tenue?.gilet) {
        const reference = participant.tenue.gilet.reference || '';
        const taille = participant.tenue.gilet.taille || '';
        const couleur = participant.tenue.gilet.couleur || '';
        const parts = [reference, taille, couleur].filter(part => part);
        items.push(`Gilet:  ${parts.join(' / ')}`);
      }
      if (participant.tenue?.pantalon) {
        const reference = participant.tenue.pantalon.reference || '';
        const taille = participant.tenue.pantalon.taille || '';
        const couleur = participant.tenue.pantalon.couleur || '';
        const longueur = participant.tenue.pantalon.longueur || '';
        const parts = [reference, taille, couleur, longueur].filter(part => part);
        items.push(`Pantalon:  ${parts.join(' / ')}`);
      }
      if (participant.tenue?.tailleChapeau) {
        items.push(`Chapeau:  ${participant.tenue.tailleChapeau}`);
      }
      if (participant.tenue?.tailleChaussures) {
        items.push(`Chaussures:  ${participant.tenue.tailleChaussures}`);
      }

      if (items.length > 0) {
        // Afficher chaque article sur une ligne séparée avec puce
        items.forEach((item: string) => {
          // Séparer la catégorie (avant le :) du reste
          const colonIndex = item.indexOf(':');
          if (colonIndex !== -1) {
            const category = item.substring(0, colonIndex + 1); // "Veste:", "Gilet:", etc.
            const details = item.substring(colonIndex + 1); // Le reste après le ":"
            
            // Afficher la puce et la catégorie en gras
            doc.setFont('helvetica', 'bold');
            const bulletAndCategory = `• ${category}`;
            doc.text(bulletAndCategory, 10, currentY);
            
            // Calculer la largeur du texte en gras pour positionner le texte normal
            const bulletCategoryWidth = doc.getTextWidth(bulletAndCategory);
            
            // Afficher les détails en normal
            doc.setFont('helvetica', 'normal');
            doc.text(details, 10 + bulletCategoryWidth, currentY);
          } else {
            // Cas où il n'y a pas de ":" (fallback)
            doc.setFont('helvetica', 'normal');
            doc.text(`• ${item}`, 10, currentY);
          }
          currentY += 8;
        });
      } else {
        doc.setFont('helvetica', 'normal');
        doc.text(`• Aucun article`, 10, currentY);
        currentY += 8;
      }

      currentY += 10;
    }

    // À prendre le / Événement / À rendre le (sur une ligne) - A5
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`À prendre le: ${this.formatDate(contract.dateRetrait)}`, 10, currentY);
    doc.text(`Événement: ${this.formatDate(contract.dateEvenement)}`, 74, currentY, { align: 'center' });
    doc.text(`À rendre le: ${this.formatDate(contract.dateRetour)}`, 138, currentY, { align: 'right' });
    currentY += 10;

    // Prix, caution et arrhes - A5 compact (en gras) - bien espacé sur toute la largeur
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`Prix: ${this.formatPrice(contract.tarifLocation)}`, 10, currentY);
    doc.text(`Caution: ${this.formatPrice(contract.depotGarantie)}`, 74, currentY, { align: 'center' });
    doc.text(`Arrhes: ${this.formatPrice(contract.arrhes)}`, 138, currentY, { align: 'right' });
    currentY += 11;

    return currentY;
  }

  private static addTenueInfo(doc: jsPDF, contract: RentalContract, startY: number, type: PDFType): number {
    let currentY = startY;

    // Créer une liste des participants pour tous les types de contrats
    const allParticipants = [];

    // Pour contrats de groupe : utiliser les participants
    if (contract.groupDetails?.participants && contract.groupDetails.participants.length > 0) {
      contract.groupDetails.participants.forEach((participant, _index) => {
        allParticipants.push({
          nom: participant.prenom ? `${participant.prenom} ${participant.nom}` : participant.nom,
          tenue: participant.tenue,
          notes: participant.notes
        });
      });
    }
    // Pour contrats individuels : créer un "participant" avec la tenue principale
    else if (contract.tenue && Object.keys(contract.tenue).length > 0) {
      allParticipants.push({
        nom: contract.client.prenom ? `${contract.client.prenom} ${contract.client.nom}` : contract.client.nom,
        tenue: contract.tenue,
        notes: contract.notes
      });
    }

    if (allParticipants.length > 0) {
      allParticipants.forEach((participant, index) => {
        // Espacement entre participants
        if (index > 0) {
          currentY += 15;
        }


        // Debug: vérifier si on a des articles
        let hasArticles = false;

        // Articles de la tenue
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        if (participant.tenue?.veste) {
          hasArticles = true;
          const parts = [
            participant.tenue.veste.reference,
            participant.tenue.veste.taille,
            participant.tenue.veste.couleur,
            participant.tenue.veste.longueurManche
          ].filter(p => p).join(' / ');
          doc.setFont('helvetica', 'bold');
          doc.text('• Veste:', 25, currentY);
          doc.setFont('helvetica', 'normal');
          doc.text(parts, 45, currentY);
          currentY += 6;
        }

        if (participant.tenue?.gilet) {
          hasArticles = true;
          const parts = [
            participant.tenue.gilet.reference,
            participant.tenue.gilet.taille,
            participant.tenue.gilet.couleur
          ].filter(p => p).join(' / ');
          doc.setFont('helvetica', 'bold');
          doc.text('• Gilet:', 25, currentY);
          doc.setFont('helvetica', 'normal');
          doc.text(parts, 45, currentY);
          currentY += 6;
        }

        if (participant.tenue?.pantalon) {
          hasArticles = true;
          const parts = [
            participant.tenue.pantalon.reference,
            participant.tenue.pantalon.taille,
            participant.tenue.pantalon.couleur,
            participant.tenue.pantalon.longueur
          ].filter(p => p).join(' / ');
          doc.setFont('helvetica', 'bold');
          doc.text('• Pantalon:', 25, currentY);
          doc.setFont('helvetica', 'normal');
          doc.text(parts, 45, currentY);
          currentY += 6;
        }

        if (participant.tenue?.tailleChapeau) {
          hasArticles = true;
          doc.setFont('helvetica', 'bold');
          doc.text('• Chapeau:', 25, currentY);
          doc.setFont('helvetica', 'normal');
          doc.text(participant.tenue.tailleChapeau, 45, currentY);
          currentY += 6;
        }

        if (participant.tenue?.tailleChaussures) {
          hasArticles = true;
          doc.setFont('helvetica', 'bold');
          doc.text('• Chaussures:', 25, currentY);
          doc.setFont('helvetica', 'normal');
          doc.text(participant.tenue.tailleChaussures, 45, currentY);
          currentY += 6;
        }

        // Si aucun article trouvé, afficher un message
        if (!hasArticles) {
          doc.setFont('helvetica', 'normal');
          doc.text('• Aucun article', 25, currentY);
          currentY += 6;
        }

        // Notes du participant si présentes et pour vendeur uniquement
        if (type === 'vendeur' && participant.notes) {
          currentY += 4;
          doc.setFont('helvetica', 'bold');
          doc.text('📝 Notes:', 25, currentY);
          doc.setFont('helvetica', 'normal');
          doc.text(participant.notes, 45, currentY);
          currentY += 6;
        }
      });
    }

    return currentY + 10;
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

    doc.text(`Tarif location: ${this.formatPrice(contract.tarifLocation)}`, 20, currentY);
    doc.text(`Caution: ${this.formatPrice(contract.depotGarantie)}`, 20, currentY + 6);
    doc.text(`Arrhes: ${this.formatPrice(contract.arrhes)}`, 20, currentY + 12);

    // Informations de paiement pour le vendeur uniquement
    if (type === 'vendeur') {
      currentY += 20;
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
      personName = participant?.prenom ? `${participant.prenom} ${participant.nom}` : participant?.nom || '';
    } else {
      // Pour un client individuel
      personName = contract.client.prenom ? `${contract.client.prenom} ${contract.client.nom}` : contract.client.nom;
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

    // Nom du participant
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(personName, rightSectionX, currentY + 5);

    // Texte "à ne pas retirer de la housse"
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(102, 102, 102); // #666
    doc.text('(à ne pas retirer de la housse)', rightSectionX, currentY + 9);
    doc.setTextColor(0, 0, 0); // Reset to black

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
    if (type === 'vendeur') {
      this.addVendeurDetachableSection(doc, contract, currentY, participantIndex);
    }

    // Afficher les tenues sur la page courante
    currentY = this.addTenueInfo(doc, contract, currentY, type);

    // Stock items
    if (contract.articlesStock && contract.articlesStock.length > 0) {
      currentY = this.addStockItems(doc, contract, currentY);
    }

    // Conditions pour le client uniquement
    if (type === 'client' && currentY < 240) {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('Conditions: Location soumise aux conditions générales disponibles en magasin.', 20, 250);
      doc.text('Tout retard de retour fera l\'objet d\'une facturation supplémentaire.', 20, 255);
    }

    // Sauvegarder le PDF
    const participantSuffix = participantIndex !== undefined ? `-participant-${participantIndex + 1}` : '';
    const filename = `bon-location-${contract.numero}${participantSuffix}-${type}.pdf`;
    doc.save(filename);
  }
}