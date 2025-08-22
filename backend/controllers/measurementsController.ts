import { Request, Response, NextFunction } from 'express';
import { MeasurementForm, CreateMeasurementData } from '../models/Measurement';
import { createError } from '../middleware/errorHandler';
import { v4 as uuidv4 } from 'uuid';

// Simulation d'une base de données en mémoire
let measurements: MeasurementForm[] = [];

export const measurementsController = {
  // GET /api/measurements
  getAllMeasurements: async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json({
        measurements,
        total: measurements.length
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/measurements/:id
  getMeasurementById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const measurement = measurements.find(m => m.id === id);
      
      if (!measurement) {
        throw createError('Prise de mesure non trouvée', 404);
      }
      
      res.json(measurement);
    } catch (error) {
      next(error);
    }
  },

  // POST /api/measurements
  createMeasurement: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const measurementData: CreateMeasurementData = req.body;
      
      // Validation basique
      if (!measurementData.client.nom || !measurementData.client.prenom) {
        throw createError('Le nom et prénom du client sont requis', 400);
      }
      
      const newMeasurement: MeasurementForm = {
        ...measurementData,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      measurements.push(newMeasurement);
      
      res.status(201).json(newMeasurement);
    } catch (error) {
      next(error);
    }
  },

  // POST /api/measurements/save-draft
  saveMeasurementDraft: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const measurementData: CreateMeasurementData = req.body;
      
      const draftMeasurement: MeasurementForm = {
        ...measurementData,
        id: uuidv4(),
        status: 'brouillon',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      measurements.push(draftMeasurement);
      
      res.status(201).json({
        message: 'Brouillon sauvegardé avec succès',
        measurement: draftMeasurement
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/measurements/submit
  submitMeasurement: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const measurementData: CreateMeasurementData = req.body;
      
      // Validation plus stricte pour la soumission
      if (!measurementData.client.nom || !measurementData.client.prenom || !measurementData.client.telephone) {
        throw createError('Les informations client complètes sont requises pour la soumission', 400);
      }
      
      if (!measurementData.articles || measurementData.articles.length === 0) {
        throw createError('Au moins un article doit être sélectionné', 400);
      }
      
      const submittedMeasurement: MeasurementForm = {
        ...measurementData,
        id: uuidv4(),
        status: 'en_production',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      measurements.push(submittedMeasurement);
      
      res.status(201).json({
        message: 'Formulaire transmis avec succès au PC caisse',
        measurement: submittedMeasurement
      });
    } catch (error) {
      next(error);
    }
  },

  // PUT /api/measurements/:id
  updateMeasurement: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const measurementIndex = measurements.findIndex(m => m.id === id);
      if (measurementIndex === -1) {
        throw createError('Prise de mesure non trouvée', 404);
      }
      
      measurements[measurementIndex] = {
        ...measurements[measurementIndex],
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      
      res.json(measurements[measurementIndex]);
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/measurements/:id
  deleteMeasurement: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const measurementIndex = measurements.findIndex(m => m.id === id);
      
      if (measurementIndex === -1) {
        throw createError('Prise de mesure non trouvée', 404);
      }
      
      measurements.splice(measurementIndex, 1);
      
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
};