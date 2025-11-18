import { connectDB } from '../config/database';
import { StockItem } from '../models/Stock';

const migrateProductNames = async () => {
  try {
    await connectDB();
    console.log('🔄 Début de la migration des noms de produits...');

    // Migration 1: Jaquette JOLA -> Jaquette flanelle
    const jolaResult = await StockItem.updateMany(
      { reference: 'Jaquette Jola' },
      { $set: { reference: 'Jaquette flanelle' } }
    );
    console.log(`✅ Jaquette Jola -> Jaquette flanelle: ${jolaResult.modifiedCount} articles mis à jour`);

    // Migration 2: Pantalon SP -> Pantalon rayé
    const spResult = await StockItem.updateMany(
      { reference: 'Pantalon SP' },
      { $set: { reference: 'Pantalon rayé' } }
    );
    console.log(`✅ Pantalon SP -> Pantalon rayé: ${spResult.modifiedCount} articles mis à jour`);

    // Également mettre à jour la couleur 'SP' en 'rayé' pour les pantalons
    const spColorResult = await StockItem.updateMany(
      { couleur: 'SP', category: 'pantalon' },
      { $set: { couleur: 'rayé' } }
    );
    console.log(`✅ Couleur SP -> rayé: ${spColorResult.modifiedCount} articles mis à jour`);

    console.log('\n🎉 Migration terminée avec succès !');

    // Afficher un résumé des produits concernés
    const flanelleCount = await StockItem.countDocuments({ reference: 'Jaquette flanelle' });
    const rayeCount = await StockItem.countDocuments({ reference: 'Pantalon rayé' });

    console.log('\n📊 État après migration :');
    console.log(`- Jaquette flanelle: ${flanelleCount} articles`);
    console.log(`- Pantalon rayé: ${rayeCount} articles`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    process.exit(1);
  }
};

// Lancer le script si appelé directement
if (require.main === module) {
  migrateProductNames();
}

export default migrateProductNames;
