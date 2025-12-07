import { Request, Response } from 'express';
import { ListModel, ListNumberingModel } from '../models/List';

// Fonction pour générer le numéro de liste
async function generateListNumero(): Promise<string> {
  const currentYear = new Date().getFullYear();

  // Chercher ou créer le document de numérotation pour l'année en cours
  let numbering = await ListNumberingModel.findOne({ year: currentYear });

  if (!numbering) {
    // Créer un nouveau document pour cette année
    numbering = new ListNumberingModel({
      year: currentYear,
      lastNumber: 0,
      prefix: 'L'
    });
  }

  // Incrémenter le compteur
  numbering.lastNumber += 1;
  await numbering.save();

  // Formater le numéro (ex: L-2025-001)
  const paddedNumber = String(numbering.lastNumber).padStart(3, '0');
  return `${numbering.prefix}-${currentYear}-${paddedNumber}`;
}

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

    // Générer le numéro de liste
    const numero = await generateListNumero();

    const newList = new ListModel({
      numero,
      name: name.trim(),
      description: description?.trim(),
      color: color || '#f59e0b',
      contractIds: [],
      participants: []
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
    const { name, description, color, participants } = req.body;

    const list = await ListModel.findById(req.params.id);
    if (!list) {
      return res.status(404).json({ message: 'Liste non trouvée' });
    }

    if (name) list.name = name.trim();
    if (description !== undefined) list.description = description?.trim();
    if (color) list.color = color;

    // Mise à jour des participants (avec rôles)
    if (participants !== undefined) {
      list.participants = participants;
      // Synchroniser contractIds avec participants
      list.contractIds = participants.map((p: { contractId: string }) => p.contractId);
    }

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
    const { role } = req.body || {};

    const list = await ListModel.findById(listId);
    if (!list) {
      return res.status(404).json({ message: 'Liste non trouvée' });
    }

    // Vérifier si le contrat n'est pas déjà dans la liste
    if (!list.contractIds.includes(contractId)) {
      list.contractIds.push(contractId);

      // Ajouter aux participants avec ordre et rôle optionnel
      const nextOrder = (list.participants?.length || 0) + 1;
      if (!list.participants) {
        list.participants = [];
      }
      list.participants.push({
        contractId,
        role: role || '',
        order: nextOrder
      });

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

    // Retirer des participants et réorganiser les ordres
    if (list.participants) {
      list.participants = list.participants
        .filter(p => p.contractId !== contractId)
        .map((p, index) => ({ ...p, order: index + 1 }));
    }

    await list.save();

    res.json(list);
  } catch (error) {
    console.error('Erreur lors du retrait du contrat de la liste:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Mettre à jour le rôle d'un participant
export const updateParticipantRole = async (req: Request, res: Response) => {
  try {
    const { listId, contractId } = req.params;
    const { role } = req.body;

    const list = await ListModel.findById(listId);
    if (!list) {
      return res.status(404).json({ message: 'Liste non trouvée' });
    }

    if (!list.participants) {
      return res.status(404).json({ message: 'Participant non trouvé' });
    }

    const participantIndex = list.participants.findIndex(p => p.contractId === contractId);
    if (participantIndex === -1) {
      return res.status(404).json({ message: 'Participant non trouvé dans cette liste' });
    }

    list.participants[participantIndex].role = role || '';
    await list.save();

    res.json(list);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du rôle:', error);
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
