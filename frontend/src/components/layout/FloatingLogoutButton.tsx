import React from 'react';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const FloatingLogoutButton: React.FC = () => {
  const { logout } = useAuth();

  return (
    <Button
      onClick={logout}
      className="hidden md:flex fixed bottom-6 right-6 z-50 bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-full p-3 w-12 h-12 items-center justify-center"
      title="Se déconnecter"
    >
      <LogOut className="w-5 h-5" />
    </Button>
  );
};