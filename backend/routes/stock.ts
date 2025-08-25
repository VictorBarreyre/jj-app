import express from 'express';
import { stockController } from '../controllers/stockController';

const router = express.Router();

// Routes pour la gestion du stock
router.get('/catalog', stockController.getCatalog);
router.get('/sizes', stockController.getAvailableSizes);
router.get('/references/:category', stockController.getReferencesByCategory);
router.get('/sizes-for-reference/:referenceId', stockController.getSizesForReference);
router.get('/items', stockController.getAllStockItems);
router.get('/availability/:date', stockController.getAvailabilityAtDate);
router.get('/movements', stockController.getAllMovements);
router.get('/alerts', stockController.getActiveAlerts);
router.post('/items', stockController.createStockItem);
router.post('/movements', stockController.addStockMovement);
router.put('/items/:id', stockController.updateStockItem);
router.delete('/items/:id', stockController.deleteStockItem);
router.post('/seed', stockController.seedDatabase);

export { router as stockRouter };