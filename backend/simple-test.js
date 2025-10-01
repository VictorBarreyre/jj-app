const nodemailer = require('nodemailer');
require('dotenv').config();

async function testSMTP() {
  console.log('🧪 Test simple de la configuration SMTP Gmail...\n');
  
  console.log('Variables d\'environnement :');
  console.log('SMTP_HOST:', process.env.SMTP_HOST);
  console.log('SMTP_PORT:', process.env.SMTP_PORT);
  console.log('SMTP_USER:', process.env.SMTP_USER);
  console.log('EMAIL_FROM:', process.env.EMAIL_FROM);
  console.log('SMTP_PASS:', process.env.SMTP_PASS ? '***masqué***' : 'non défini');
  console.log();

  // Créer le transporteur
  const transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // Test de connexion
  try {
    console.log('1. Test de connexion SMTP...');
    await transporter.verify();
    console.log('✅ Connexion SMTP réussie !\n');

    // Test d'envoi d'email
    console.log('2. Test d\'envoi d\'email...');
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'Jean Jacques Cérémonies <jjceremonie@gmail.com>',
      to: 'barreyrevictorcontact@gmail.com',
      subject: 'Test SMTP Jean Jacques Cérémonies',
      html: `
        <h2>Test de configuration SMTP</h2>
        <p>Ce message confirme que la configuration Gmail SMTP fonctionne correctement.</p>
        <p>Date de test: ${new Date().toLocaleString('fr-FR')}</p>
        <hr>
        <p><em>Jean Jacques Cérémonies - Système automatisé</em></p>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email envoyé avec succès !');
    console.log('📧 Message ID:', info.messageId);
    console.log('📬 Vérifie ta boîte de réception à barreyrevictorcontact@gmail.com');

  } catch (error) {
    console.error('❌ Erreur :', error.message);
    if (error.code) {
      console.error('Code d\'erreur :', error.code);
    }
  }
}

testSMTP().catch(console.error);