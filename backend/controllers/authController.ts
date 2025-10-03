import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { UserModel, CreateUserRequest, LoginRequest, AuthResponse } from '../models/User';
import { createError } from '../middleware/errorHandler';
import { emailService } from '../services/emailService';

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
      if (!nom || !email || !password) {
        throw createError('Le nom, l\'email et le mot de passe sont requis', 400);
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
      // Si le prénom n'est pas fourni, utiliser le nom complet
      const newUser = new UserModel({
        nom: nom.trim(),
        prenom: prenom ? prenom.trim() : nom.trim(),
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
  },

  // POST /api/auth/forgot-password
  forgotPassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;

      if (!email) {
        throw createError('L\'email est requis', 400);
      }

      // Chercher l'utilisateur
      const user = await UserModel.findOne({ email: email.toLowerCase() });

      // Pour des raisons de sécurité, on renvoie toujours le même message même si l'email n'existe pas
      if (!user) {
        res.json({ message: 'Si cet email existe, un lien de réinitialisation a été envoyé' });
        return;
      }

      // Générer un token de réinitialisation
      const resetToken = crypto.randomBytes(32).toString('hex');

      // Hash le token avant de le sauvegarder
      const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

      // Sauvegarder le token et la date d'expiration (1 heure)
      user.resetPasswordToken = hashedToken;
      user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 heure
      await user.save();

      // Envoyer l'email avec le token non hashé
      await emailService.sendPasswordResetEmail(user.email, resetToken);

      res.json({ message: 'Si cet email existe, un lien de réinitialisation a été envoyé' });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/auth/reset-password
  resetPassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        throw createError('Token et nouveau mot de passe sont requis', 400);
      }

      if (newPassword.length < 6) {
        throw createError('Le mot de passe doit contenir au moins 6 caractères', 400);
      }

      // Hash le token reçu pour le comparer
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      // Chercher l'utilisateur avec ce token et qui n'a pas expiré
      const user = await UserModel.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() }
      });

      if (!user) {
        throw createError('Token invalide ou expiré', 400);
      }

      // Mettre à jour le mot de passe
      user.password = newPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      res.json({ message: 'Mot de passe réinitialisé avec succès' });
    } catch (error) {
      next(error);
    }
  }
};