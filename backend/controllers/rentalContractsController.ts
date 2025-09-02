import { Request, Response, NextFunction } from 'express';
import { RentalContract, CreateRentalContractData, UpdateRentalContractData } from '../models/RentalContract';
import { RentalContractModel, ContractNumberingModel } from '../models/RentalContractMongo';
import { OrderModel, IOrderItem } from '../models/OrderMongo';
import { createError } from '../middleware/errorHandler';

// Fonction pour générer un numéro de contrat
const generateContractNumber = async (): Promise<string> => {
  const currentYear = new Date().getFullYear();
  
  // Trouver ou créer le document de numérotation pour l'année courante
  let numbering = await ContractNumberingModel.findOne({ year: currentYear });
  
  if (!numbering) {
    // Créer un nouveau document pour cette année
    numbering = new ContractNumberingModel({
      year: currentYear,
      lastNumber: 0,
      prefix: 'JJ'
    });
  }
  
  numbering.lastNumber += 1;
  await numbering.save();
  
  const number = numbering.lastNumber.toString().padStart(5, '0');
  return `${numbering.prefix}-${currentYear}-${number}`;
};

// Fonction pour créer une commande à partir d'un contrat de location
const createOrderFromContract = async (contract: any): Promise<void> => {
  try {
    // Créer les items de commande à partir de la tenue et des articles de stock
    const orderItems: IOrderItem[] = [];
    
    // Ajouter la tenue si elle existe
    if (contract.tenue) {
      if (contract.tenue.veste) {
        orderItems.push({
          id: `veste-${Date.now()}`,
          category: 'veste',
          reference: contract.tenue.veste.reference,
          measurements: {
            longueur: contract.tenue.veste.longueur,
            longueurManche: contract.tenue.veste.longueurManche,
            notes: contract.tenue.veste.notes
          },
          quantity: 1,
          notes: contract.tenue.veste.notes
        });
      }
      
      if (contract.tenue.gilet) {
        orderItems.push({
          id: `gilet-${Date.now()}`,
          category: 'gilet',
          reference: contract.tenue.gilet.reference,
          measurements: {
            longueur: contract.tenue.gilet.longueur,
            notes: contract.tenue.gilet.notes
          },
          quantity: 1,
          notes: contract.tenue.gilet.notes
        });
      }
      
      if (contract.tenue.pantalon) {
        orderItems.push({
          id: `pantalon-${Date.now()}`,
          category: 'pantalon',
          reference: contract.tenue.pantalon.reference,
          measurements: {
            longueur: contract.tenue.pantalon.longueur,
            notes: contract.tenue.pantalon.notes
          },
          quantity: 1,
          notes: contract.tenue.pantalon.notes
        });
      }
    }
    
    // Ajouter les articles de stock si ils existent
    if (contract.articlesStock && contract.articlesStock.length > 0) {
      for (const item of contract.articlesStock) {
        orderItems.push({
          id: `stock-${item.stockItemId}`,
          category: 'veste', // À adapter selon le type d'article
          reference: item.reference,
          measurements: {},
          quantity: item.quantiteReservee,
          unitPrice: item.prix,
          totalPrice: item.prix * item.quantiteReservee
        });
      }
    }
    
    // Créer la commande
    const newOrder = new OrderModel({
      numero: contract.numero, // Utiliser le même numéro que le contrat
      client: {
        nom: contract.client.nom,
        telephone: contract.client.telephone,
        email: contract.client.email
      },
      dateCreation: contract.dateCreation,
      dateLivraison: contract.dateEvenement, // Date d'événement = date de livraison
      items: orderItems,
      total: contract.tarifLocation,
      status: 'commandee',
      type: 'individuel', // Bon de location = commande individuelle
      notes: `Commande générée automatiquement depuis le bon de location ${contract.numero}. ${contract.notes || ''}`.trim()
    });
    
    await newOrder.save();
    console.log('✅ Commande créée automatiquement:', newOrder._id);
  } catch (error) {
    console.error('❌ Erreur lors de la création de la commande:', error);
    // Ne pas faire échouer la création du contrat si la commande échoue
  }
};

