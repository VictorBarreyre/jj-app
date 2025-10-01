import React, { useState } from 'react';
import { Mail } from 'lucide-react';
import { Button } from './button';
import { RentalContract } from '../../types/rental-contract';

interface EmailButtonProps {
  contract: RentalContract;
  type?: 'vendeur' | 'client';
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  participantIndex?: number;
  customEmail?: string;
}

export const EmailButton: React.FC<EmailButtonProps> = ({
  contract,
  type = 'client',
  className,
  variant = 'ghost',
  size = 'sm',
  showText = false,
  participantIndex,
  customEmail
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSendEmail = async () => {
    try {
      setIsLoading(true);
      setMessage(null);

      const recipientEmail = customEmail || contract.client.email;

      if (!recipientEmail) {
        setMessage('Aucune adresse email disponible');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/contracts/${contract.id}/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          email: recipientEmail,
          type,
          participantIndex
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de l\'envoi de l\'email');
      }

      const result = await response.json();
      setMessage(`Email envoyé avec succès à ${recipientEmail}`);

      // Effacer le message après 3 secondes
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error);
      setMessage(error instanceof Error ? error.message : 'Erreur lors de l\'envoi de l\'email');

      // Effacer le message d'erreur après 5 secondes
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={handleSendEmail}
        disabled={isLoading}
        title={`Envoyer le bon de location par email ${type === 'vendeur' ? '(vendeur)' : '(client)'}`}
      >
        <Mail className={`w-3 h-3 ${isLoading ? 'animate-pulse' : ''}`} />
        {showText && <span className="ml-1">{isLoading ? 'Envoi...' : 'Email'}</span>}
      </Button>

      {message && (
        <div className={`absolute top-full left-0 mt-1 px-2 py-1 text-xs rounded shadow-lg z-10 whitespace-nowrap ${
          message.includes('succès')
            ? 'bg-green-100 text-green-800 border border-green-200'
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {message}
        </div>
      )}
    </div>
  );
};