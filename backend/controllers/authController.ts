import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel, CreateUserRequest, LoginRequest, AuthResponse } from '../models/User';
import { createError } from '../middleware/errorHandler';

// Clé secrète JWT (devrait être dans les variables d'environnement)
const JWT_SECRET: string = process.env.JWT_SECRET || 'votre-cle-secrete-tres-longue-et-complexe';
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '7d';

// Fonction pour générer un token JWT
const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as any);
};

export const authController = {
  // POST /api/auth/register
  register: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { nom, prenom, email, password, role }: CreateUserRequest = req.body;

      // Validation des données
      if (!nom || !prenom || !email || !password) {
        throw createError('Tous les champs sont requis', 400);
      }

      if (password.length < 6) {
        throw createError('Le mot de passe doit contenir au moins 6 caractères', 400);
      }

      // Vérifier si l'utilisateur existe déjà
      const existingUser = await UserModel.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        throw createError('Un utilisateur avec cet email existe déjà', 409);
      }

      // Créer le nouvel utilisateur
      const newUser = new UserModel({
        nom: nom.trim(),
        prenom: prenom.trim(),
        email: email.toLowerCase().trim(),
        password,
        role: role || 'vendeur'
      });

      const savedUser = await newUser.save();

      // Générer le token
      const token = generateToken((savedUser._id as any).toString());

      // Préparer la réponse (sans le mot de passe)
      const response: AuthResponse = {
        user: {
          nom: savedUser.nom,
          prenom: savedUser.prenom,
          email: savedUser.email,
          role: savedUser.role,
          isActive: savedUser.isActive,
          createdAt: savedUser.createdAt,
          updatedAt: savedUser.updatedAt
        },
        token
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  },

  // POST /api/auth/login
  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password }: LoginRequest = req.body;

      // Validation des données
      if (!email || !password) {
        throw createError('Email et mot de passe sont requis', 400);
      }

      // Trouver l'utilisateur par email
      const user = await UserModel.findOne({ 
        email: email.toLowerCase(),
        isActive: true 
      });

      if (!user) {
        throw createError('Email ou mot de passe incorrect', 401);
      }

      // Vérifier le mot de passe
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        throw createError('Email ou mot de passe incorrect', 401);
      }

      // Générer le token
      const token = generateToken((user._id as any).toString());

      // Préparer la réponse (sans le mot de passe)
      const response: AuthResponse = {
        user: {
          nom: user.nom,
          prenom: user.prenom,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        },
        token
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  },

  // GET /api/auth/me
  me: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // L'utilisateur sera ajouté à req par le middleware d'authentification
      const userId = (req as any).userId;
      
      const user = await UserModel.findById(userId);
      if (!user) {
        throw createError('Utilisateur non trouvé', 404);
      }

      res.json(user); // toJSON() enlève automatiquement le mot de passe
    } catch (error) {
      next(error);
    }
  },

  // POST /api/auth/logout
  logout: async (_req: Request, res: Response) => {
    // Pour un logout simple, on peut juste renvoyer un succès
    // Le client devra supprimer le token de son stockage local
    res.json({ message: 'Déconnexion réussie' });
  }
};