import { Router } from 'express';
import { measurementsController } from '../controllers/measurementsController';

export const measurementsRouter = Router();

// GET /api/measurements
measurementsRouter.get('/', measurementsController.getAllMeasurements);

// GET /api/measurements/:id
measurementsRouter.get('/:id', measurementsController.getMeasurementById);

// POST /api/measurements
measurementsRouter.post('/', measurementsController.createMeasurement);

// POST /api/measurements/save-draft
measurementsRouter.post('/save-draft', measurementsController.saveMeasurementDraft);

// POST /api/measurements/submit
measurementsRouter.post('/submit', measurementsController.submitMeasurement);

// PUT /api/measurements/:id
measurementsRouter.put('/:id', measurementsController.updateMeasurement);

// DELETE /api/measurements/:id
measurementsRouter.delete('/:id', measurementsController.deleteMeasurement);