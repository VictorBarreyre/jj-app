/**
 * Script de migration pour ajouter les participants aux listes existantes
 *
 * Ce script convertit les listes qui ont seulement contractIds en
 * ajoutant une structure participants avec order et role.
 *
 * Usage: npx ts-node scripts/migrate-list-participants.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Charger les variables d'environnement
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is required. Set it in your .env file.');
}

// Schéma simplifié pour la migration
const listSchema = new mongoose.Schema({
  numero: String,
  name: String,
  description: String,
  color: String,
  contractIds: [String],
  participants: [{
    contractId: String,
    role: String,
    order: Number
  }],
  createdAt: Date,
  updatedAt: Date
}, { collection: 'lists' });

const ListModel = mongoose.model('List', listSchema);

async function migrateListParticipants() {
  console.log('Starting migration of list participants...\n');

  try {
    // Connexion à MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Récupérer toutes les listes qui n'ont pas de participants ou ont des participants vides
    const listsToMigrate = await ListModel.find({
      $or: [
        { participants: { $exists: false } },
        { participants: { $size: 0 } },
        { participants: null }
      ],
      contractIds: { $exists: true, $ne: [] }
    });

    console.log(`Found ${listsToMigrate.length} list(s) to migrate\n`);

    if (listsToMigrate.length === 0) {
      console.log('All lists already have participants. Nothing to do.');
      return;
    }

    let migratedCount = 0;
    for (const list of listsToMigrate) {
      const contractIds = list.contractIds || [];

      // Créer les participants à partir des contractIds
      const participants = contractIds.map((contractId: string, index: number) => ({
        contractId,
        role: '',
        order: index + 1
      }));

      await ListModel.updateOne(
        { _id: list._id },
        { $set: { participants } }
      );

      console.log(`  Migrated "${list.name}" (${list.numero}) - ${participants.length} participant(s)`);
      migratedCount++;
    }

    console.log(`\nMigration completed successfully!`);
    console.log(`   - ${migratedCount} list(s) migrated`);

  } catch (error) {
    console.error('\nError during migration:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Exécuter la migration
migrateListParticipants();
