/**
 * Script de vérification de la migration des jaquettes
 *
 * Ce script vérifie qu'il n'y a plus d'anciennes références dans la base de données
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Charger les variables d'environnement
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is required. Set it in your .env file.');
}

// Anciens noms à vérifier
const OLD_NAMES = [
  'Jaquette FFF',
  'Jaquette FF Clair',
  'Jaquette FF clair',
  'Jaquette ff clair'
];

// Nouveaux noms attendus
const NEW_NAMES = [
  'Jaquette Fil à Fil Foncé',
  'Jaquette Fil à Fil Clair'
];

async function verifyMigration() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }

    let hasIssues = false;

    // 1. Vérifier StockItem
    console.log('📦 Vérification de la collection StockItem...');
    const stockCollection = db.collection('stockitems');

    for (const oldName of OLD_NAMES) {
      const count = await stockCollection.countDocuments({ reference: oldName });
      if (count > 0) {
        console.log(`  ❌ PROBLÈME: ${count} article(s) avec l'ancien nom "${oldName}"`);
        hasIssues = true;
      }
    }

    // Vérifier les nouveaux noms
    for (const newName of NEW_NAMES) {
      const count = await stockCollection.countDocuments({ reference: newName });
      if (count > 0) {
        console.log(`  ✓ ${count} article(s) avec le nouveau nom "${newName}"`);
      }
    }

    if (!hasIssues) {
      console.log('  ✅ StockItem: Aucun ancien nom trouvé\n');
    } else {
      console.log();
    }

    // 2. Vérifier RentalContract
    console.log('📄 Vérification de la collection RentalContract...');
    const contractsCollection = db.collection('rentalcontracts');
    const contracts = await contractsCollection.find({}).toArray();

    let contractIssues = 0;
    let contractUpdated = 0;

    for (const contract of contracts) {
      // Vérifier tenueInfo.veste.reference
      if (contract.tenueInfo?.veste?.reference) {
        if (OLD_NAMES.includes(contract.tenueInfo.veste.reference)) {
          console.log(`  ❌ Contrat ${contract._id}: ancien nom dans tenueInfo.veste.reference`);
          contractIssues++;
        } else if (NEW_NAMES.includes(contract.tenueInfo.veste.reference)) {
          contractUpdated++;
        }
      }

      // Vérifier items[]
      if (contract.items && Array.isArray(contract.items)) {
        for (const item of contract.items) {
          if (item.reference && OLD_NAMES.includes(item.reference)) {
            console.log(`  ❌ Contrat ${contract._id}: ancien nom dans items[] - "${item.reference}"`);
            contractIssues++;
          }
        }
      }
    }

    if (contractIssues === 0) {
      console.log(`  ✅ RentalContract: Aucun ancien nom trouvé`);
      if (contractUpdated > 0) {
        console.log(`  ✓ ${contractUpdated} contrat(s) avec les nouveaux noms\n`);
      }
    } else {
      console.log(`  ⚠️  ${contractIssues} problème(s) trouvé(s)\n`);
      hasIssues = true;
    }

    // 3. Vérifier StockMovement
    console.log('📋 Vérification de la collection StockMovement...');
    const movementsCollection = db.collection('stockmovements');
    const movements = await movementsCollection.find({}).toArray();

    let movementIssues = 0;

    for (const movement of movements) {
      if (movement.commentaire) {
        for (const oldName of OLD_NAMES) {
          if (movement.commentaire.includes(oldName)) {
            console.log(`  ❌ Mouvement ${movement._id}: ancien nom dans commentaire`);
            movementIssues++;
            break;
          }
        }
      }
    }

    if (movementIssues === 0) {
      console.log('  ✅ StockMovement: Aucun ancien nom trouvé\n');
    } else {
      console.log(`  ⚠️  ${movementIssues} problème(s) trouvé(s)\n`);
      hasIssues = true;
    }

    // 4. Vérifier StockAlert
    console.log('⚠️  Vérification de la collection StockAlert...');
    const alertsCollection = db.collection('stockalerts');

    for (const oldName of OLD_NAMES) {
      const count = await alertsCollection.countDocuments({ reference: oldName });
      if (count > 0) {
        console.log(`  ❌ PROBLÈME: ${count} alerte(s) avec l'ancien nom "${oldName}"`);
        hasIssues = true;
      }
    }

    if (!hasIssues) {
      console.log('  ✅ StockAlert: Aucun ancien nom trouvé\n');
    } else {
      console.log();
    }

    // Résumé final
    console.log('═'.repeat(60));
    if (hasIssues) {
      console.log('❌ MIGRATION INCOMPLÈTE - Des problèmes ont été détectés');
      console.log('   Veuillez exécuter à nouveau le script de migration:');
      console.log('   npm run migrate:jaquette-names');
      process.exit(1);
    } else {
      console.log('✅ MIGRATION RÉUSSIE - Aucun ancien nom détecté');
      console.log('   Tous les noms ont été correctement mis à jour !');
    }
    console.log('═'.repeat(60));

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnecté de MongoDB');
  }
}

// Exécuter la vérification
verifyMigration();
