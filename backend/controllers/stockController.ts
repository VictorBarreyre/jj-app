import { Request, Response, NextFunction } from 'express';
import { 
  StockItem,
  StockMovement, 
  StockAlert,
  IStockItem,
  IStockMovement,
  IStockAlert,
  StockAvailability,
  CreateStockItemData, 
  UpdateStockItemData, 
  CreateStockMovementData,
  MovementType 
} from '../models/Stock';
import { createError } from '../middleware/errorHandler';

// Controllers utilisant MongoDB avec Mongoose

// Fonction utilitaire pour calculer les disponibilités
const calculateAvailabilityAtDate = async (stockItemId: string, targetDate: Date): Promise<StockAvailability> => {
  const stockItem = await StockItem.findById(stockItemId);
  if (!stockItem) {
    throw createError('Article non trouvé', 404);
  }

  // Récupérer toutes les réservations actives à cette date
  const reservationsAtDate = await StockMovement.find({
    stockItemId,
    type: 'reservation',
    datePrevue: { $lte: targetDate },
    dateRetour: { $gte: targetDate }
  });

  const quantiteReserveeADate = reservationsAtDate.reduce((sum, res) => sum + res.quantite, 0);
  const quantiteDisponibleADate = stockItem.quantiteStock - quantiteReserveeADate;

  return {
    stockItemId: (stockItem._id as any).toString(),
    reference: stockItem.reference,
    taille: stockItem.taille,
    couleur: stockItem.couleur,
    quantiteStock: stockItem.quantiteStock,
    quantiteReserveeADate,
    quantiteDisponibleADate,
    reservationsActives: reservationsAtDate.map(res => ({
      contractId: res.contractId || '',
      dateDebut: res.datePrevue!,
      dateFin: res.dateRetour!,
      quantite: res.quantite
    }))
  };
};

// Fonction pour vérifier les alertes de stock
const checkStockAlerts = async (): Promise<void> => {
  const stockItems = await StockItem.find();
  
  for (const item of stockItems) {
    const shouldAlert = item.quantiteDisponible <= item.seuilAlerte;
    const existingAlert = await StockAlert.findOne({ 
      stockItemId: item._id as any, 
      estActive: true 
    });

    if (shouldAlert && !existingAlert) {
      // Créer une nouvelle alerte
      await StockAlert.create({
        stockItemId: item._id as any,
        reference: item.reference,
        taille: item.taille,
        quantiteActuelle: item.quantiteDisponible,
        seuilAlerte: item.seuilAlerte,
        estActive: true,
        message: `Stock faible pour ${item.reference} ${item.taille}: ${item.quantiteDisponible} restant(s)`
      });
    } else if (!shouldAlert && existingAlert) {
      // Désactiver l'alerte
      existingAlert.estActive = false;
      await existingAlert.save();
    }
  }
};

// Endpoint pour initialiser des données d'exemple
const seedDatabase = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Vérifier si des données existent déjà
    const existingItems = await StockItem.countDocuments();
    if (existingItems > 0) {
      return res.json({ message: 'Base de données déjà initialisée', count: existingItems });
    }

    // Créer des articles d'exemple
    const sampleItems = [
      {
        category: 'veste',
        subCategory: 'jaquette',
        reference: 'jaquette-fff',
        taille: '48',
        couleur: 'Noir',
        quantiteStock: 5,
        quantiteReservee: 1,
        quantiteDisponible: 4,
        seuilAlerte: 2,
        prix: 150
      },
      {
        category: 'veste',
        subCategory: 'costume-ville',
        reference: 'costume-bleu',
        taille: '44N',
        couleur: 'Bleu marine',
        quantiteStock: 3,
        quantiteReservee: 0,
        quantiteDisponible: 3,
        seuilAlerte: 2,
        prix: 120
      },
      {
        category: 'gilet',
        reference: 'gilet-clair',
        taille: '42N',
        couleur: 'Clair',
        quantiteStock: 2,
        quantiteReservee: 0,
        quantiteDisponible: 2,
        seuilAlerte: 3,
        prix: 80
      },
      {
        category: 'pantalon',
        reference: 'pantalon-sp',
        taille: '42 82',
        couleur: 'SP',
        quantiteStock: 4,
        quantiteReservee: 1,
        quantiteDisponible: 3,
        seuilAlerte: 2,
        prix: 60
      },
      {
        category: 'accessoire',
        reference: 'ceinture-scratch',
        taille: '42',
        couleur: 'Noir',
        quantiteStock: 10,
        quantiteReservee: 2,
        quantiteDisponible: 8,
        seuilAlerte: 3,
        prix: 25
      }
    ];

    const createdItems = await StockItem.insertMany(sampleItems);
    
    res.json({
      message: 'Base de données initialisée avec succès',
      count: createdItems.length,
      items: createdItems
    });
  } catch (error) {
    next(error);
  }
};

