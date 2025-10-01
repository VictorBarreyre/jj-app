import nodemailer from 'nodemailer';
import type { RentalContract } from '../models/RentalContract';

export interface EmailAttachment {
  filename: string;
  content: Buffer;
  contentType: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  private formatDate(dateInput: string | Date): string {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return date.toLocaleDateString('fr-FR');
  }

  private generateEmailTemplate(contract: RentalContract): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Bon de location Jean Jacques Cérémonies</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .header { background-color: #000000; color: white; padding: 20px; text-align: center; }
            .header a { color: white; text-decoration: none; }
            .content { padding: 20px; }
            .footer { background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; }
            .highlight { color: #d97706; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>JEAN JACQUES CÉRÉMONIES</h1>
            <p>Fondé en 1867 - <a href="https://www.jjloc.fr">www.jjloc.fr</a></p>
          </div>

          <div class="content">
            <h2>Bonjour ${contract.client.nom},</h2>

            <p>Nous vous remercions pour votre confiance. Voici votre bon de location :</p>

            <ul>
              <li><strong>Numéro de réservation :</strong> <span class="highlight">${contract.numero}</span></li>
              <li><strong>Date de retrait :</strong> ${this.formatDate(contract.dateRetrait)}</li>
              <li><strong>Date de retour :</strong> ${this.formatDate(contract.dateRetour)}</li>
              <li><strong>Vendeur :</strong> ${contract.vendeur}</li>
            </ul>

            <p><strong>Important :</strong></p>
            <ul>
              <li>Merci de vous présenter avec une pièce d'identité pour le retrait</li>
              <li>Vérifiez soigneusement vos articles à la réception</li>
              <li>Tout retard fera l'objet d'une facturation supplémentaire</li>
            </ul>

            <p>En cas de question, n'hésitez pas à nous contacter au 01 43 54 25 56.</p>

            <p>Cordialement,<br>L'équipe Jean Jacques Cérémonies</p>
          </div>

          <div class="footer">
            <p>3 rue Nicolas Flamel - 75004 Paris (Métro Châtelet)<br>
            Ouvert du mardi au samedi de 9h à 18h sans interruption</p>
          </div>
        </body>
      </html>
    `;
  }

  async sendContractEmail(
    contract: RentalContract,
    pdfBuffer: Buffer,
    recipientEmail?: string
  ): Promise<boolean> {
    try {
      const toEmail = recipientEmail || contract.client.email;

      if (!toEmail) {
        console.warn(`No email address for contract ${contract.numero}`);
        return false;
      }

      const mailOptions = {
        from: process.env.EMAIL_FROM || 'Jean Jacques Cérémonies <noreply@jjloc.fr>',
        to: toEmail,
        subject: `Bon de location Jean Jacques Cérémonies - N° ${contract.numero}`,
        html: this.generateEmailTemplate(contract),
        attachments: [
          {
            filename: `bon-location-${contract.numero}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf'
          }
        ]
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('SMTP connection successful');
      return true;
    } catch (error) {
      console.error('SMTP connection failed:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();