import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthContextType, RegisterRequest } from '@/types/auth';
import { authService } from '@/services/auth.api';
import toast from 'react-hot-toast';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialiser l'authentification au chargement
  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedToken = authService.getToken();
        const savedUser = authService.getUser();

        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(savedUser);
          
          // Vérifier que le token est toujours valide
          try {
            const currentUser = await authService.me();
            setUser(currentUser);
            authService.setUser(currentUser);
          } catch (error) {
            // Token invalide, nettoyer
            authService.removeToken();
            setToken(null);
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de l\'authentification:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authService.login({ email, password });
      
      setUser(response.user);
      setToken(response.token);
      
      authService.setToken(response.token);
      authService.setUser(response.user);
      
      toast.success(`Bienvenue ${response.user.prenom} !`);
    } catch (error: any) {
      const message = error.response?.data?.error || 'Erreur lors de la connexion';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterRequest) => {
    try {
      setIsLoading(true);
      const response = await authService.register(userData);
      
      setUser(response.user);
      setToken(response.token);
      
      authService.setToken(response.token);
      authService.setUser(response.user);
      
      toast.success(`Bienvenue ${response.user.prenom} ! Votre compte a été créé.`);
    } catch (error: any) {
      const message = error.response?.data?.error || 'Erreur lors de l\'inscription';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      setUser(null);
      setToken(null);
      authService.removeToken();
      toast.success('Déconnexion réussie');
    }
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    isLoading,
    isAuthenticated: !!user && !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};