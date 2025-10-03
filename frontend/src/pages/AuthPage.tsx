import React, { useState } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';

type AuthView = 'login' | 'register' | 'forgot-password';

export const AuthPage: React.FC = () => {
  const [currentView, setCurrentView] = useState<AuthView>('login');

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl mb-4">
            <span className="text-2xl font-bold text-white">JJ</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Jean Jacques Cérémonie</h2>
          <p className="text-gray-600">Espace vendeur</p>
        </div>

        {/* Formulaires */}
        {currentView === 'login' && (
          <LoginForm
            onSwitchToRegister={() => setCurrentView('register')}
            onSwitchToForgotPassword={() => setCurrentView('forgot-password')}
          />
        )}
        {currentView === 'register' && (
          <RegisterForm onSwitchToLogin={() => setCurrentView('login')} />
        )}
        {currentView === 'forgot-password' && (
          <ForgotPasswordForm onBackToLogin={() => setCurrentView('login')} />
        )}
      </div>
    </div>
  );
};