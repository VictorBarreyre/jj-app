import { emailService } from '../services/emailService';
import { RentalContract } from '../models/RentalContract';

// Test de la configuration SMTP
async function testEmailConfiguration() {
  console.log('🧪 Test de la configuration SMTP Gmail...\n');

  // 1. Test de connexion SMTP
  console.log('1. Test de connexion SMTP...');
  const isConnected = await emailService.testConnection();
  
  if (!isConnected) {
    console.error('❌ Échec de la connexion SMTP');
    return;
  }
  
  console.log('✅ Connexion SMTP réussie\n');

  // 2. Test d'envoi d'email avec un contrat factice
  console.log('2. Test d\'envoi d\'email...');
  
  const testContract: RentalContract = {
    id: 'test-001',
    numero: 'TEST-2024-001',
    dateCreation: new Date().toISOString(),
    dateEvenement: '2024-12-25',
    dateRetrait: '2024-12-24',
    dateRetour: '2024-12-26',
    client: {
      nom: 'Test Client',
      telephone: '0123456789',
      email: 'test@example.com', // Remplace par un vrai email pour tester
    },
    vendeur: 'Test Vendeur',
    tenue: {
      veste: {
        reference: 'VESTE-TEST',
        taille: '50',
        couleur: 'noir'
      }
    },
    tarifLocation: 150,
    depotGarantie: 300,
    arrhes: 50,
    rendu: false,
    status: 'confirme',
    type: 'individuel',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Créer un PDF factice pour le test
  const testPdfBuffer = Buffer.from('PDF de test', 'utf-8');

  try {
    // IMPORTANT: Remplace 'test@example.com' par ton vrai email pour recevoir le test
    const emailSent = await emailService.sendContractEmail(
      testContract, 
      testPdfBuffer,
      'ton-email@gmail.com' // 👈 REMPLACE PAR TON EMAIL
    );

    if (emailSent) {
      console.log('✅ Email de test envoyé avec succès !');
      console.log('📧 Vérifie ta boîte de réception');
    } else {
      console.log('❌ Échec de l\'envoi de l\'email');
    }
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi :', error);
  }
}

// Fonction pour tester uniquement la connexion (sans envoi)
async function testConnectionOnly() {
  console.log('🔗 Test de connexion SMTP uniquement...\n');
  
  const isConnected = await emailService.testConnection();
  
  if (isConnected) {
    console.log('✅ Configuration SMTP valide !');
    console.log('📋 Variables configurées :');
    console.log(`   SMTP_HOST: ${process.env.SMTP_HOST}`);
    console.log(`   SMTP_PORT: ${process.env.SMTP_PORT}`);
    console.log(`   SMTP_USER: ${process.env.SMTP_USER}`);
    console.log(`   EMAIL_FROM: ${process.env.EMAIL_FROM}`);
  } else {
    console.log('❌ Problème de configuration SMTP');
    console.log('📋 Vérifiez vos variables d\'environnement');
  }
}

// Script principal
async function main() {
  // Charger les variables d'environnement
  require('dotenv').config();

  const args = process.argv.slice(2);
  
  if (args.includes('--connection-only')) {
    await testConnectionOnly();
  } else {
    await testEmailConfiguration();
  }
}

// Exécuter le script
if (require.main === module) {
  main().catch(console.error);
}