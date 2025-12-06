import puppeteer from 'puppeteer';
import type { RentalContract } from '../models/RentalContract';

export type PDFType = 'vendeur' | 'client';

export class BackendPDFService {
  private formatDate(dateString: string | Date): string {
    if (typeof dateString === 'string') {
      return new Date(dateString).toLocaleDateString('fr-FR');
    }
    return dateString.toLocaleDateString('fr-FR');
  }

  private formatPrice(price?: number): string {
    if (price === undefined || price === null) {
      return '0.00 €';
    }
    return `${price.toFixed(2)} €`;
  }

  private formatReference(reference: string): string {
    if (!reference) return '';
    // Remplacer les tirets par des espaces et capitaliser la première lettre
    return reference
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  private generateHTMLContent(contract: RentalContract, type: PDFType, participantIndex?: number): string {
    // Déterminer le participant
    let participant = null;
    let participantName = '';

    if (contract.groupDetails?.participants && contract.groupDetails.participants.length > 0 && participantIndex !== undefined) {
      participant = contract.groupDetails.participants[participantIndex];
      participantName = participant?.prenom ? `${participant.prenom} ${participant.nom}` : participant?.nom || '';
    } else if (contract.tenue && Object.keys(contract.tenue).length > 0) {
      participant = { tenue: contract.tenue };
      participantName = contract.client.prenom ? `${contract.client.prenom} ${contract.client.nom}` : contract.client.nom;
    }

    // Construire la liste des vêtements
    const itemsHTML = [];
    if (participant?.tenue?.veste) {
      // Inclure les tailles seulement pour le PDF vendeur
      const parts = type === 'vendeur'
        ? [
            this.formatReference(participant.tenue.veste.reference),
            participant.tenue.veste.taille,
            participant.tenue.veste.couleur,
            participant.tenue.veste.longueurManche
          ].filter(p => p)
        : [
            this.formatReference(participant.tenue.veste.reference),
            participant.tenue.veste.couleur
          ].filter(p => p);
      const joined = parts.join(' / ');
      // Inclure les notes seulement pour le PDF vendeur
      const notes = type === 'vendeur' ? (participant.tenue.veste.notes || '') : '';
      const itemText = notes ? `${joined} <span style="font-style: italic; color: #666;">(${notes})</span>` : joined;
      itemsHTML.push(`<div style="margin-bottom: 16px;"><span style="font-weight: bold;">• Veste:</span> ${itemText}</div>`);
    }
    if (participant?.tenue?.gilet) {
      // Inclure les tailles seulement pour le PDF vendeur
      const parts = type === 'vendeur'
        ? [
            this.formatReference(participant.tenue.gilet.reference),
            participant.tenue.gilet.taille,
            participant.tenue.gilet.couleur
          ].filter(p => p)
        : [
            this.formatReference(participant.tenue.gilet.reference),
            participant.tenue.gilet.couleur
          ].filter(p => p);
      const joined = parts.join(' / ');
      // Inclure les notes seulement pour le PDF vendeur
      const notes = type === 'vendeur' ? (participant.tenue.gilet.notes || '') : '';
      const itemText = notes ? `${joined} <span style="font-style: italic; color: #666;">(${notes})</span>` : joined;
      itemsHTML.push(`<div style="margin-bottom: 16px;"><span style="font-weight: bold;">• Gilet:</span> ${itemText}</div>`);
    }
    if (participant?.tenue?.pantalon) {
      // Inclure les tailles seulement pour le PDF vendeur
      const parts = type === 'vendeur'
        ? [
            this.formatReference(participant.tenue.pantalon.reference),
            participant.tenue.pantalon.taille,
            participant.tenue.pantalon.couleur,
            participant.tenue.pantalon.longueur
          ].filter(p => p)
        : [
            this.formatReference(participant.tenue.pantalon.reference),
            participant.tenue.pantalon.couleur
          ].filter(p => p);
      const joined = parts.join(' / ');
      // Inclure les notes seulement pour le PDF vendeur
      const notes = type === 'vendeur' ? (participant.tenue.pantalon.notes || '') : '';
      const itemText = notes ? `${joined} <span style="font-style: italic; color: #666;">(${notes})</span>` : joined;
      itemsHTML.push(`<div style="margin-bottom: 16px;"><span style="font-weight: bold;">• Pantalon:</span> ${itemText}</div>`);
    }
    if (participant?.tenue?.tailleChapeau) {
      // Afficher la taille seulement pour le PDF vendeur
      const text = type === 'vendeur' ? participant.tenue.tailleChapeau : '';
      if (text || type === 'client') {
        itemsHTML.push(`<div style="margin-bottom: 16px;"><span style="font-weight: bold;">• Chapeau${type === 'vendeur' ? ':' : ''}</span> ${text}</div>`);
      }
    }
    if (participant?.tenue?.tailleChaussures) {
      // Afficher la taille avec V/NV seulement pour le PDF vendeur
      const chaussuresText = participant.tenue.chaussuresType
        ? `${participant.tenue.tailleChaussures} ${participant.tenue.chaussuresType}`
        : participant.tenue.tailleChaussures;
      const text = type === 'vendeur' ? chaussuresText : '';
      if (text || type === 'client') {
        itemsHTML.push(`<div style="margin-bottom: 16px;"><span style="font-weight: bold;">• Chaussures${type === 'vendeur' ? ':' : ''}</span> ${text}</div>`);
      }
    }

    const itemsText = itemsHTML.length > 0 ? itemsHTML.join('') : '<div>• Aucun article</div>';

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Bon de location Jean Jacques Cérémonie</title>
          <style>
            @page {
              size: A5;
              margin: 0;
            }

            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }

            body {
              font-family: Helvetica, Arial, sans-serif;
              font-size: 13px;
              line-height: 1.5;
              padding: 10mm 10mm 10mm 10mm;
              width: 148mm;
              height: 210mm;
              position: relative;
            }

            .header {
              text-align: center;
              margin-bottom: 20px;
              padding-bottom: 12px;
              border-bottom: 1px solid #000;
            }

            .header h1 {
              font-size: 22px;
              font-weight: bold;
              margin-bottom: 8px;
            }

            .header .subtitle {
              font-size: 9px;
              margin: 3px 0;
            }

            .header .subtitle.small {
              font-size: 7px;
            }

            .header .contact {
              font-size: 9px;
              font-weight: bold;
              margin: 5px 0;
            }

            .reservation-number {
              font-size: 14px;
              font-weight: bold;
              margin-bottom: 20px;
            }

            .client-info {
              margin-bottom: 24px;
              font-size: 13px;
              display: flex;
              justify-content: space-between;
            }

            .client-info .label {
              font-weight: bold;
            }

            .participant-section {
              font-size: 14px;
              font-weight: bold;
              margin-bottom: 6px;
              margin-top: 24px;
            }

            .items-section {
              font-size: 13px;
              margin-bottom: 36px;
            }

            .dates-row {
              font-size: 11px;
              font-weight: bold;
              margin-bottom: 28px;
              margin-top: 16px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }

            .prices-row {
              font-size: 13px;
              font-weight: bold;
              margin-bottom: 8px;
              margin-top: 16px;
              display: flex;
              justify-content: space-between;
            }

            .payment-methods-row {
              font-size: 10px;
              font-weight: normal;
              margin-bottom: 28px;
              display: flex;
              justify-content: space-between;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>JEAN JACQUES CÉRÉMONIE</h1>
            <div class="subtitle">Fondé en 1867</div>
            <div class="subtitle">www.jjloc.fr</div>
            <div class="subtitle">3 rue Nicolas Flamel - 75004 Paris (Métro Châtelet)</div>
            <div class="contact">01 43 54 25 56</div>
            <div class="subtitle small">Ouvert du mardi au samedi de 9h à 18h sans interruption</div>
            <div class="subtitle small">Fermé dimanche et lundi</div>
            <div class="subtitle small">RC PARIS 90B 16427</div>
          </div>

          <div class="reservation-number">
            N° Réservation: ${contract.numero}
          </div>

          <div class="client-info">
            <div><span class="label">Téléphone:</span> ${contract.client.telephone}</div>
            <div><span class="label">Email:</span> ${contract.client.email || 'Non renseigné'}</div>
          </div>

          ${participantName ? `
            <div class="participant-section">
              Tenue de ${participantName}:
            </div>
          ` : ''}

          <div class="items-section">
            ${itemsText}
          </div>

          <div class="dates-row">
            <div>À prendre le: ${this.formatDate(contract.dateRetrait)}</div>
            <div>Événement: ${this.formatDate(contract.dateEvenement)}</div>
            <div>À rendre le: ${this.formatDate(contract.dateRetour)}</div>
          </div>

          <div class="prices-row">
            <div>Prix: ${this.formatPrice(contract.tarifLocation || 0)}</div>
            <div>Dépôt de garantie: ${this.formatPrice(contract.depotGarantie)}</div>
            <div>Arrhes: ${this.formatPrice(contract.arrhes)}</div>
          </div>

          <div class="payment-methods-row">
            <div>${contract.paiementSolde?.method ? `Payé en ${contract.paiementSolde.method}` : 'Non payé'}</div>
            <div>${contract.paiementDepotGarantie?.method ? `Fait en ${contract.paiementDepotGarantie.method}` : 'Non versé'}</div>
            <div>${contract.paiementArrhes?.method ? `Payées en ${contract.paiementArrhes.method}` : 'Non versées'}</div>
          </div>

        </body>
      </html>
    `;
  }

  async generatePDF(contract: RentalContract, type: PDFType, participantIndex?: number): Promise<Buffer> {
    let browser;
    try {
      const config: any = {
        headless: true,
        timeout: 60000,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--disable-software-rasterizer',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
          '--disable-web-security',
          '--disable-features=TranslateUI',
          '--disable-ipc-flooding-protection',
          '--memory-pressure-off',
          '--max_old_space_size=4096'
        ]
      };

      if (process.env.DYNO) {
        config.executablePath = process.env.CHROME_EXECUTABLE_PATH ||
                               process.env.GOOGLE_CHROME_BIN ||
                               process.env.CHROME_BIN ||
                               '/app/.chrome-for-testing/chrome-linux64/chrome';
      }

      browser = await puppeteer.launch(config);
      const page = await browser.newPage();

      await page.setDefaultTimeout(30000);

      const htmlContent = this.generateHTMLContent(contract, type, participantIndex);
      await page.setContent(htmlContent, {
        waitUntil: 'networkidle0',
        timeout: 30000
      });

      const pdfBuffer = await page.pdf({
        format: 'A5',
        printBackground: true,
        preferCSSPageSize: true,
        margin: {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0
        }
      });

      return Buffer.from(pdfBuffer);
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      throw error;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
}

export const backendPDFService = new BackendPDFService();
