/**
 * Script de migration pour renommer les jaquettes dans la base de données
 *
 * Ce script met à jour :
 * - "Jaquette FFF" -> "Jaquette Fil à Fil Foncé"
 * - "Jaquette FF Clair" -> "Jaquette Fil à Fil Clair"
 *
 * Dans les collections :
 * - StockItem (stock)
 * - RentalContract (contrats de location)
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Charger les variables d'environnement
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://barreyrevictorcontact:UrxGVftvE26QBCET@cluster0.fpj3xgu.mongodb.net/jj-app?retryWrites=true&w=majority&appName=Cluster0';

// Mapping des anciens noms vers les nouveaux
const RENAME_MAP = {
  'Jaquette FFF': 'Jaquette Fil à Fil Foncé',
  'Jaquette FF Clair': 'Jaquette Fil à Fil Clair',
  'Jaquette FF clair': 'Jaquette Fil à Fil Clair', // Variante possible
  'Jaquette ff clair': 'Jaquette Fil à Fil Clair'  // Variante possible
};

async function migrateDatabase() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }

    // 1. Mise à jour de la collection StockItem
    console.log('\n📦 Mise à jour de la collection StockItem...');
    const stockCollection = db.collection('stockitems');

    let stockUpdated = 0;
    for (const [oldName, newName] of Object.entries(RENAME_MAP)) {
      const result = await stockCollection.updateMany(
        { reference: oldName },
        { $set: { reference: newName } }
      );
      stockUpdated += result.modifiedCount;
      if (result.modifiedCount > 0) {
        console.log(`  ✓ "${oldName}" -> "${newName}": ${result.modifiedCount} articles mis à jour`);
      }
    }
    console.log(`📊 Total articles de stock mis à jour: ${stockUpdated}`);

    // 2. Mise à jour de la collection RentalContract
    console.log('\n📄 Mise à jour de la collection RentalContract...');
    const contractsCollection = db.collection('rentalcontracts');

    // Récupérer tous les contrats
    const contracts = await contractsCollection.find({}).toArray();
    let contractsUpdated = 0;

    for (const contract of contracts) {
      let modified = false;
      const updates: any = {};

      // Mise à jour de tenueInfo.veste.reference
      if (contract.tenueInfo?.veste?.reference && RENAME_MAP[contract.tenueInfo.veste.reference as keyof typeof RENAME_MAP]) {
        if (!updates.tenueInfo) updates.tenueInfo = contract.tenueInfo;
        if (!updates.tenueInfo.veste) updates.tenueInfo.veste = contract.tenueInfo.veste;
        updates.tenueInfo.veste.reference = RENAME_MAP[contract.tenueInfo.veste.reference as keyof typeof RENAME_MAP];
        modified = true;
      }

      // Mise à jour des articles dans items[]
      if (contract.items && Array.isArray(contract.items)) {
        const updatedItems = contract.items.map((item: any) => {
          if (item.reference && RENAME_MAP[item.reference as keyof typeof RENAME_MAP]) {
            return { ...item, reference: RENAME_MAP[item.reference as keyof typeof RENAME_MAP] };
          }
          return item;
        });

        // Vérifier si des modifications ont été faites
        const itemsModified = contract.items.some((item: any, index: number) =>
          item.reference !== updatedItems[index].reference
        );

        if (itemsModified) {
          updates.items = updatedItems;
          modified = true;
        }
      }

      // Appliquer les mises à jour si nécessaire
      if (modified) {
        await contractsCollection.updateOne(
          { _id: contract._id },
          { $set: updates }
        );
        contractsUpdated++;
      }
    }
    console.log(`📊 Total contrats mis à jour: ${contractsUpdated}`);

    // 3. Mise à jour de la collection StockMovement
    console.log('\n📋 Mise à jour de la collection StockMovement...');
    const movementsCollection = db.collection('stockmovements');

    // Pour les mouvements, on doit vérifier les commentaires ou références éventuelles
    // Mais généralement, les mouvements sont liés par stockItemId, donc la mise à jour
    // du StockItem suffit. On vérifie quand même les commentaires.
    const movements = await movementsCollection.find({}).toArray();
    let movementsUpdated = 0;

    for (const movement of movements) {
      let modified = false;
      const updates: any = {};

      if (movement.commentaire) {
        let newComment = movement.commentaire;
        for (const [oldName, newName] of Object.entries(RENAME_MAP)) {
          if (newComment.includes(oldName)) {
            newComment = newComment.replace(new RegExp(oldName, 'g'), newName);
            modified = true;
          }
        }
        if (modified) {
          updates.commentaire = newComment;
        }
      }

      if (modified) {
        await movementsCollection.updateOne(
          { _id: movement._id },
          { $set: updates }
        );
        movementsUpdated++;
      }
    }
    console.log(`📊 Total mouvements de stock mis à jour: ${movementsUpdated}`);

    // 4. Mise à jour de la collection StockAlert
    console.log('\n⚠️  Mise à jour de la collection StockAlert...');
    const alertsCollection = db.collection('stockalerts');

    let alertsUpdated = 0;
    for (const [oldName, newName] of Object.entries(RENAME_MAP)) {
      const result = await alertsCollection.updateMany(
        { reference: oldName },
        { $set: { reference: newName } }
      );
      alertsUpdated += result.modifiedCount;
      if (result.modifiedCount > 0) {
        console.log(`  ✓ "${oldName}" -> "${newName}": ${result.modifiedCount} alertes mises à jour`);
      }
    }
    console.log(`📊 Total alertes mises à jour: ${alertsUpdated}`);

    console.log('\n✅ Migration terminée avec succès !');
    console.log('\n📊 Résumé:');
    console.log(`  - Articles de stock: ${stockUpdated}`);
    console.log(`  - Contrats: ${contractsUpdated}`);
    console.log(`  - Mouvements: ${movementsUpdated}`);
    console.log(`  - Alertes: ${alertsUpdated}`);

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnecté de MongoDB');
  }
}

// Exécuter la migration
migrateDatabase();
