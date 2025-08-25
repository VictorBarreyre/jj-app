import { Router } from 'express';
import {
  createGroupRental,
  getAllGroupRentals,
  getGroupRentalById,
  updateGroupRental,
  deleteGroupRental,
  updateGroupRentalStatus
} from '../controllers/groupRentalController';

const router = Router();

// Routes CRUD pour les groupes de location
router.post('/', createGroupRental);
router.get('/', getAllGroupRentals);
router.get('/:id', getGroupRentalById);
router.put('/:id', updateGroupRental);
router.delete('/:id', deleteGroupRental);

// Route spécifique pour mettre à jour le statut
router.patch('/:id/status', updateGroupRentalStatus);

export default router;