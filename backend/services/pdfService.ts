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

  private formatPrice(price: number): string {
    return `${price.toFixed(2)} €`;
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
      const parts = [
        participant.tenue.veste.reference,
        participant.tenue.veste.taille,
        participant.tenue.veste.couleur,
        participant.tenue.veste.longueurManche
      ].filter(p => p).join(' / ');
      itemsHTML.push(`<div style="margin-bottom: 8px;"><span style="font-weight: bold;">• Veste:</span> ${parts}</div>`);
    }
    if (participant?.tenue?.gilet) {
      const parts = [
        participant.tenue.gilet.reference,
        participant.tenue.gilet.taille,
        participant.tenue.gilet.couleur
      ].filter(p => p).join(' / ');
      itemsHTML.push(`<div style="margin-bottom: 8px;"><span style="font-weight: bold;">• Gilet:</span> ${parts}</div>`);
    }
    if (participant?.tenue?.pantalon) {
      const parts = [
        participant.tenue.pantalon.reference,
        participant.tenue.pantalon.taille,
        participant.tenue.pantalon.couleur,
        participant.tenue.pantalon.longueur
      ].filter(p => p).join(' / ');
      itemsHTML.push(`<div style="margin-bottom: 8px;"><span style="font-weight: bold;">• Pantalon:</span> ${parts}</div>`);
    }
    if (participant?.tenue?.tailleChapeau) {
      itemsHTML.push(`<div style="margin-bottom: 8px;"><span style="font-weight: bold;">• Chapeau:</span> ${participant.tenue.tailleChapeau}</div>`);
    }
    if (participant?.tenue?.tailleChaussures) {
      itemsHTML.push(`<div style="margin-bottom: 8px;"><span style="font-weight: bold;">• Chaussures:</span> ${participant.tenue.tailleChaussures}</div>`);
    }

    const itemsText = itemsHTML.length > 0 ? itemsHTML.join('') : '<div>• Aucun article</div>';

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Bon de location Jean Jacques Cérémonies</title>
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
              font-size: 11px;
              line-height: 1.4;
              padding: 10mm 10mm 10mm 10mm;
              width: 148mm;
              height: 210mm;
              position: relative;
            }

            .header {
              text-align: center;
              margin-bottom: 15px;
              padding-bottom: 10px;
              border-bottom: 1px solid #000;
            }

            .header h1 {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 5px;
            }

            .header .subtitle {
              font-size: 8px;
              margin: 2px 0;
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
              font-size: 11px;
              font-weight: bold;
              margin-bottom: 13px;
            }

            .client-info {
              margin-bottom: 13px;
              font-size: 11px;
              display: flex;
              justify-content: space-between;
            }

            .client-info .label {
              font-weight: bold;
            }

            .participant-section {
              font-size: 11px;
              font-weight: bold;
              margin-bottom: 8px;
            }

            .items-section {
              font-size: 11px;
              margin-bottom: 13px;
            }

            .dates-row {
              font-size: 9px;
              font-weight: bold;
              margin-bottom: 10px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }

            .prices-row {
              font-size: 11px;
              font-weight: bold;
              margin-bottom: 11px;
              display: flex;
              justify-content: space-between;
            }

            .detachable-section {
              position: absolute;
              bottom: 10mm;
              left: 10mm;
              right: 10mm;
              height: 35mm;
              border-top: 2px dashed #000;
              padding-top: 8px;
            }

            .vertical-separator {
              position: absolute;
              left: 66.67%;
              top: 3px;
              bottom: 5px;
              border-left: 1px dashed #000;
            }

            .left-vertical-text {
              position: absolute;
              font-size: 11px;
              transform: rotate(-90deg);
              transform-origin: left bottom;
            }

            .left-vertical-text.bold {
              font-weight: bold;
              left: 15mm;
              top: 5px;
            }

            .left-vertical-text.date {
              left: 23mm;
              top: 5px;
            }

            .left-vertical-text.chapeau {
              left: calc(66.67% - 8mm);
              top: 5px;
            }

            .right-section {
              position: absolute;
              right: 5mm;
              top: 8px;
              width: 40mm;
              font-size: 11px;
              font-weight: bold;
              text-align: left;
              line-height: 1.3;
            }

            .client-name {
              font-size: 10px;
              margin-top: 3px;
              font-weight: bold;
              display: block;
            }

            .not-remove-text {
              font-size: 8px;
              margin-top: 2px;
              font-weight: normal;
              color: #666;
              display: block;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>JEAN JACQUES CÉRÉMONIES</h1>
            <div class="subtitle">Fondé en 1867</div>
            <div class="subtitle">www.jjloc.fr</div>
            <div class="subtitle">2 rue Nicolas Flamel - 75004 Paris (Métro Châtelet)</div>
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
            <div>Caution: ${this.formatPrice(contract.depotGarantie)}</div>
            <div>Arrhes: ${this.formatPrice(contract.arrhes)}</div>
          </div>

          <div class="detachable-section">
            <div class="vertical-separator"></div>

            <div class="left-vertical-text bold">${participantName}</div>
            <div class="left-vertical-text date">Prise: ${this.formatDate(contract.dateRetrait)}</div>
            ${participant?.tenue?.tailleChapeau ? `
              <div class="left-vertical-text chapeau">Chapeau: ${participant.tenue.tailleChapeau}</div>
            ` : ''}

            <div class="right-section">
              N° ${contract.numero}<br>
              <span class="client-name">${participantName}</span><br>
              <span class="not-remove-text">(à ne pas retirer de la housse)</span>
            </div>
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
