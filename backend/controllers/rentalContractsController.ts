import { Request, Response, NextFunction } from 'express';
import { RentalContract, CreateRentalContractData, UpdateRentalContractData } from '../models/RentalContract';
import { RentalContractModel, ContractNumberingModel } from '../models/RentalContractMongo';
import { createError } from '../middleware/errorHandler';
import { emailService } from '../services/emailService';
import { backendPDFService } from '../services/pdfService';

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
      
      // Reclassifier les contrats existants selon la nouvelle logique
      const reclassifiedContracts = contracts.map(contract => {
        const hasMultipleParticipants = contract.participantCount && contract.participantCount > 1;
        const hasGroupDetails = contract.groupDetails && contract.groupDetails.participants && contract.groupDetails.participants.length > 1;
        const hasMultipleStockItems = contract.articlesStock && contract.articlesStock.length > 3; // Plus de 3 articles = probablement plusieurs personnes
        const hasGroupKeywords = contract.client.nom.toLowerCase().includes('groupe') || 
                                contract.client.nom.toLowerCase().includes('mariage') ||
                                contract.client.nom.toLowerCase().includes('ceremonie') ||
                                contract.client.nom.toLowerCase().includes('personnes');
        
        const shouldBeGroupe = hasMultipleParticipants || hasGroupDetails || hasMultipleStockItems || hasGroupKeywords;
        
        // Si la classification a changé, mettre à jour le type
        // Gérer les cas où contract.type est undefined (défaut = 'individuel')
        const currentType = contract.type || 'individuel';
        
        if (shouldBeGroupe && currentType === 'individuel') {
          return { ...contract, type: 'groupe' };
        } else if (!shouldBeGroupe && currentType === 'groupe') {
          return { ...contract, type: 'individuel' };
        }
        
        // Assurer qu'il y a toujours un type défini
        return { ...contract, type: shouldBeGroupe ? 'groupe' : 'individuel' };
      });
      
      res.json({
        contracts: reclassifiedContracts,
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
      const contract = await RentalContractModel.findById(id).lean();
      
      if (!contract) {
        throw createError('Bon de location non trouvé', 404);
      }
      
      // Reclassifier le contrat selon la nouvelle logique
      const hasMultipleParticipants = contract.participantCount && contract.participantCount > 1;
      const hasGroupDetails = contract.groupDetails && contract.groupDetails.participants && contract.groupDetails.participants.length > 1;
      const hasMultipleStockItems = contract.articlesStock && contract.articlesStock.length > 3; // Plus de 3 articles = probablement plusieurs personnes
      const hasGroupKeywords = contract.client.nom.toLowerCase().includes('groupe') || 
                              contract.client.nom.toLowerCase().includes('mariage') ||
                              contract.client.nom.toLowerCase().includes('ceremonie') ||
                              contract.client.nom.toLowerCase().includes('personnes');
      
      const shouldBeGroupe = hasMultipleParticipants || hasGroupDetails || hasMultipleStockItems || hasGroupKeywords;
      
      // Si la classification a changé, mettre à jour le type
      // Gérer les cas où contract.type est undefined (défaut = 'individuel')
      const currentType = contract.type || 'individuel';
      const reclassifiedContract = { ...contract };
      
      if (shouldBeGroupe && currentType === 'individuel') {
        reclassifiedContract.type = 'groupe';
      } else if (!shouldBeGroupe && currentType === 'groupe') {
        reclassifiedContract.type = 'individuel';
      } else {
        // Assurer qu'il y a toujours un type défini
        reclassifiedContract.type = shouldBeGroupe ? 'groupe' : 'individuel';
      }
      
      res.json(reclassifiedContract);
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

      // Validation des montants (seulement si définis)
      if ((contractData.tarifLocation !== undefined && contractData.tarifLocation < 0) ||
          (contractData.depotGarantie !== undefined && contractData.depotGarantie < 0) ||
          (contractData.arrhes !== undefined && contractData.arrhes < 0)) {
        throw createError('Les montants ne peuvent pas être négatifs', 400);
      }
      
      // Générer le numéro de contrat
      console.log('📋 Génération du numéro de contrat...');
      const numero = await generateContractNumber();
      console.log('✅ Numéro généré:', numero);
      
      // Nettoyer les données avant sauvegarde
      const cleanedData: any = { ...contractData };
      
      // Supprimer paiementArrhes si amount n'est pas fourni
      if (cleanedData.paiementArrhes && !cleanedData.paiementArrhes.amount) {
        cleanedData.paiementArrhes = undefined;
      }
      
      // Supprimer paiementSolde si amount n'est pas fourni
      if (cleanedData.paiementSolde && !cleanedData.paiementSolde.amount) {
        cleanedData.paiementSolde = undefined;
      }
      
      // Nettoyer la tenue - supprimer les pièces avec taille vide
      if (cleanedData.tenue) {
        const tenue: any = {};
        if (cleanedData.tenue.veste && cleanedData.tenue.veste.taille) {
          tenue.veste = cleanedData.tenue.veste;
        }
        if (cleanedData.tenue.gilet && cleanedData.tenue.gilet.taille) {
          tenue.gilet = cleanedData.tenue.gilet;
        }
        if (cleanedData.tenue.pantalon && cleanedData.tenue.pantalon.taille) {
          tenue.pantalon = cleanedData.tenue.pantalon;
        }
        if (cleanedData.tenue.tailleChapeau) {
          tenue.tailleChapeau = cleanedData.tenue.tailleChapeau;
        }
        if (cleanedData.tenue.tailleChaussures) {
          tenue.tailleChaussures = cleanedData.tenue.tailleChaussures;
        }
        
        // Si la tenue a au moins une pièce, l'inclure
        cleanedData.tenue = Object.keys(tenue).length > 0 ? tenue : undefined;
      }
      
      // Détecter le type d'événement basé sur plusieurs critères
      const hasMultipleParticipants = cleanedData.participantCount && cleanedData.participantCount > 1;
      const hasGroupDetails = cleanedData.groupDetails && cleanedData.groupDetails.participants && cleanedData.groupDetails.participants.length > 1;
      const hasMultipleStockItems = cleanedData.articlesStock && cleanedData.articlesStock.length > 3; // Plus de 3 articles = probablement plusieurs personnes
      const hasGroupKeywords = cleanedData.client.nom.toLowerCase().includes('groupe') || 
                              cleanedData.client.nom.toLowerCase().includes('mariage') ||
                              cleanedData.client.nom.toLowerCase().includes('ceremonie') ||
                              cleanedData.client.nom.toLowerCase().includes('personnes');
      
      const isGroupe = hasMultipleParticipants || hasGroupDetails || hasMultipleStockItems || hasGroupKeywords;
      
      // Créer le nouveau contrat
      const contractToSave = {
        ...cleanedData,
        numero,
        type: isGroupe ? 'groupe' : 'individuel',
        dateCreation: cleanedData.dateCreation || new Date(),
        dateEvenement: new Date(cleanedData.dateEvenement),
        dateRetrait: new Date(cleanedData.dateRetrait),
        dateRetour: new Date(cleanedData.dateRetour),
      };
      console.log('💾 Contrat à sauvegarder:', JSON.stringify(contractToSave, null, 2));
      
      const newContract = new RentalContractModel(contractToSave);
      const savedContract = await newContract.save();
      console.log('✅ Contrat sauvegardé avec ID:', savedContract._id);
      
      // Créer automatiquement les mouvements de stock si des articles sont spécifiés
      if (savedContract.articlesStock && savedContract.articlesStock.length > 0) {
        console.log('📦 Création des mouvements de stock...');
        await createStockMovements(savedContract, 'reservation');
      }

      // Envoyer automatiquement le bon de location par email au client (sauf pour les brouillons)
      if (savedContract.client.email && savedContract.status !== 'brouillon') {
        try {
          console.log(`📧 Envoi automatique du bon de location à ${savedContract.client.email}`);

          // Générer un PDF par participant (comme côté vendeur)
          const pdfBuffers: Buffer[] = [];

          if (savedContract.groupDetails?.participants && savedContract.groupDetails.participants.length > 0) {
            // Contrat de groupe : un PDF par participant
            console.log(`📄 Génération de ${savedContract.groupDetails.participants.length} PDFs (un par participant)`);
            for (let i = 0; i < savedContract.groupDetails.participants.length; i++) {
              const buffer = await backendPDFService.generatePDF(savedContract as any, 'client', i);
              pdfBuffers.push(buffer);
            }
          } else {
            // Contrat individuel : un seul PDF
            console.log('📄 Génération d\'1 PDF (contrat individuel)');
            const buffer = await backendPDFService.generatePDF(savedContract as any, 'client');
            pdfBuffers.push(buffer);
          }

          await emailService.sendContractEmail(savedContract as any, pdfBuffers);
          console.log('✅ Email automatique envoyé avec succès');
        } catch (emailError) {
          console.error('⚠️ Erreur lors de l\'envoi automatique de l\'email (n\'affecte pas la création du contrat):', emailError);
          // Ne pas faire échouer la création du contrat si l'email ne peut pas être envoyé
        }
      } else if (savedContract.status === 'brouillon') {
        console.log('📝 Brouillon sauvegardé - aucun email envoyé');
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

  // PUT /api/contracts/:id/participant/:participantIndex/return
  updateParticipantReturn: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id, participantIndex } = req.params;
      const { returned } = req.body;
      
      console.log('🔍 Debug updateParticipantReturn:', {
        id,
        participantIndex,
        returned,
        body: req.body
      });
      
      const contract = await RentalContractModel.findById(id);
      if (!contract) {
        console.log('❌ Contract not found with ID:', id);
        throw createError('Bon de location non trouvé', 404);
      }
      
      console.log('📄 Contract found:', {
        contractId: contract._id,
        type: contract.type,
        hasGroupDetails: !!contract.groupDetails,
        participantsCount: contract.groupDetails?.participants?.length
      });
      
      if (!contract.groupDetails?.participants) {
        console.log('❌ No group details or participants found');
        throw createError('Ce contrat n\'a pas de détails de groupe', 400);
      }
      
      // Si le contrat a des groupDetails mais n'est pas marqué comme groupe, le corriger automatiquement
      if (contract.type !== 'groupe') {
        console.log('🔄 Auto-updating contract type from', contract.type, 'to groupe');
        contract.type = 'groupe';
      }
      
      const index = parseInt(participantIndex);
      if (index < 0 || index >= contract.groupDetails.participants.length) {
        throw createError('Index de participant invalide', 400);
      }
      
      console.log('👤 Participant before update:', {
        index,
        currentRenduState: contract.groupDetails.participants[index].rendu,
        receivedRenduValue: returned
      });
      
      // Mettre à jour le statut de rendu du participant
      contract.groupDetails.participants[index].rendu = returned;
      
      // Vérifier si tous les participants ont rendu leur tenue
      const allReturned = contract.groupDetails.participants.every(p => p.rendu === true);
      
      // Mettre à jour le statut global si tous ont rendu
      if (allReturned && contract.status !== 'rendu') {
        contract.status = 'rendu';
        contract.rendu = true;
        contract.dateRendu = new Date();
        
        // Créer automatiquement les mouvements de retour
        await createStockMovements(contract, 'retour');
      } else if (!allReturned && contract.status === 'rendu') {
        // Si ce n'est plus le cas que tous ont rendu, revenir au statut "retire" (équivalent à "livré")
        contract.status = 'retire';
        contract.rendu = false;
        contract.dateRendu = undefined;
      }
      
      contract.updatedAt = new Date();
      
      const updatedContract = await contract.save();
      
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

  // GET /api/contracts/:id/pdf/:type
  generatePDF: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id, type } = req.params; // type: 'vendeur' | 'client'

      if (!['vendeur', 'client'].includes(type)) {
        throw createError('Type de PDF invalide. Utilisez "vendeur" ou "client"', 400);
      }

      const contract = await RentalContractModel.findById(id);
      if (!contract) {
        throw createError('Bon de location non trouvé', 404);
      }

      // Retourner les données du contrat pour génération PDF côté frontend
      const pdfData = {
        contract,
        type,
        generatedAt: new Date().toISOString()
      };

      res.json(pdfData);
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
  },

  // POST /api/contracts/:id/send-email
  sendContractEmail: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { email, type = 'client', participantIndex } = req.body;

      // Validation du type
      if (!['vendeur', 'client'].includes(type)) {
        throw createError('Type de PDF invalide. Utilisez "vendeur" ou "client"', 400);
      }

      // Récupérer le contrat
      const contract = await RentalContractModel.findById(id);
      if (!contract) {
        throw createError('Bon de location non trouvé', 404);
      }

      // Déterminer l'email de destination
      const recipientEmail = email || contract.client.email;
      if (!recipientEmail) {
        throw createError('Aucune adresse email spécifiée pour l\'envoi', 400);
      }

      console.log(`📧 Génération et envoi du PDF ${type} pour le contrat ${contract.numero} à ${recipientEmail}`);

      // Générer les PDFs
      console.log('🔄 Début génération PDF...');
      const pdfBuffers: Buffer[] = [];

      // Pour le type client, générer un PDF par participant (comme côté vendeur)
      if (type === 'client' && contract.groupDetails?.participants && contract.groupDetails.participants.length > 0) {
        console.log(`📄 Génération de ${contract.groupDetails.participants.length} PDFs pour le client`);
        for (let i = 0; i < contract.groupDetails.participants.length; i++) {
          const buffer = await backendPDFService.generatePDF(contract as any, 'client', i);
          pdfBuffers.push(buffer);
        }
      } else {
        // Pour vendeur ou contrat individuel : un seul PDF
        const buffer = await backendPDFService.generatePDF(contract as any, type as 'vendeur' | 'client', participantIndex);
        pdfBuffers.push(buffer);
      }

      console.log(`✅ ${pdfBuffers.length} PDF(s) généré(s)`);

      // Envoyer l'email avec les PDFs en pièces jointes
      console.log('📤 Début envoi email...');
      const emailSent = await emailService.sendContractEmail(contract as any, pdfBuffers, recipientEmail);
      console.log('📧 Résultat envoi email:', emailSent);

      if (!emailSent) {
        throw createError('Échec de l\'envoi de l\'email', 500);
      }

      console.log(`✅ Email envoyé avec succès pour le contrat ${contract.numero}`);

      res.json({
        success: true,
        message: `Email envoyé avec succès à ${recipientEmail}`,
        contractNumber: contract.numero
      });
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
      next(error);
    }
  }
};