import { Request, Response, NextFunction } from 'express';
import { OrderModel, IOrderDocument, CreateOrderData, UpdateOrderData } from '../models/OrderMongo';
import { createError } from '../middleware/errorHandler';
import { v4 as uuidv4 } from 'uuid';

// Obtenir toutes les commandes avec filtrage optionnel
export const getAllOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, search, dateStart, dateEnd, type, page = 1, limit = 50 } = req.query;
    
    let query: any = {};

    // Filtrage par statut
    if (status && status !== 'all') {
      query.status = status;
    }

    // Filtrage par type
    if (type && type !== 'all') {
      query.type = type;
    }

    // Recherche textuelle
    if (search) {
      query.$or = [
        { numero: { $regex: search, $options: 'i' } },
        { 'client.nom': { $regex: search, $options: 'i' } },
        { 'client.prenom': { $regex: search, $options: 'i' } },
        { 'client.telephone': { $regex: search, $options: 'i' } }
      ];
    }

    // Filtrage par date
    if (dateStart || dateEnd) {
      query.dateCreation = {};
      if (dateStart) {
        query.dateCreation.$gte = new Date(dateStart as string);
      }
      if (dateEnd) {
        query.dateCreation.$lte = new Date(dateEnd as string);
      }
    }

    const skip = (Number(page) - 1) * Number(limit);

    // Exécuter la requête avec pagination
    const [orders, total] = await Promise.all([
      OrderModel.find(query)
        .sort({ dateCreation: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      OrderModel.countDocuments(query)
    ]);

    res.json({
      orders: orders.map(order => ({
        ...order,
        id: order._id.toString(),
        _id: undefined
      })),
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit))
    });
  } catch (error: any) {
    console.error('Error in getAllOrders:', error);
    next(createError('Erreur lors de la récupération des commandes', 500));
  }
};

// Obtenir une commande par ID
export const getOrderById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const order = await OrderModel.findById(id).lean();

    if (!order) {
      return next(createError('Commande non trouvée', 404));
    }

    res.json({
      ...order,
      id: order._id.toString(),
      _id: undefined
    });
  } catch (error: any) {
    console.error('Error in getOrderById:', error);
    if (error.name === 'CastError') {
      return next(createError('ID de commande invalide', 400));
    }
    next(createError('Erreur lors de la récupération de la commande', 500));
  }
};

// Créer une nouvelle commande
export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orderData: CreateOrderData = req.body;

    // Validation des données requises
    if (!orderData.client?.nom) {
      return next(createError('Le nom du client est requis', 400));
    }

    if (!orderData.items || orderData.items.length === 0) {
      return next(createError('Au moins un article est requis', 400));
    }

    // Générer un numéro de commande unique si non fourni
    if (!orderData.numero) {
      const year = new Date().getFullYear();
      const count = await OrderModel.countDocuments({
        numero: { $regex: `^JJ-${year}` }
      });
      orderData.numero = `JJ-${year}-${String(count + 1).padStart(3, '0')}`;
    }

    // Ajouter des IDs aux items si manquants
    orderData.items = orderData.items.map(item => ({
      ...item,
      id: item.id || uuidv4()
    }));

    // Calculer les totaux si non fournis
    if (orderData.items.some(item => item.unitPrice)) {
      const sousTotal = orderData.items.reduce((sum, item) => 
        sum + (item.unitPrice || 0) * item.quantity, 0
      );
      orderData.sousTotal = sousTotal;
      orderData.tva = orderData.tva || Math.round(sousTotal * 0.2); // 20% TVA
      orderData.total = orderData.sousTotal + orderData.tva;
    }

    const newOrder = new OrderModel(orderData);
    const savedOrder = await newOrder.save();

    res.status(201).json({
      ...savedOrder.toObject(),
      id: savedOrder._id?.toString(),
      _id: undefined
    });
  } catch (error: any) {
    console.error('Error in createOrder:', error);
    if (error.code === 11000) {
      return next(createError('Ce numéro de commande existe déjà', 409));
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return next(createError(`Erreur de validation: ${messages.join(', ')}`, 400));
    }
    next(createError('Erreur lors de la création de la commande', 500));
  }
};

// Mettre à jour une commande
export const updateOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updateData: UpdateOrderData = req.body;

    // Supprimer les champs qui ne doivent pas être mis à jour directement
    delete (updateData as any).createdAt;
    delete (updateData as any)._id;
    delete (updateData as any).id;

    // Si on met à jour les items, recalculer les totaux
    if (updateData.items && updateData.items.some(item => item.unitPrice)) {
      const sousTotal = updateData.items.reduce((sum, item) => 
        sum + (item.unitPrice || 0) * item.quantity, 0
      );
      updateData.sousTotal = sousTotal;
      updateData.tva = updateData.tva || Math.round(sousTotal * 0.2);
      updateData.total = updateData.sousTotal + updateData.tva;
    }

    const updatedOrder = await OrderModel.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedOrder) {
      return next(createError('Commande non trouvée', 404));
    }

    res.json({
      ...updatedOrder,
      id: updatedOrder._id.toString(),
      _id: undefined
    });
  } catch (error: any) {
    console.error('Error in updateOrder:', error);
    if (error.name === 'CastError') {
      return next(createError('ID de commande invalide', 400));
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return next(createError(`Erreur de validation: ${messages.join(', ')}`, 400));
    }
    next(createError('Erreur lors de la mise à jour de la commande', 500));
  }
};

// Supprimer une commande
export const deleteOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const deletedOrder = await OrderModel.findByIdAndDelete(id);

    if (!deletedOrder) {
      return next(createError('Commande non trouvée', 404));
    }

    res.status(204).send();
  } catch (error: any) {
    console.error('Error in deleteOrder:', error);
    if (error.name === 'CastError') {
      return next(createError('ID de commande invalide', 400));
    }
    next(createError('Erreur lors de la suppression de la commande', 500));
  }
};

// Obtenir les statistiques des commandes
export const getOrdersStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [stats] = await OrderModel.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          commandees: {
            $sum: { $cond: [{ $eq: ['$status', 'commandee'] }, 1, 0] }
          },
          livrees: {
            $sum: { $cond: [{ $eq: ['$status', 'livree'] }, 1, 0] }
          },
          rendues: {
            $sum: { $cond: [{ $eq: ['$status', 'rendue'] }, 1, 0] }
          },
          chiffreAffaires: { $sum: '$total' },
          commandesMoyennesParMois: { $avg: 1 }
        }
      }
    ]);

    res.json(stats || {
      total: 0,
      commandees: 0,
      livrees: 0,
      rendues: 0,
      chiffreAffaires: 0,
      commandesMoyennesParMois: 0
    });
  } catch (error: any) {
    console.error('Error in getOrdersStats:', error);
    next(createError('Erreur lors de la récupération des statistiques', 500));
  }
};