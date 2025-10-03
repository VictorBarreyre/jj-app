import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcrypt';

// Interface pour les données utilisateur
export interface IUser {
  nom: string;
  prenom?: string;
  email: string;
  password: string;
  role: 'vendeur' | 'admin';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Interface pour le document MongoDB
export interface IUserDocument extends IUser, Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Schéma MongoDB pour les utilisateurs
const userSchema = new Schema<IUserDocument>({
  nom: {
    type: String,
    required: true,
    trim: true
  },
  prenom: {
    type: String,
    required: false,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['vendeur', 'admin'],
    default: 'vendeur'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'users'
});

// Index pour les recherches
userSchema.index({ email: 1 });
userSchema.index({ nom: 1, prenom: 1 });

// Middleware pour hasher le mot de passe avant de sauvegarder
userSchema.pre('save', async function(next) {
  // Ne hash que si le mot de passe a été modifié
  if (!this.isModified('password')) return next();
  
  try {
    // Hash le mot de passe avec un salt de 12
    const saltRounds = 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error as any);
  }
});

// Méthode pour comparer les mots de passe
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Méthode pour récupérer les données publiques (sans mot de passe)
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

// Export du modèle
export const UserModel = model<IUserDocument>('User', userSchema);

// Types pour les requêtes
export interface CreateUserRequest {
  nom: string;
  prenom?: string;
  email: string;
  password: string;
  role?: 'vendeur' | 'admin';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: Omit<IUser, 'password'>;
  token: string;
}