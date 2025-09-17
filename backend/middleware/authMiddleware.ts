import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User';
import { createError } from './errorHandler';

const JWT_SECRET = process.env.JWT_SECRET || 'votre-cle-secrete-tres-longue-et-complexe';

// Interface pour étendre Request avec les données utilisateur
interface AuthenticatedRequest extends Request {
  userId?: string;
  user?: any;
}

// Middleware pour vérifier l'authentification
export const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    // Récupérer le token depuis l'header Authorization
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      throw createError('Token d\'authentification requis', 401);
    }

    // Vérifier et décoder le token
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    
    // Vérifier que l'utilisateur existe et est actif
    const user = await UserModel.findById(decoded.userId);
    if (!user || !user.isActive) {
      throw createError('Token invalide ou utilisateur inactif', 401);
    }

    // Ajouter les informations utilisateur à la requête
    req.userId = decoded.userId;
    req.user = user;
    
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(createError('Token invalide', 401));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(createError('Token expiré', 401));
    } else {
      next(error);
    }
  }
};

// Middleware pour vérifier les rôles
export const requireRole = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw createError('Authentification requise', 401);
      }

      if (!roles.includes(req.user.role)) {
        throw createError('Permissions insuffisantes', 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Middleware optionnel pour récupérer l'utilisateur si token présent
export const optionalAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        const user = await UserModel.findById(decoded.userId);
        
        if (user && user.isActive) {
          req.userId = decoded.userId;
          req.user = user;
        }
      } catch (error) {
        // Ignorer les erreurs de token en mode optionnel
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};