import { Request, Response, NextFunction } from 'express';
import { RentalContract, CreateRentalContractData, UpdateRentalContractData, ContractNumbering } from '../models/RentalContract';
import { createError } from '../middleware/errorHandler';
import { v4 as uuidv4 } from 'uuid';

// Simulation d'une base de données en mémoire
let contracts: RentalContract[] = [];
let contractNumbering: ContractNumbering = {
  year: new Date().getFullYear(),
  lastNumber: 0,
  prefix: 'JJ'
};

// Fonction pour générer un numéro de contrat
const generateContractNumber = (): string => {
  const currentYear = new Date().getFullYear();
  
  // Réinitialiser si nouvelle année
  if (contractNumbering.year !== currentYear) {
    contractNumbering.year = currentYear;
    contractNumbering.lastNumber = 0;
  }
  
  contractNumbering.lastNumber += 1;
  const number = contractNumbering.lastNumber.toString().padStart(5, '0');
  
  return `${contractNumbering.prefix}-${currentYear}-${number}`;
};

export const rentalContractsController = {
  // GET /api/contracts
  getAllContracts: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status, search, dateStart, dateEnd } = req.query;
      
      let filteredContracts = [...contracts];
      
      // Filtrer par statut
      if (status && status !== 'all') {
        filteredContracts = filteredContracts.filter(contract => contract.status === status);
      }
      
      // Filtrer par recherche (nom, numéro, téléphone)
      if (search) {
        const searchTerm = search.toString().toLowerCase();
        filteredContracts = filteredContracts.filter(contract => 
          contract.numero.toLowerCase().includes(searchTerm) ||
          contract.client.nom.toLowerCase().includes(searchTerm) ||
          contract.client.telephone.includes(searchTerm)
        );
      }
      
      // Filtrer par période
      if (dateStart) {
        filteredContracts = filteredContracts.filter(contract => 
          new Date(contract.dateEvenement) >= new Date(dateStart.toString())
        );
      }
      
      if (dateEnd) {
        filteredContracts = filteredContracts.filter(contract => 
          new Date(contract.dateEvenement) <= new Date(dateEnd.toString())
        );
      }
      
      res.json({
        contracts: filteredContracts,
        total: filteredContracts.length,
        numbering: contractNumbering
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/contracts/:id
  getContractById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const contract = contracts.find(c => c.id === id);
      
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
      const contractData: CreateRentalContractData = req.body;
      
      // Validation
      if (!contractData.client.nom || !contractData.client.telephone) {
        throw createError('Le nom et téléphone du client sont requis', 400);
      }
      
      if (!contractData.dateEvenement || !contractData.dateRetrait || !contractData.dateRetour) {
        throw createError('Les dates d\'événement, de retrait et de retour sont requises', 400);
      }
      
      if (contractData.tarifLocation < 0 || contractData.depotGarantie < 0 || contractData.arrhes < 0) {
        throw createError('Les montants ne peuvent pas être négatifs', 400);
      }
      
      const newContract: RentalContract = {
        ...contractData,
        id: uuidv4(),
        numero: generateContractNumber(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      contracts.push(newContract);
      
      res.status(201).json(newContract);
    } catch (error) {
      next(error);
    }
  },

  // PUT /api/contracts/:id
  updateContract: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updateData: UpdateRentalContractData = req.body;
      
      const contractIndex = contracts.findIndex(c => c.id === id);
      if (contractIndex === -1) {
        throw createError('Bon de location non trouvé', 404);
      }
      
      contracts[contractIndex] = {
        ...contracts[contractIndex],
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      
      res.json(contracts[contractIndex]);
    } catch (error) {
      next(error);
    }
  },

  // POST /api/contracts/:id/payment
  recordPayment: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { type, amount, method, date } = req.body; // type: 'arrhes' | 'solde'
      
      const contractIndex = contracts.findIndex(c => c.id === id);
      if (contractIndex === -1) {
        throw createError('Bon de location non trouvé', 404);
      }
      
      const paymentInfo = {
        amount,
        method,
        date: date || new Date().toISOString()
      };
      
      if (type === 'arrhes') {
        contracts[contractIndex].paiementArrhes = paymentInfo;
      } else if (type === 'solde') {
        contracts[contractIndex].paiementSolde = paymentInfo;
      }
      
      contracts[contractIndex].updatedAt = new Date().toISOString();
      
      res.json(contracts[contractIndex]);
    } catch (error) {
      next(error);
    }
  },

  // POST /api/contracts/:id/return
  markAsReturned: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { dateRetour } = req.body;
      
      const contractIndex = contracts.findIndex(c => c.id === id);
      if (contractIndex === -1) {
        throw createError('Bon de location non trouvé', 404);
      }
      
      contracts[contractIndex].rendu = true;
      contracts[contractIndex].dateRendu = dateRetour || new Date().toISOString();
      contracts[contractIndex].status = 'rendu';
      contracts[contractIndex].updatedAt = new Date().toISOString();
      
      res.json(contracts[contractIndex]);
    } catch (error) {
      next(error);
    }
  },

  // GET /api/contracts/:id/print/:type
  getPrintData: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id, type } = req.params; // type: 'jj' | 'client'
      
      const contract = contracts.find(c => c.id === id);
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
      const contractIndex = contracts.findIndex(c => c.id === id);
      
      if (contractIndex === -1) {
        throw createError('Bon de location non trouvé', 404);
      }
      
      contracts.splice(contractIndex, 1);
      
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
};