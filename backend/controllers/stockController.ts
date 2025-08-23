import { Request, Response, NextFunction } from 'express';
import { 
  StockItem, 
  StockMovement, 
  StockAvailability, 
  StockAlert,
  CreateStockItemData, 
  UpdateStockItemData, 
  CreateStockMovementData,
  MovementType 
} from '../models/Stock';
import { createError } from '../middleware/errorHandler';
import { v4 as uuidv4 } from 'uuid';

// Simulation d'une base de données en mémoire
let stockItems: StockItem[] = [
  {
    id: '1',
    category: 'veste',
    reference: 'Jaquette Traditionnelle',
    taille: 'M',
    couleur: 'Noir',
    quantiteStock: 15,
    quantiteReservee: 3,
    quantiteDisponible: 12,
    seuilAlerte: 5,
    prix: 120,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    category: 'veste',
    reference: 'Costume Ville 2P',
    taille: 'L',
    couleur: 'Bleu marine',
    quantiteStock: 8,
    quantiteReservee: 2,
    quantiteDisponible: 6,
    seuilAlerte: 3,
    prix: 100,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

let stockMovements: StockMovement[] = [];
let stockAlerts: StockAlert[] = [];

// Fonction utilitaire pour calculer les disponibilités
const calculateAvailabilityAtDate = (stockItemId: string, targetDate: string): StockAvailability => {
  const stockItem = stockItems.find(item => item.id === stockItemId);
  if (!stockItem) {
    throw createError('Article non trouvé', 404);
  }

  // Récupérer toutes les réservations actives à cette date
  const reservationsAtDate = stockMovements.filter(movement => 
    movement.stockItemId === stockItemId &&
    movement.type === 'reservation' &&
    movement.datePrevue &&
    movement.dateRetour &&
    movement.datePrevue <= targetDate &&
    movement.dateRetour >= targetDate
  );

  const quantiteReserveeADate = reservationsAtDate.reduce((sum, res) => sum + res.quantite, 0);
  const quantiteDisponibleADate = stockItem.quantiteStock - quantiteReserveeADate;

  return {
    stockItemId: stockItem.id,
    reference: stockItem.reference,
    taille: stockItem.taille,
    couleur: stockItem.couleur,
    quantiteStock: stockItem.quantiteStock,
    quantiteReserveeADate,
    quantiteDisponibleADate,
    reservationsActives: reservationsAtDate.map(res => ({
      contractId: res.contractId || '',
      dateDebut: res.datePrevue || '',
      dateFin: res.dateRetour || '',
      quantite: res.quantite
    }))
  };
};

// Fonction pour vérifier les alertes de stock
const checkStockAlerts = (): void => {
  const now = new Date().toISOString();
  
  stockItems.forEach(item => {
    const shouldAlert = item.quantiteDisponible <= item.seuilAlerte;
    const existingAlert = stockAlerts.find(alert => 
      alert.stockItemId === item.id && alert.estActive
    );

    if (shouldAlert && !existingAlert) {
      // Créer une nouvelle alerte
      const newAlert: StockAlert = {
        id: uuidv4(),
        stockItemId: item.id,
        reference: item.reference,
        taille: item.taille,
        quantiteActuelle: item.quantiteDisponible,
        seuilAlerte: item.seuilAlerte,
        dateDetection: now,
        estActive: true,
        message: `Stock faible pour ${item.reference} (${item.taille}): ${item.quantiteDisponible} restant(s)`
      };
      stockAlerts.push(newAlert);
    } else if (!shouldAlert && existingAlert) {
      // Désactiver l'alerte
      existingAlert.estActive = false;
    }
  });
};

export const stockController = {
  // GET /api/stock/items
  getAllStockItems: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { category, reference, taille, search } = req.query;
      
      let filteredItems = [...stockItems];
      
      if (category && category !== 'all') {
        filteredItems = filteredItems.filter(item => item.category === category);
      }
      
      if (reference) {
        filteredItems = filteredItems.filter(item => 
          item.reference.toLowerCase().includes(reference.toString().toLowerCase())
        );
      }
      
      if (taille) {
        filteredItems = filteredItems.filter(item => item.taille === taille);
      }
      
      if (search) {
        const searchTerm = search.toString().toLowerCase();
        filteredItems = filteredItems.filter(item => 
          item.reference.toLowerCase().includes(searchTerm) ||
          item.taille.toLowerCase().includes(searchTerm) ||
          item.couleur?.toLowerCase().includes(searchTerm)
        );
      }
      
      checkStockAlerts();
      
      res.json({
        items: filteredItems,
        total: filteredItems.length
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
      
      let itemsToCheck = [...stockItems];
      
      // Appliquer les filtres
      if (category && category !== 'all') {
        itemsToCheck = itemsToCheck.filter(item => item.category === category);
      }
      if (reference) {
        itemsToCheck = itemsToCheck.filter(item => 
          item.reference.toLowerCase().includes(reference.toString().toLowerCase())
        );
      }
      if (taille) {
        itemsToCheck = itemsToCheck.filter(item => item.taille === taille);
      }
      
      const availabilities = itemsToCheck.map(item => 
        calculateAvailabilityAtDate(item.id, date)
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
      
      let filteredMovements = [...stockMovements];
      
      if (stockItemId) {
        filteredMovements = filteredMovements.filter(mov => mov.stockItemId === stockItemId);
      }
      
      if (type) {
        filteredMovements = filteredMovements.filter(mov => mov.type === type);
      }
      
      if (dateStart) {
        filteredMovements = filteredMovements.filter(mov => 
          mov.dateMovement >= dateStart.toString()
        );
      }
      
      if (dateEnd) {
        filteredMovements = filteredMovements.filter(mov => 
          mov.dateMovement <= dateEnd.toString()
        );
      }
      
      // Trier par date décroissante et limiter
      filteredMovements.sort((a, b) => new Date(b.dateMovement).getTime() - new Date(a.dateMovement).getTime());
      filteredMovements = filteredMovements.slice(0, parseInt(limit.toString()));
      
      res.json({
        movements: filteredMovements,
        total: filteredMovements.length
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/stock/alerts
  getActiveAlerts: async (req: Request, res: Response, next: NextFunction) => {
    try {
      checkStockAlerts();
      
      const activeAlerts = stockAlerts.filter(alert => alert.estActive);
      
      res.json({
        alerts: activeAlerts,
        total: activeAlerts.length
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
      
      const newItem: StockItem = {
        ...itemData,
        id: uuidv4(),
        quantiteReservee: 0,
        quantiteDisponible: itemData.quantiteStock,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      stockItems.push(newItem);
      
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
      if (!movementData.stockItemId || !movementData.type || !movementData.quantite) {
        throw createError('Item ID, type et quantité sont requis', 400);
      }
      
      const stockItem = stockItems.find(item => item.id === movementData.stockItemId);
      if (!stockItem) {
        throw createError('Article non trouvé', 404);
      }
      
      const newMovement: StockMovement = {
        ...movementData,
        id: uuidv4(),
        createdAt: new Date().toISOString()
      };
      
      stockMovements.push(newMovement);
      
      // Mettre à jour les quantités de l'article
      const itemIndex = stockItems.findIndex(item => item.id === movementData.stockItemId);
      if (itemIndex !== -1) {
        const item = stockItems[itemIndex];
        
        switch (movementData.type) {
          case 'entree':
            item.quantiteStock += movementData.quantite;
            break;
          case 'sortie':
          case 'destruction':
          case 'perte':
            item.quantiteStock -= movementData.quantite;
            break;
          case 'reservation':
            item.quantiteReservee += movementData.quantite;
            break;
          case 'retour':
          case 'annulation':
            item.quantiteReservee -= movementData.quantite;
            break;
        }
        
        item.quantiteDisponible = item.quantiteStock - item.quantiteReservee;
        item.updatedAt = new Date().toISOString();
        
        stockItems[itemIndex] = item;
      }
      
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
      
      const itemIndex = stockItems.findIndex(item => item.id === id);
      if (itemIndex === -1) {
        throw createError('Article non trouvé', 404);
      }
      
      stockItems[itemIndex] = {
        ...stockItems[itemIndex],
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      
      // Recalculer la disponibilité
      stockItems[itemIndex].quantiteDisponible = 
        stockItems[itemIndex].quantiteStock - stockItems[itemIndex].quantiteReservee;
      
      res.json(stockItems[itemIndex]);
    } catch (error) {
      next(error);
    }
  }
};