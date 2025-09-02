import { Request, Response, NextFunction } from 'express';
import { Order, CreateOrderData, UpdateOrderData } from '../models/Order';
import { createError } from '../middleware/errorHandler';
import { v4 as uuidv4 } from 'uuid';

// Simulation d'une base de données en mémoire avec des données de test
let orders: Order[] = [
  {
    id: "1",
    numero: "JJ-2024-001",
    client: {
      nom: "Martin",
      prenom: "Jean",
      telephone: "01 23 45 67 89",
      email: "jean.martin@email.com"
    },
    dateCreation: new Date("2024-01-15"),
    dateLivraison: new Date("2024-02-05"),
    status: "commandee",
    type: "individuel",
    items: [
      {
        id: "1",
        category: "veste",
        reference: "costume-3-pieces",
        measurements: {},
        quantity: 1,
        unitPrice: 450,
        totalPrice: 450
      }
    ],
    total: 450,
    notes: "Client préfère les revers étroits",
    createdBy: "Sophie",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z"
  },
  {
    id: "2",
    numero: "JJ-2024-002",
    client: {
      nom: "Dupont",
      prenom: "Marie",
      telephone: "01 98 76 54 32"
    },
    dateCreation: new Date("2024-01-16"),
    status: "commandee",
    type: "individuel",
    items: [
      {
        id: "2",
        category: "veste",
        reference: "robe-soiree",
        measurements: {},
        quantity: 1,
        unitPrice: 350,
        totalPrice: 350
      }
    ],
    total: 350,
    createdBy: "Laurent",
    createdAt: "2024-01-16T14:30:00Z",
    updatedAt: "2024-01-16T14:30:00Z"
  }
] as any[];

export const ordersController = {
  // GET /api/orders
  getAllOrders: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status, search } = req.query;
      
      let filteredOrders = [...orders];
      
      if (status && status !== 'all') {
        filteredOrders = filteredOrders.filter(order => order.status === status);
      }
      
      if (search) {
        const searchTerm = search.toString().toLowerCase();
        filteredOrders = filteredOrders.filter(order => 
          order.numero.toLowerCase().includes(searchTerm) ||
          order.client.nom.toLowerCase().includes(searchTerm) ||
          order.client.prenom.toLowerCase().includes(searchTerm)
        );
      }
      
      res.json({
        orders: filteredOrders,
        total: filteredOrders.length
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/orders/:id
  getOrderById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const order = orders.find(o => o.id === id);
      
      if (!order) {
        throw createError('Commande non trouvée', 404);
      }
      
      res.json(order);
    } catch (error) {
      next(error);
    }
  },

  // POST /api/orders
  createOrder: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const orderData: CreateOrderData = req.body;
      
      // Validation basique
      if (!orderData.client.nom || !orderData.client.prenom) {
        throw createError('Le nom et prénom du client sont requis', 400);
      }
      
      const newOrder: Order = {
        ...orderData,
        id: uuidv4(),
        numero: `JJ-${new Date().getFullYear()}-${String(orders.length + 1).padStart(3, '0')}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      orders.push(newOrder);
      
      res.status(201).json(newOrder);
    } catch (error) {
      next(error);
    }
  },

  // PUT /api/orders/:id
  updateOrder: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updateData: UpdateOrderData = req.body;
      
      const orderIndex = orders.findIndex(o => o.id === id);
      if (orderIndex === -1) {
        throw createError('Commande non trouvée', 404);
      }
      
      orders[orderIndex] = {
        ...orders[orderIndex],
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      
      res.json(orders[orderIndex]);
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/orders/:id
  deleteOrder: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const orderIndex = orders.findIndex(o => o.id === id);
      
      if (orderIndex === -1) {
        throw createError('Commande non trouvée', 404);
      }
      
      orders.splice(orderIndex, 1);
      
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
};