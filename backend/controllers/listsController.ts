import { Request, Response } from 'express';
import { ListModel } from '../models/List';

// Récupérer toutes les listes
export const getAllLists = async (_req: Request, res: Response) => {
  try {
    const lists = await ListModel.find().sort({ createdAt: -1 });
    res.json(lists);
  } catch (error) {
    console.error('Erreur lors de la récupération des listes:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Récupérer une liste par ID
export const getListById = async (req: Request, res: Response) => {
  try {
    const list = await ListModel.findById(req.params.id);
    if (!list) {
      return res.status(404).json({ message: 'Liste non trouvée' });
    }
    res.json(list);
  } catch (error) {
    console.error('Erreur lors de la récupération de la liste:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Créer une nouvelle liste
export const createList = async (req: Request, res: Response) => {
  try {
    const { name, description, color } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Le nom de la liste est requis' });
    }

    const newList = new ListModel({
      name: name.trim(),
      description: description?.trim(),
      color: color || '#f59e0b',
      contractIds: []
    });

    const savedList = await newList.save();
    res.status(201).json(savedList);
  } catch (error) {
    console.error('Erreur lors de la création de la liste:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Mettre à jour une liste
export const updateList = async (req: Request, res: Response) => {
  try {
    const { name, description, color } = req.body;

    const list = await ListModel.findById(req.params.id);
    if (!list) {
      return res.status(404).json({ message: 'Liste non trouvée' });
    }

    if (name) list.name = name.trim();
    if (description !== undefined) list.description = description?.trim();
    if (color) list.color = color;

    const updatedList = await list.save();
    res.json(updatedList);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la liste:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Supprimer une liste
export const deleteList = async (req: Request, res: Response) => {
  try {
    const list = await ListModel.findByIdAndDelete(req.params.id);
    if (!list) {
      return res.status(404).json({ message: 'Liste non trouvée' });
    }
    res.json({ message: 'Liste supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la liste:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Ajouter un contrat à une liste
export const addContractToList = async (req: Request, res: Response) => {
  try {
    const { listId, contractId } = req.params;

    const list = await ListModel.findById(listId);
    if (!list) {
      return res.status(404).json({ message: 'Liste non trouvée' });
    }

    // Vérifier si le contrat n'est pas déjà dans la liste
    if (!list.contractIds.includes(contractId)) {
      list.contractIds.push(contractId);
      await list.save();
    }

    res.json(list);
  } catch (error) {
    console.error('Erreur lors de l\'ajout du contrat à la liste:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Retirer un contrat d'une liste
export const removeContractFromList = async (req: Request, res: Response) => {
  try {
    const { listId, contractId } = req.params;

    const list = await ListModel.findById(listId);
    if (!list) {
      return res.status(404).json({ message: 'Liste non trouvée' });
    }

    list.contractIds = list.contractIds.filter(id => id !== contractId);
    await list.save();

    res.json(list);
  } catch (error) {
    console.error('Erreur lors du retrait du contrat de la liste:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Récupérer les listes contenant un contrat spécifique
export const getListsForContract = async (req: Request, res: Response) => {
  try {
    const { contractId } = req.params;
    const lists = await ListModel.find({ contractIds: contractId });
    res.json(lists);
  } catch (error) {
    console.error('Erreur lors de la récupération des listes pour le contrat:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