export const stockController = {
  // POST /api/stock/seed - Initialiser des données d'exemple
  seedDatabase,
  // GET /api/stock/catalog
  getCatalog: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { PRODUCT_CATALOG, getProductByCategory, getAllSizesForCategory, getAllReferencesForCategory } = await import('../config/productCatalog');
      const { category } = req.query;
      
      if (category) {
        const products = getProductByCategory(category.toString());
        const sizes = getAllSizesForCategory(category.toString());
        const references = getAllReferencesForCategory(category.toString());
        
        res.json({
          category,
          products,
          availableSizes: sizes,
          availableReferences: references
        });
      } else {
        res.json({
          catalog: PRODUCT_CATALOG,
          categories: ['veste', 'gilet', 'pantalon', 'accessoire']
        });
      }
    } catch (error) {
      next(error);
    }
  },

  // GET /api/stock/sizes
  getAvailableSizes: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { category, subCategory } = req.query;
      const { COSTUME_VILLE_SIZES, JAQUETTE_SIZES, SMOKING_SIZES, HABIT_QUEUE_DE_PIE_SIZES, GILET_SIZES_CLASSIQUE, GILET_SIZES_STANDARD, GILET_SIZES_ECRU, CEINTURE_SIZES, PANTALON_SIZES } = await import('../config/productCatalog');
      
      let sizes: string[] = [];
      
      if (category === 'veste') {
        if (subCategory === 'costume-ville') {
          sizes = COSTUME_VILLE_SIZES;
        } else if (subCategory === 'jaquette') {
          sizes = JAQUETTE_SIZES;
        } else if (subCategory === 'smoking') {
          sizes = SMOKING_SIZES;
        } else if (subCategory === 'habit-queue-de-pie') {
          sizes = HABIT_QUEUE_DE_PIE_SIZES;
        } else {
          // Retourner toutes les tailles de vestes
          sizes = [...new Set([...COSTUME_VILLE_SIZES, ...JAQUETTE_SIZES, ...SMOKING_SIZES, ...HABIT_QUEUE_DE_PIE_SIZES])].sort();
        }
      } else if (category === 'gilet') {
        if (subCategory && typeof subCategory === 'string' && subCategory.startsWith('classique')) {
          sizes = GILET_SIZES_CLASSIQUE;
        } else if (subCategory && typeof subCategory === 'string' && subCategory.startsWith('ficelle')) {
          sizes = GILET_SIZES_STANDARD;
        } else if (subCategory && typeof subCategory === 'string' && subCategory.startsWith('ecru')) {
          sizes = GILET_SIZES_ECRU;
        } else {
          // Retourner toutes les tailles de gilets
          sizes = [...new Set([...GILET_SIZES_CLASSIQUE, ...GILET_SIZES_STANDARD, ...GILET_SIZES_ECRU])].sort();
        }
      } else if (category === 'accessoire') {
        if (subCategory && typeof subCategory === 'string' && subCategory === 'ceinture') {
          sizes = CEINTURE_SIZES;
        } else {
          // Retourner toutes les tailles d'accessoires
          sizes = [...new Set([...CEINTURE_SIZES])].sort();
        }
      } else if (category === 'pantalon') {
        sizes = PANTALON_SIZES;
      } else {
        // Pour les autres catégories, récupérer les tailles depuis la DB
        const items = await StockItem.find(category ? { category } : {}).distinct('taille');
        sizes = items.sort();
      }
      
      res.json({
        category,
        subCategory,
        sizes
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/stock/references/:category
  getReferencesByCategory: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { category } = req.params;
      const { getProductByCategory } = await import('../config/productCatalog');
      
      const products = getProductByCategory(category);
      
      const references = products.map(product => ({
        id: product.id,
        name: product.name,
        subCategory: product.subCategory,
        colors: product.colors,
        basePrice: product.basePrice,
        availableSizes: product.availableSizes
      }));
      
      res.json({
        category,
        references
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/stock/sizes-for-reference/:referenceId
  getSizesForReference: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { referenceId } = req.params;
      const { getProductById } = await import('../config/productCatalog');
      
      const product = getProductById(referenceId);
      
      if (!product) {
        throw createError('Référence non trouvée', 404);
      }
      
      res.json({
        referenceId,
        name: product.name,
        category: product.category,
        subCategory: product.subCategory,
        colors: product.colors,
        sizes: product.availableSizes,
        basePrice: product.basePrice
      });
    } catch (error) {
      next(error);
    }
  },
  // GET /api/stock/items
  getAllStockItems: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { category, reference, taille, search } = req.query;
      
      let filter: any = {};
      
      if (category && category !== 'all') {
        filter.category = category;
      }
      
      if (reference) {
        filter.reference = { $regex: reference.toString(), $options: 'i' };
      }
      
      if (taille) {
        filter.taille = taille;
      }
      
      if (search) {
        const searchTerm = search.toString();
        filter.$or = [
          { reference: { $regex: searchTerm, $options: 'i' } },
          { taille: { $regex: searchTerm, $options: 'i' } },
          { couleur: { $regex: searchTerm, $options: 'i' } }
        ];
      }
      
      const stockItems = await StockItem.find(filter);
      
      await checkStockAlerts();
      
      // Mapper _id vers id pour React
      const itemsWithId = stockItems.map(item => ({
        id: (item._id as any).toString(),
        category: item.category,
        subCategory: item.subCategory,
        reference: item.reference,
        taille: item.taille,
        couleur: item.couleur,
        quantiteStock: item.quantiteStock,
        quantiteReservee: item.quantiteReservee,
        quantiteDisponible: item.quantiteDisponible,
        seuilAlerte: item.seuilAlerte,
        prix: item.prix,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      }));
      
      res.json({
        items: itemsWithId,
        total: itemsWithId.length
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/stock/availability/:date
  getAvailabilityAtDate: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { date } = req.params;
      const { category, reference, taille } = req.query;
      
      let filter: any = {};
      
      if (category && category !== 'all') {
        filter.category = category;
      }
      if (reference) {
        filter.reference = { $regex: reference.toString(), $options: 'i' };
      }
      if (taille) {
        filter.taille = taille;
      }
      
      const itemsToCheck = await StockItem.find(filter);
      const targetDate = new Date(date);
      
      const availabilities = await Promise.all(
        itemsToCheck.map(item => 
          calculateAvailabilityAtDate((item._id as any).toString(), targetDate)
        )
      );
      
      res.json({
        date,
        availabilities,
        total: availabilities.length
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/stock/movements
  getAllMovements: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { stockItemId, type, dateStart, dateEnd, limit = 100 } = req.query;
      
      let filter: any = {};
      
      if (stockItemId) {
        filter.stockItemId = stockItemId;
      }
      
      if (type) {
        filter.type = type;
      }
      
      if (dateStart || dateEnd) {
        filter.dateMovement = {};
        if (dateStart) filter.dateMovement.$gte = new Date(dateStart.toString());
        if (dateEnd) filter.dateMovement.$lte = new Date(dateEnd.toString());
      }
      
      const movements = await StockMovement.find(filter)
        .populate('stockItemId', 'reference taille couleur')
        .sort({ dateMovement: -1 })
        .limit(parseInt(limit.toString()));
      
      res.json({
        movements,
        total: movements.length
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/stock/alerts
  getActiveAlerts: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await checkStockAlerts();
      
      const activeAlerts = await StockAlert.find({ estActive: true })
        .populate('stockItemId', 'reference taille couleur')
        .sort({ dateDetection: -1 });
      
      // Mapper _id vers id pour React
      const alertsWithId = activeAlerts.map(alert => ({
        id: (alert._id as any).toString(),
        stockItemId: alert.stockItemId,
        reference: alert.reference,
        taille: alert.taille,
        quantiteActuelle: alert.quantiteActuelle,
        seuilAlerte: alert.seuilAlerte,
        dateDetection: alert.dateDetection,
        estActive: alert.estActive,
        message: alert.message
      }));
      
      res.json({
        alerts: alertsWithId,
        total: alertsWithId.length
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/stock/items
  createStockItem: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const itemData: CreateStockItemData = req.body;
      
      // Validation
      if (!itemData.reference || !itemData.taille || !itemData.category) {
        throw createError('Référence, taille et catégorie sont requis', 400);
      }
      
      const newItem = new StockItem({
        ...itemData,
        quantiteReservee: 0,
        quantiteDisponible: itemData.quantiteStock
      });
      
      await newItem.save();
      
      res.status(201).json(newItem);
    } catch (error) {
      next(error);
    }
  },

  // POST /api/stock/movements
  addStockMovement: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const movementData: CreateStockMovementData = req.body;
      
      // Validation
      if (!movementData.stockItemId || !movementData.type || movementData.quantite === undefined) {
        throw createError('Item ID, type et quantité sont requis', 400);
      }
      
      const stockItem = await StockItem.findById(movementData.stockItemId);
      if (!stockItem) {
        throw createError('Article non trouvé', 404);
      }
      
      const newMovement = new StockMovement(movementData);
      await newMovement.save();
      
      // Mettre à jour les quantités de l'article
      switch (movementData.type) {
        case 'entree':
          stockItem.quantiteStock += movementData.quantite;
          break;
        case 'sortie':
        case 'destruction':
        case 'perte':
          stockItem.quantiteStock -= movementData.quantite;
          break;
        case 'reservation':
          stockItem.quantiteReservee += movementData.quantite;
          break;
        case 'retour':
        case 'annulation':
          stockItem.quantiteReservee -= movementData.quantite;
          break;
      }
      
      stockItem.quantiteDisponible = stockItem.quantiteStock - stockItem.quantiteReservee;
      await stockItem.save();
      
      res.status(201).json(newMovement);
    } catch (error) {
      next(error);
    }
  },

  // PUT /api/stock/items/:id
  updateStockItem: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updateData: UpdateStockItemData = req.body;
      
      const stockItem = await StockItem.findById(id);
      if (!stockItem) {
        throw createError('Article non trouvé', 404);
      }
      
      Object.assign(stockItem, updateData);
      
      // Recalculer la disponibilité
      stockItem.quantiteDisponible = stockItem.quantiteStock - stockItem.quantiteReservee;
      
      await stockItem.save();
      
      res.json(stockItem);
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/stock/items/:id
  deleteStockItem: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      
      const stockItem = await StockItem.findById(id);
      if (!stockItem) {
        throw createError('Article non trouvé', 404);
      }
      
      // Vérifier qu'il n'y a pas de réservations actives
      if (stockItem.quantiteReservee > 0) {
        throw createError(
          `Impossible de supprimer cet article car ${stockItem.quantiteReservee} unité(s) sont actuellement réservées`, 
          400
        );
      }
      
      await StockItem.findByIdAndDelete(id);
      
      // Supprimer aussi les alertes associées
      await StockAlert.deleteMany({ stockItemId: id });
      
      res.json({ 
        message: 'Article supprimé avec succès',
        deletedItem: {
          id: (stockItem._id as any).toString(),
          reference: stockItem.reference,
          taille: stockItem.taille
        }
      });
    } catch (error) {
      next(error);
    }
  }
};