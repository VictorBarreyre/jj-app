import { Router } from 'express';
import {
  getAllLists,
  getListById,
  createList,
  updateList,
  deleteList,
  addContractToList,
  removeContractFromList,
  getListsForContract
} from '../controllers/listsController';

const router = Router();

// Routes CRUD pour les listes
router.get('/', getAllLists);
router.get('/:id', getListById);
router.post('/', createList);
router.put('/:id', updateList);
router.delete('/:id', deleteList);

// Routes pour gérer les contrats dans les listes
router.post('/:listId/contracts/:contractId', addContractToList);
router.delete('/:listId/contracts/:contractId', removeContractFromList);

// Route pour récupérer les listes d'un contrat spécifique
router.get('/contract/:contractId', getListsForContract);

export default router;