// Fonction utilitaire pour créer automatiquement des mouvements de stock
const createStockMovements = async (contract: any, type: 'reservation' | 'retour' | 'annulation') => {
  if (!contract.articlesStock || contract.articlesStock.length === 0) return;
  
  for (const item of contract.articlesStock) {
    const movementData = {
      stockItemId: item.stockItemId,
      type: type,
      quantite: item.quantiteReservee,
      dateMovement: new Date().toISOString(),
      datePrevue: type === 'reservation' ? contract.dateRetrait : undefined,
      dateRetour: type === 'reservation' ? contract.dateRetour : undefined,
      contractId: contract.id,
      vendeur: contract.vendeur,
      commentaire: `${type} pour contrat ${contract.numero} - ${item.reference}`
    };

    try {
      // Simuler l'appel à l'API stock
      const response = await fetch('http://localhost:3001/api/stock/movements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(movementData)
      });
      
      if (!response.ok) {
        console.error(`Erreur lors de la création du mouvement de stock pour ${item.reference}`);
      }
    } catch (error) {
      console.error('Erreur lors de la création du mouvement de stock:', error);
    }
  }
};

export const rentalContractsController = {
  // GET /api/contracts
  getAllContracts: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status, search, dateStart, dateEnd, page = 1, limit = 50 } = req.query;
      
      // Construire la query MongoDB
      const query: any = {};
      
      // Filtrer par statut
      if (status && status !== 'all') {
        query.status = status;
      }
      
      // Filtrer par recherche (nom, numéro, téléphone)
      if (search) {
        const searchTerm = search.toString();
        query.$or = [
          { numero: { $regex: searchTerm, $options: 'i' } },
          { 'client.nom': { $regex: searchTerm, $options: 'i' } },
          { 'client.telephone': { $regex: searchTerm, $options: 'i' } }
        ];
      }
      
      // Filtrer par période
      if (dateStart || dateEnd) {
        query.dateEvenement = {};
        if (dateStart) {
          query.dateEvenement.$gte = new Date(dateStart.toString());
        }
        if (dateEnd) {
          query.dateEvenement.$lte = new Date(dateEnd.toString());
        }
      }
      
      // Pagination
      const pageNum = Math.max(1, parseInt(page.toString()));
      const limitNum = Math.max(1, Math.min(100, parseInt(limit.toString())));
      const skip = (pageNum - 1) * limitNum;
      
      // Exécuter les requêtes en parallèle
      const [contracts, total, numbering] = await Promise.all([
        RentalContractModel.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum)
          .lean(),
        RentalContractModel.countDocuments(query),
        ContractNumberingModel.findOne({ year: new Date().getFullYear() })
      ]);
      
      res.json({
        contracts,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum),
        numbering: numbering || { year: new Date().getFullYear(), lastNumber: 0, prefix: 'JJ' }
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/contracts/:id
  getContractById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const contract = await RentalContractModel.findById(id);
      
      if (!contract) {
        throw createError('Bon de location non trouvé', 404);
      }
      
      res.json(contract);
    } catch (error) {
      next(error);
    }
  },

  // POST /api/contracts
  createContract: async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log('🔍 Données reçues:', JSON.stringify(req.body, null, 2));
      const contractData: CreateRentalContractData = req.body;
      
      // Validation
      if (!contractData.client?.nom || !contractData.client?.telephone) {
        throw createError('Le nom et téléphone du client sont requis', 400);
      }
      
      if (!contractData.dateEvenement || !contractData.dateRetrait || !contractData.dateRetour) {
        throw createError('Les dates d\'événement, de retrait et de retour sont requises', 400);
      }
      
      if (contractData.tarifLocation < 0 || contractData.depotGarantie < 0 || contractData.arrhes < 0) {
        throw createError('Les montants ne peuvent pas être négatifs', 400);
      }
      
      // Générer le numéro de contrat
      console.log('📋 Génération du numéro de contrat...');
      const numero = await generateContractNumber();
      console.log('✅ Numéro généré:', numero);
      
      // Créer le nouveau contrat
      const contractToSave = {
        ...contractData,
        numero,
        dateCreation: contractData.dateCreation || new Date(),
        dateEvenement: new Date(contractData.dateEvenement),
        dateRetrait: new Date(contractData.dateRetrait),
        dateRetour: new Date(contractData.dateRetour),
      };
      console.log('💾 Contrat à sauvegarder:', JSON.stringify(contractToSave, null, 2));
      
      const newContract = new RentalContractModel(contractToSave);
      const savedContract = await newContract.save();
      console.log('✅ Contrat sauvegardé avec ID:', savedContract._id);
      
      // Créer automatiquement une commande correspondante
      console.log('📋 Création de la commande associée...');
      await createOrderFromContract(savedContract);
      
      // Créer automatiquement les mouvements de stock si des articles sont spécifiés
      if (savedContract.articlesStock && savedContract.articlesStock.length > 0) {
        console.log('📦 Création des mouvements de stock...');
        await createStockMovements(savedContract, 'reservation');
      }
      
      res.status(201).json(savedContract);
    } catch (error) {
      console.error('❌ Erreur lors de la création du contrat:', error);
      next(error);
    }
  },

  // PUT /api/contracts/:id
  updateContract: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updateData: UpdateRentalContractData = req.body;
      
      const updatedContract = await RentalContractModel.findByIdAndUpdate(
        id,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      );
      
      if (!updatedContract) {
        throw createError('Bon de location non trouvé', 404);
      }
      
      res.json(updatedContract);
    } catch (error) {
      next(error);
    }
  },

  // POST /api/contracts/:id/payment
  recordPayment: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { type, amount, method, date } = req.body; // type: 'arrhes' | 'solde'
      
      const paymentInfo = {
        amount,
        method,
        date: date || new Date().toISOString()
      };
      
      const updateData: any = { updatedAt: new Date() };
      if (type === 'arrhes') {
        updateData.paiementArrhes = paymentInfo;
      } else if (type === 'solde') {
        updateData.paiementSolde = paymentInfo;
      }
      
      const updatedContract = await RentalContractModel.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );
      
      if (!updatedContract) {
        throw createError('Bon de location non trouvé', 404);
      }
      
      res.json(updatedContract);
    } catch (error) {
      next(error);
    }
  },

  // POST /api/contracts/:id/return
  markAsReturned: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { dateRetour } = req.body;
      
      const updatedContract = await RentalContractModel.findByIdAndUpdate(
        id,
        {
          rendu: true,
          dateRendu: dateRetour ? new Date(dateRetour) : new Date(),
          status: 'rendu',
          updatedAt: new Date()
        },
        { new: true }
      );
      
      if (!updatedContract) {
        throw createError('Bon de location non trouvé', 404);
      }
      
      // Créer automatiquement les mouvements de retour
      await createStockMovements(updatedContract, 'retour');
      
      res.json(updatedContract);
    } catch (error) {
      next(error);
    }
  },

  // GET /api/contracts/:id/print/:type
  getPrintData: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id, type } = req.params; // type: 'jj' | 'client'
      
      const contract = await RentalContractModel.findById(id);
      if (!contract) {
        throw createError('Bon de location non trouvé', 404);
      }
      
      const printData = {
        contract,
        printType: type,
        printedAt: new Date().toISOString()
      };
      
      res.json(printData);
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/contracts/:id
  deleteContract: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      
      const contractToDelete = await RentalContractModel.findById(id);
      if (!contractToDelete) {
        throw createError('Bon de location non trouvé', 404);
      }
      
      // Créer automatiquement les mouvements d'annulation si le contrat n'était pas encore rendu
      if (!contractToDelete.rendu) {
        await createStockMovements(contractToDelete, 'annulation');
      }
      
      await RentalContractModel.findByIdAndDelete(id);
      
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
};