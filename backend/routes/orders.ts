import { Router } from 'express';
import { ordersController } from '../controllers/ordersController';

export const ordersRouter = Router();

// GET /api/orders
ordersRouter.get('/', ordersController.getAllOrders);

// GET /api/orders/:id
ordersRouter.get('/:id', ordersController.getOrderById);

// POST /api/orders
ordersRouter.post('/', ordersController.createOrder);

// PUT /api/orders/:id
ordersRouter.put('/:id', ordersController.updateOrder);

// DELETE /api/orders/:id
ordersRouter.delete('/:id', ordersController.deleteOrder);