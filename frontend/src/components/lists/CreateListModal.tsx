import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, FolderPlus } from 'lucide-react';
import { useCreateList } from '@/hooks/useLists';
import toast from 'react-hot-toast';

interface CreateListModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateListModal({ isOpen, onClose }: CreateListModalProps) {
  const [listName, setListName] = useState('');
  const createListMutation = useCreateList();

  // Reset le formulaire quand la modale s'ouvre
  useEffect(() => {
    if (isOpen) {
      setListName('');
    }
  }, [isOpen]);

  // Gestion de la touche Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!listName.trim()) return;

    try {
      await createListMutation.mutateAsync({ name: listName.trim() });
      toast.success(`Liste "${listName.trim()}" créée`);
      onClose();
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      toast.error('Erreur lors de la création de la liste');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative w-full max-w-md transform rounded-2xl bg-white shadow-2xl transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <FolderPlus className="w-5 h-5 text-amber-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Nouvelle liste</h2>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="listName" className="block text-sm font-medium text-gray-700 mb-2 text-left">
                  Nom de la liste
                </label>
                <Input
                  id="listName"
                  placeholder="Ex: Mariage Dupont, Cérémonie 15 juin..."
                  value={listName}
                  onChange={(e) => setListName(e.target.value)}
                  className="w-full"
                  autoFocus
                />
              </div>

              <p className="text-sm text-gray-500 text-left">
                Créez une liste pour regrouper plusieurs commandes (mariage, cérémonie, événement...).
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl py-3"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={!listName.trim() || createListMutation.isPending}
                className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold rounded-xl py-3 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {createListMutation.isPending ? 'Création...' : 'Créer la liste'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
