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
    // Déterminer le participant et ses vêtements
    let participant = null;
    let participantName = '';
    let showParticipantName = true;

    if (contract.groupDetails?.participants && contract.groupDetails.participants.length > 0 && participantIndex !== undefined) {
      participant = contract.groupDetails.participants[participantIndex];
      participantName = participant?.prenom ? `${participant.prenom} ${participant.nom}` : participant?.nom || '';
    } else if (contract.tenue && Object.keys(contract.tenue).length > 0) {
      participant = { tenue: contract.tenue };
      participantName = contract.client.prenom ? `${contract.client.prenom} ${contract.client.nom}` : contract.client.nom;
    }

    // Construire la liste des vêtements
    const items = [];
    if (participant?.tenue?.veste) {
      items.push(`Veste ${participant.tenue.veste.reference || ''} ${participant.tenue.veste.taille || ''} ${participant.tenue.veste.couleur || ''}`.trim());
    }
    if (participant?.tenue?.gilet) {
      items.push(`Gilet ${participant.tenue.gilet.reference || ''} ${participant.tenue.gilet.taille || ''} ${participant.tenue.gilet.couleur || ''}`.trim());
    }
    if (participant?.tenue?.pantalon) {
      items.push(`Pantalon ${participant.tenue.pantalon.reference || ''} ${participant.tenue.pantalon.taille || ''} ${participant.tenue.pantalon.couleur || ''}`.trim());
    }
    if (participant?.tenue?.tailleChapeau) {
      items.push(`Chapeau taille ${participant.tenue.tailleChapeau}`);
    }
    if (participant?.tenue?.tailleChaussures) {
      items.push(`Chaussures taille ${participant.tenue.tailleChaussures}`);
    }

    const itemsText = items.length > 0 ? items.join(' / ') : 'Aucun article';
    const total = contract.tarifLocation + contract.depotGarantie;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Bon de location ${contract.numero}</title>
          <style>
            @page {
              size: A5;
              margin: 10mm;
            }

            body {
              font-family: 'Helvetica', Arial, sans-serif;
              font-size: 11px;
              line-height: 1.4;
              margin: 0;
              padding: 0;
              color: #333;
            }

            .header {
              text-align: center;
              margin-bottom: 20px;
              padding-bottom: 15px;
              border-bottom: 1px solid #000;
            }

            .header h1 {
              font-size: 18px;
              font-weight: bold;
              margin: 0 0 5px 0;
            }

            .header .subtitle {
              font-size: 9px;
              margin: 2px 0;
            }

            .header .contact {
              font-size: 9px;
              font-weight: bold;
              margin: 5px 0;
            }

            .content {
              margin-bottom: 20px;
            }

            .reservation-number {
              font-size: 11px;
              font-weight: bold;
              margin-bottom: 15px;
            }

            .client-info {
              margin-bottom: 15px;
            }

            .client-info .label {
              font-weight: bold;
              display: inline;
            }

            .participant-section {
              margin-bottom: 15px;
            }

            .participant-name {
              font-size: 11px;
              font-weight: bold;
              margin-bottom: 8px;
            }

            .items-text {
              font-size: 11px;
              margin-bottom: 15px;
              word-wrap: break-word;
            }

            .dates-prices {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 15px;
            }

            .dates {
              font-weight: bold;
            }

            .prices {
              display: flex;
              justify-content: space-between;
              width: 100%;
              font-weight: bold;
              margin-bottom: 15px;
            }

            .detachable-section {
              position: absolute;
              bottom: 35mm;
              left: 0;
              right: 0;
              border-top: 2px dashed #000;
              padding-top: 8px;
              height: 35mm;
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
              left: 15mm;
              top: 5px;
              transform: rotate(-90deg);
              transform-origin: left bottom;
              font-size: 11px;
            }

            .left-vertical-text.bold {
              font-weight: bold;
            }

            .left-vertical-text.date {
              left: 23mm;
            }

            .left-vertical-text.chapeau {
              left: calc(66.67% - 8mm);
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
            <div class="subtitle">3 rue Nicolas Flamel - 75004 Paris (Métro Châtelet)</div>
            <div class="contact">01 43 54 25 56</div>
            <div class="subtitle">Ouvert du mardi au samedi de 9h à 18h sans interruption</div>
            <div class="subtitle">Fermé dimanche et lundi</div>
          </div>

          <div class="content">
            <div class="reservation-number">
              N° Réservation: ${contract.numero}
            </div>

            <div class="client-info">
              <div><span class="label">Téléphone: </span>${contract.client.telephone}</div>
              <div><span class="label">Email: </span>${contract.client.email || 'Non renseigné'}</div>
            </div>

            ${showParticipantName && participantName ? `
              <div class="participant-section">
                <div class="participant-name">Tenue de ${participantName}:</div>
              </div>
            ` : ''}

            <div class="items-text">
              ${itemsText}
            </div>

            <div class="dates-prices">
              <div class="dates">À prendre le: ${this.formatDate(contract.dateRetrait)}</div>
              <div class="dates">À rendre le: ${this.formatDate(contract.dateRetour)}</div>
            </div>

            <div class="prices">
              <div>Dépôt: ${this.formatPrice(contract.depotGarantie)}</div>
              <div>Arrhes: ${this.formatPrice(contract.arrhes)}</div>
              <div>Prix: ${this.formatPrice(total)}</div>
            </div>
          </div>

          ${type === 'vendeur' ? `
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
          ` : ''}
        </body>
      </html>
    `;
  }

  async generatePDF(contract: RentalContract, type: PDFType, participantIndex?: number): Promise<Buffer> {
    let browser;
    try {
      // Configuration optimisée pour Heroku
      const config: any = {
        headless: true,
        timeout: 60000, // 60 secondes
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

      // Configuration spécifique pour Heroku avec Chrome for Testing
      if (process.env.DYNO) {
        console.log('🔍 Environment variables pour Chrome:');
        console.log('CHROME_EXECUTABLE_PATH:', process.env.CHROME_EXECUTABLE_PATH);
        console.log('GOOGLE_CHROME_BIN:', process.env.GOOGLE_CHROME_BIN);
        console.log('CHROME_BIN:', process.env.CHROME_BIN);
        
        config.executablePath = process.env.CHROME_EXECUTABLE_PATH || 
                               process.env.GOOGLE_CHROME_BIN || 
                               process.env.CHROME_BIN ||
                               '/app/.chrome-for-testing/chrome-linux64/chrome';
        
        console.log('📍 Chemin Chrome utilisé:', config.executablePath);
      }
      
      console.log('🚀 Lancement de Chrome...');
      browser = await puppeteer.launch(config);

      console.log('📄 Création d\'une nouvelle page...');
      const page = await browser.newPage();
      
      // Configuration de la page
      await page.setDefaultTimeout(30000);
      await page.setViewport({ width: 1200, height: 1600 });
      
      console.log('📝 Génération du contenu HTML...');
      const htmlContent = this.generateHTMLContent(contract, type, participantIndex);

      console.log('🔄 Chargement du contenu dans la page...');
      await page.setContent(htmlContent, { 
        waitUntil: 'domcontentloaded',
        timeout: 30000 
      });

      const pdfBuffer = await page.pdf({
        format: 'A5',
        printBackground: true,
        margin: {
          top: '10mm',
          right: '10mm',
          bottom: '10mm',
          left: '10mm'
        }
      });

      return Buffer.from(pdfBuffer);
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
}

export const backendPDFService = new BackendPDFService();