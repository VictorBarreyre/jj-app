import { connectDB } from '../config/database';
import { StockItem } from '../models/Stock';
import { PRODUCT_CATALOG } from '../config/productCatalog';

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('🌱 Début du seeding de la base de données...');

    // Nettoyer les données existantes
    await StockItem.deleteMany({});
    console.log('🧹 Données existantes supprimées');

    // Créer des articles de stock basés sur le catalogue
    const stockItems = [];

    for (const product of PRODUCT_CATALOG) {
      // Pour chaque référence, créer des articles pour quelques tailles avec du stock
      const sampleSizes = product.availableSizes.slice(0, 5); // Prendre les 5 premières tailles
      
      for (const size of sampleSizes) {
        for (const color of product.colors || ['Standard']) {
          const stockItem = {
            category: product.category,
            subCategory: product.subCategory,
            reference: product.name,
            taille: size,
            couleur: color,
            quantiteStock: Math.floor(Math.random() * 15) + 5, // Entre 5 et 20
            quantiteReservee: Math.floor(Math.random() * 3), // Entre 0 et 3
            quantiteDisponible: 0, // Sera calculé automatiquement
            seuilAlerte: 3,
            prix: product.basePrice
          };
          
          stockItems.push(stockItem);
        }
      }
    }

    // Insérer les articles en base
    const insertedItems = await StockItem.insertMany(stockItems);
    console.log(`✅ ${insertedItems.length} articles de stock créés`);

    // Afficher un résumé par catégorie
    const summary = await StockItem.aggregate([
      {
        $group: {
          _id: { category: '$category', subCategory: '$subCategory' },
          count: { $sum: 1 },
          totalStock: { $sum: '$quantiteStock' }
        }
      }
    ]);

    console.log('\n📊 Résumé du stock créé :');
    summary.forEach(item => {
      console.log(`${item._id.category}${item._id.subCategory ? ` ${item._id.subCategory}` : ''}: ${item.count} articles, ${item.totalStock} pièces total`);
    });

    console.log('\n🎉 Seeding terminé avec succès !');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors du seeding:', error);
    process.exit(1);
  }
};

// Lancer le script si appelé directement
if (require.main === module) {
  seedDatabase();
}

export default seedDatabase;