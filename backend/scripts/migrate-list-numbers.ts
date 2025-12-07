/**
 * Script de migration pour ajouter des numéros aux listes existantes
 *
 * Ce script attribue un numéro unique (ex: L-2025-001) à toutes les listes
 * qui n'en ont pas encore.
 *
 * Usage: npx ts-node scripts/migrate-list-numbers.ts
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
  createdAt: Date,
  updatedAt: Date
}, { collection: 'lists' });

const listNumberingSchema = new mongoose.Schema({
  year: Number,
  lastNumber: Number,
  prefix: String
}, { collection: 'list_numbering' });

const ListModel = mongoose.model('List', listSchema);
const ListNumberingModel = mongoose.model('ListNumbering', listNumberingSchema);

async function generateListNumero(year: number, counter: number): Promise<string> {
  const paddedNumber = String(counter).padStart(3, '0');
  return `L-${year}-${paddedNumber}`;
}

async function migrateListNumbers() {
  console.log('🚀 Démarrage de la migration des numéros de listes...\n');

  try {
    // Connexion à MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    // Récupérer toutes les listes sans numéro
    const listsWithoutNumero = await ListModel.find({
      $or: [
        { numero: { $exists: false } },
        { numero: null },
        { numero: '' }
      ]
    }).sort({ createdAt: 1 }); // Trier par date de création pour conserver l'ordre

    console.log(`📋 ${listsWithoutNumero.length} liste(s) sans numéro trouvée(s)\n`);

    if (listsWithoutNumero.length === 0) {
      console.log('✅ Toutes les listes ont déjà un numéro. Rien à faire.');
      return;
    }

    const currentYear = new Date().getFullYear();

    // Récupérer ou créer le compteur pour l'année en cours
    let numbering = await ListNumberingModel.findOne({ year: currentYear });

    if (!numbering) {
      numbering = new ListNumberingModel({
        year: currentYear,
        lastNumber: 0,
        prefix: 'L'
      });
      await numbering.save();
      console.log(`📝 Compteur créé pour l'année ${currentYear}\n`);
    }

    // Initialiser le compteur si nécessaire
    let currentCounter = numbering.lastNumber ?? 0;
    console.log(`📊 Dernier numéro actuel: ${currentCounter}\n`);

    // Mettre à jour chaque liste
    let migratedCount = 0;
    for (const list of listsWithoutNumero) {
      currentCounter += 1;
      const numero = await generateListNumero(currentYear, currentCounter);
      numbering.lastNumber = currentCounter;

      await ListModel.updateOne(
        { _id: list._id },
        { $set: { numero } }
      );

      console.log(`  ✅ Liste "${list.name}" → ${numero}`);
      migratedCount++;
    }

    // Sauvegarder le nouveau compteur
    await numbering.save();

    console.log(`\n🎉 Migration terminée avec succès!`);
    console.log(`   - ${migratedCount} liste(s) mise(s) à jour`);
    console.log(`   - Nouveau compteur: ${numbering.lastNumber}`);

  } catch (error) {
    console.error('\n❌ Erreur lors de la migration:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnecté de MongoDB');
  }
}

// Exécuter la migration
migrateListNumbers();
