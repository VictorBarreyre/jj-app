import { Router } from 'express';
import { 
  getAllOrders, 
  getOrderById, 
  createOrder, 
  updateOrder, 
  deleteOrder,
  getOrdersStats 
} from '../controllers/ordersController';

export const ordersRouter = Router();

// GET /api/orders/stats
ordersRouter.get('/stats', getOrdersStats);

// GET /api/orders
ordersRouter.get('/', getAllOrders);

// GET /api/orders/:id
ordersRouter.get('/:id', getOrderById);

// POST /api/orders
ordersRouter.post('/', createOrder);

// PUT /api/orders/:id
ordersRouter.put('/:id', updateOrder);

// DELETE /api/orders/:id
ordersRouter.delete('/:id', deleteOrder);