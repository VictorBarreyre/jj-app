import { Router } from 'express';
import { rentalContractsController } from '../controllers/rentalContractsController';
import { authenticateToken } from '../middleware/authMiddleware';

export const contractsRouter = Router();

// Appliquer l'authentification à toutes les routes des contrats
contractsRouter.use(authenticateToken);

// GET /api/contracts
contractsRouter.get('/', rentalContractsController.getAllContracts);

// GET /api/contracts/:id
contractsRouter.get('/:id', rentalContractsController.getContractById);

// POST /api/contracts
contractsRouter.post('/', rentalContractsController.createContract);

// PUT /api/contracts/:id
contractsRouter.put('/:id', rentalContractsController.updateContract);

// POST /api/contracts/:id/payment
contractsRouter.post('/:id/payment', rentalContractsController.recordPayment);

// POST /api/contracts/:id/return
contractsRouter.post('/:id/return', rentalContractsController.markAsReturned);

// PUT /api/contracts/:id/participant/:participantIndex/return
contractsRouter.put('/:id/participant/:participantIndex/return', rentalContractsController.updateParticipantReturn);

// GET /api/contracts/:id/print/:type
contractsRouter.get('/:id/print/:type', rentalContractsController.getPrintData);

// GET /api/contracts/:id/pdf/:type
contractsRouter.get('/:id/pdf/:type', rentalContractsController.generatePDF);

// DELETE /api/contracts/:id
contractsRouter.delete('/:id', rentalContractsController.deleteContract);