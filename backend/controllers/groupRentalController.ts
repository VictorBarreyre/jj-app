import { Request, Response } from 'express';
import { GroupRental } from '../models/GroupRental';

// Créer un nouveau groupe de location
export const createGroupRental = async (req: Request, res: Response) => {
  try {
    const groupRental = new GroupRental(req.body);
    await groupRental.save();
    
    res.status(201).json({
      success: true,
      data: groupRental
    });
  } catch (error: any) {
    console.error('Erreur lors de la création du groupe:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: Object.keys(error.errors).map(key => ({
          field: key,
          message: error.errors[key].message
        }))
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la création du groupe'
    });
  }
};

// Récupérer tous les groupes de location
export const getAllGroupRentals = async (req: Request, res: Response) => {
  try {
    const { status, vendeur, limit = 10, page = 1 } = req.query;
    
    const filter: any = {};
    if (status) filter.status = status;
    if (vendeur) filter.vendeur = vendeur;
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const groupRentals = await GroupRental.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(skip);
    
    const total = await GroupRental.countDocuments(filter);
    
    res.json({
      success: true,
      data: groupRentals,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des groupes:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des groupes'
    });
  }
};

// Récupérer un groupe de location par ID
export const getGroupRentalById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const groupRental = await GroupRental.findById(id);
    
    if (!groupRental) {
      return res.status(404).json({
        success: false,
        message: 'Groupe de location introuvable'
      });
    }
    
    res.json({
      success: true,
      data: groupRental
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du groupe:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération du groupe'
    });
  }
};

// Mettre à jour un groupe de location
export const updateGroupRental = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const groupRental = await GroupRental.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!groupRental) {
      return res.status(404).json({
        success: false,
        message: 'Groupe de location introuvable'
      });
    }
    
    res.json({
      success: true,
      data: groupRental
    });
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour du groupe:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: Object.keys(error.errors).map(key => ({
          field: key,
          message: error.errors[key].message
        }))
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la mise à jour du groupe'
    });
  }
};

// Supprimer un groupe de location
export const deleteGroupRental = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const groupRental = await GroupRental.findByIdAndDelete(id);
    
    if (!groupRental) {
      return res.status(404).json({
        success: false,
        message: 'Groupe de location introuvable'
      });
    }
    
    res.json({
      success: true,
      message: 'Groupe de location supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du groupe:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la suppression du groupe'
    });
  }
};

// Mettre à jour le statut d'un groupe
export const updateGroupRentalStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['brouillon', 'complete', 'transmise'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Statut invalide'
      });
    }
    
    const groupRental = await GroupRental.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    
    if (!groupRental) {
      return res.status(404).json({
        success: false,
        message: 'Groupe de location introuvable'
      });
    }
    
    res.json({
      success: true,
      data: groupRental
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la mise à jour du statut'
    });
  }
};