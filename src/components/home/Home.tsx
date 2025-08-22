import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OrdersList } from './OrdersList';
import { Search, Plus, Filter, Package } from 'lucide-react';
import { Order } from '@/types/order';

interface HomeProps {
  orders: Order[];
  onCreateNew: () => void;
  onViewOrder: (order: Order) => void;
  onEditOrder: (order: Order) => void;
  onDeleteOrder: (orderId: string) => void;
}

export function Home({ orders, onCreateNew, onViewOrder, onEditOrder, onDeleteOrder }: HomeProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Filtrage des commandes
  const filteredOrders = useMemo(() => {
    let filtered = orders;

    // Filtre par recherche (numéro ou nom)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(order => 
        order.numero.toLowerCase().includes(query) ||
        order.client.nom.toLowerCase().includes(query) ||
        (order.client.prenom && order.client.prenom.toLowerCase().includes(query))
      );
    }

    // Filtre par statut
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Tri par date de création (plus récent en premier)
    return filtered.sort((a, b) => new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime());
  }, [orders, searchQuery, statusFilter]);

  // Statistiques rapides
  const stats = useMemo(() => {
    const total = orders.length;
    const brouillons = orders.filter(o => o.status === 'brouillon').length;
    const enProduction = orders.filter(o => o.status === 'en_production').length;
    const pretes = orders.filter(o => o.status === 'prete').length;
    
    return { total, brouillons, enProduction, pretes };
  }, [orders]);

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* En-tête */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Jean Jacques Cérémonie - Gestion des Commandes
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-sm text-muted-foreground">Total commandes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-600">{stats.brouillons}</div>
            <p className="text-sm text-muted-foreground">Brouillons</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{stats.enProduction}</div>
            <p className="text-sm text-muted-foreground">En production</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{stats.pretes}</div>
            <p className="text-sm text-muted-foreground">Prêtes</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions et recherche */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Barre de recherche */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher par numéro de commande ou nom client..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtre par statut */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="brouillon">Brouillon</SelectItem>
                <SelectItem value="confirmee">Confirmée</SelectItem>
                <SelectItem value="en_production">En production</SelectItem>
                <SelectItem value="prete">Prête</SelectItem>
                <SelectItem value="livree">Livrée</SelectItem>
                <SelectItem value="annulee">Annulée</SelectItem>
              </SelectContent>
            </Select>

            {/* Bouton nouvelle commande */}
            <Button onClick={onCreateNew} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle prise de mesure
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Liste des commandes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            Commandes {filteredOrders.length > 0 && `(${filteredOrders.length})`}
          </h2>
          {searchQuery && (
            <Badge variant="outline" className="text-sm">
              Recherche: "{searchQuery}"
            </Badge>
          )}
        </div>

        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-gray-500">
                {searchQuery ? (
                  <div>
                    <Search className="mx-auto w-12 h-12 text-gray-300 mb-4" />
                    <p>Aucune commande trouvée pour "{searchQuery}"</p>
                  </div>
                ) : (
                  <div>
                    <Package className="mx-auto w-12 h-12 text-gray-300 mb-4" />
                    <p>Aucune commande pour le moment</p>
                    <Button 
                      onClick={onCreateNew} 
                      variant="outline" 
                      className="mt-4"
                    >
                      Créer la première commande
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <OrdersList
            orders={filteredOrders}
            onView={onViewOrder}
            onEdit={onEditOrder}
            onDelete={onDeleteOrder}
          />
        )}
      </div>
    </div>
  );
}