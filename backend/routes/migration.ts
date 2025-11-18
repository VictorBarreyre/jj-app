import express from 'express';
import { StockItem } from '../models/Stock';

const router = express.Router();

// Route pour migrer les noms de produits
router.post('/migrate-product-names', async (req, res) => {
  try {
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

    // Compter les produits après migration
    const flanelleCount = await StockItem.countDocuments({ reference: 'Jaquette flanelle' });
    const rayeCount = await StockItem.countDocuments({ reference: 'Pantalon rayé' });

    const result = {
      success: true,
      message: 'Migration terminée avec succès',
      details: {
        jaquetteJola: {
          updated: jolaResult.modifiedCount,
          total: flanelleCount
        },
        pantalonSP: {
          referenceUpdated: spResult.modifiedCount,
          colorUpdated: spColorResult.modifiedCount,
          total: rayeCount
        }
      }
    };

    console.log('🎉 Migration terminée avec succès !');
    res.json(result);
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la migration',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export const migrationRouter = router;
