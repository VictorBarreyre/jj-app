import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { AuthPage } from './pages/AuthPage'
import { ResetPasswordForm } from './components/auth/ResetPasswordForm'
import { Header } from './components/layout/Header'
import { FloatingLogoutButton } from './components/layout/FloatingLogoutButton'
import { Home } from './pages/Home'
import { MeasurementFormPage } from './pages/MeasurementFormPage'
import { StockManagement } from './pages/StockManagement'
import { MeasurementForm as MeasurementFormType } from './types/measurement-form'
import { RentalContract } from './types/rental-contract'
import { Order } from './types/order'
import { GroupRentalInfo } from './types/group-rental'
import { rentalContractApi } from './services/rental-contract.api'
import { useOrder, useSaveDraft } from './hooks/useOrders'
import './App.css'

type AppView = 'home' | 'measurement' | 'stock' | 'view-order' | 'edit-order';

function App() {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editParams, setEditParams] = useState<{
    editMode: boolean;
    orderId?: string;
    itemId?: string;
  }>({ editMode: false });

  // Détection des paramètres d'URL pour le mode édition
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const editMode = urlParams.get('editMode') === 'true';
    const orderId = urlParams.get('orderId');
    const itemId = urlParams.get('itemId');

    if (editMode && orderId) {
      setEditParams({ editMode, orderId, itemId: itemId || undefined });
      setCurrentView('measurement');
      
      // Nettoyer l'URL après avoir extrait les paramètres
      const newUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, []);

  // Hook pour charger les données de la commande en mode édition
  const { data: orderData } = useOrder(editParams.editMode && editParams.orderId ? editParams.orderId : '');
  
  // Hook pour sauvegarder en brouillon
  const saveDraftMutation = useSaveDraft();

  // Fonction pour convertir Order vers GroupRentalInfo (pour les étapes 1 et 2)
  const convertOrderToGroup = (order: Order): Partial<GroupRentalInfo> => {
    console.log('🔍 convertOrderToGroup - order:', order);
    console.log('🔍 convertOrderToGroup - order.tenue:', order.tenue);
    console.log('🔍 convertOrderToGroup - order.groupDetails:', order.groupDetails);

    let clients = [];

    // Si on a des groupDetails sauvegardés, les utiliser pour reconstituer les participants
    if (order.groupDetails?.participants && order.groupDetails.participants.length > 0) {
      clients = order.groupDetails.participants.map(participant => ({
        nom: participant.nom,
        prenom: participant.prenom,
        telephone: order.client.telephone, // Le téléphone principal du groupe
        email: order.client.email, // L'email principal du groupe
        tenue: participant.tenue || {}, // Utiliser la tenue sauvegardée
        notes: participant.notes || '',
        isExistingClient: true,
        clientId: `group-${participant.nom.toLowerCase().replace(/\s+/g, '-')}`
      }));
    } else {
      // Fallback : utiliser la tenue sauvegardée dans le contrat ou reconstruire depuis items
      let tenue: any = {};

      // Priorité 1 : utiliser la tenue directement si elle existe
      if (order.tenue && Object.keys(order.tenue).length > 0) {
        tenue = order.tenue;
      }
      // Priorité 2 : reconstruire depuis items (ancien comportement)
      else if (order.items && order.items.length > 0) {
        order.items.forEach(item => {
          const category = item.category;
          if (category === 'veste' || category === 'gilet' || category === 'pantalon' || category === 'ceinture') {
            tenue[category] = {
              reference: item.reference,
              taille: item.measurements?.taille || item.measurements?.pointure || '50',
              longueur: item.measurements?.longueur,
              longueurManche: item.measurements?.manches,
              couleur: item.measurements?.couleur || '',
              notes: item.notes || ''
            };
          } else if (category === 'chapeau') {
            tenue.tailleChapeau = item.measurements?.taille || '56';
          } else if (category === 'chaussures') {
            tenue.tailleChaussures = item.measurements?.pointure || item.measurements?.taille || '42';
          }
        });
      }

      clients = [{
        nom: order.client.nom,
        prenom: order.client.prenom,
        telephone: order.client.telephone,
        email: order.client.email,
        tenue: tenue,
        notes: order.notes || '',
        isExistingClient: true,
        clientId: order.client.id
      }];
    }

    const result = {
      groupName: order.type === 'groupe' ? `Groupe ${order.client.nom}` : order.client.nom,
      telephone: order.client.telephone || '',
      email: order.client.email || '',
      dateEssai: typeof order.dateLivraison === 'string' ? new Date(order.dateLivraison) : order.dateLivraison || new Date(),
      vendeur: order.createdBy || 'N/A',
      clients: clients,
      groupNotes: order.notes || '',
      status: 'brouillon'
    };

    console.log('🔍 convertOrderToGroup - result.clients[0].tenue:', result.clients?.[0]?.tenue);

    return result;
  };

  // Fonction pour convertir Order vers RentalContract (pour l'étape 3)
  const convertOrderToContract = (order: Order): Partial<RentalContract> => {
    // Convertir les items en tenue avec tailles par défaut
    const tenue: any = {};
    order.items?.forEach(item => {
      const category = item.category;
      if (category === 'veste' || category === 'gilet' || category === 'pantalon' || category === 'chapeau' || category === 'chaussures') {
        tenue[category] = {
          reference: item.reference,
          taille: item.measurements?.taille || '50', // Valeur par défaut pour éviter l'erreur
          couleur: item.notes || '',
          notes: item.notes || ''
        };
      }
    });

    return {
      id: order.id,
      numero: order.numero,
      dateCreation: typeof order.dateCreation === 'string' ? new Date(order.dateCreation) : order.dateCreation,
      dateEvenement: typeof order.dateLivraison === 'string' ? new Date(order.dateLivraison) : order.dateLivraison,
      dateRetrait: typeof order.dateRetrait === 'string' ? new Date(order.dateRetrait) : order.dateRetrait,
      dateRetour: typeof order.dateRetour === 'string' ? new Date(order.dateRetour) : order.dateRetour,
      client: {
        nom: order.client.nom,
        prenom: order.client.prenom || '',
        telephone: order.client.telephone,
        email: order.client.email,
        adresse: order.client.adresse
      },
      vendeur: order.createdBy || 'N/A',
      tarifLocation: order.total || undefined,
      depotGarantie: order.depotGarantie || 400,
      arrhes: order.arrhes || 50,
      paiementArrhes: {
        amount: order.arrhes || 50 // Champ requis pour éviter l'erreur
      },
      notes: order.notes,
      tenue: tenue,
      articlesStock: order.items?.map(item => ({
        stockItemId: item.id,
        reference: item.reference,
        taille: item.measurements?.taille || '',
        couleur: item.notes || '',
        quantiteReservee: item.quantity,
        prix: item.unitPrice || 0
      })),
      status: order.status || 'brouillon',
      rendu: order.rendu || false,
      
      // Informations de groupe si disponibles
      isGroup: order.type === 'groupe',
      participantCount: order.participantCount || (order.type === 'groupe' ? 1 : undefined),
      groupDetails: order.groupDetails
    };
  };

  const handleRentalSubmitComplete = async (groupData: GroupRentalInfo, contract: Omit<RentalContract, 'id' | 'numero' | 'createdAt' | 'updatedAt'>) => {
    try {
      console.log('🔍 handleRentalSubmitComplete - contract.client:', contract.client);

      if (editParams.editMode && editParams.orderId) {
        // Mode édition : mettre à jour la commande existante
        const contractData = {
          ...contract,
          // Filtrer les articlesStock vides (ceux sans reference)
          articlesStock: contract.articlesStock?.filter(item => item.reference && item.reference.trim() !== '') || [],
          status: 'confirme' as const,
          isGroup: groupData.clients.length > 1,
          participantCount: groupData.clients.length,
          groupDetails: groupData.clients.length > 1 ? {
            participants: groupData.clients.map(client => {
              const pieces = [];

              // Veste
              if (client.tenue.veste) {
                const taille = client.tenue.veste.taille ? ` - Taille ${client.tenue.veste.taille}` : ' - Taille non spécifiée';
                const longueurManche = client.tenue.veste.longueurManche ? ` - LM ${client.tenue.veste.longueurManche}cm` : '';
                pieces.push(`Veste ${client.tenue.veste.reference}${taille}${longueurManche}`);
              }

              // Gilet
              if (client.tenue.gilet) {
                const taille = client.tenue.gilet.taille ? ` - Taille ${client.tenue.gilet.taille}` : ' - Taille non spécifiée';
                pieces.push(`Gilet ${client.tenue.gilet.reference}${taille}`);
              }

              // Pantalon
              if (client.tenue.pantalon) {
                const taille = client.tenue.pantalon.taille ? ` - Taille ${client.tenue.pantalon.taille}` : ' - Taille non spécifiée';
                const longueur = client.tenue.pantalon.longueur ? ` - Longueur ${client.tenue.pantalon.longueur}cm` : '';
                pieces.push(`Pantalon ${client.tenue.pantalon.reference}${taille}${longueur}`);
              }

              // Ceinture
              if (client.tenue.ceinture) {
                const taille = client.tenue.ceinture.taille ? ` - Taille ${client.tenue.ceinture.taille}` : ' - Taille non spécifiée';
                pieces.push(`Ceinture ${client.tenue.ceinture.reference}${taille}`);
              }

              // Chapeau
              if (client.tenue.tailleChapeau) {
                pieces.push(`Chapeau - Taille ${client.tenue.tailleChapeau}`);
              }

              // Chaussures
              if (client.tenue.tailleChaussures) {
                pieces.push(`Chaussures - Pointure ${client.tenue.tailleChaussures}`);
              }

              return {
                nom: client.nom,
                prenom: client.prenom,
                tenue: client.tenue,
                pieces: pieces,
                notes: client.notes
              };
            })
          } : undefined
        };

        console.log('📤 Envoi au backend (UPDATE) - contractData.client:', contractData.client);
        const updatedContract = await rentalContractApi.update(editParams.orderId, contractData);

        // Proposer de générer le PDF immédiatement
        const shouldGeneratePDF = confirm(`Bon de location #${updatedContract.numero} mis à jour avec succès !\n\nVoulez-vous générer le PDF maintenant ?`);

        if (shouldGeneratePDF) {
          // Importer dynamiquement le service PDF
          const { PDFService } = await import('./services/pdfService');
          try {
            PDFService.generatePDF(updatedContract as any, 'vendeur');
          } catch (error) {
            console.error('Erreur lors de la génération du PDF:', error);
            alert('Erreur lors de la génération du PDF.');
          }
        }

        // Réinitialiser les paramètres d'édition et retourner à l'accueil
        setEditParams({ editMode: false });
        setCurrentView('home');
      } else {
        // Mode création : créer une nouvelle commande
        const contractData = {
          ...contract,
          status: 'confirme' as const,
          isGroup: groupData.clients.length > 1,
          participantCount: groupData.clients.length,
          groupDetails: groupData.clients.length > 1 ? {
            participants: groupData.clients.map(client => {
              const pieces = [];
              
              // Veste
              if (client.tenue.veste) {
                const taille = client.tenue.veste.taille ? ` - Taille ${client.tenue.veste.taille}` : ' - Taille non spécifiée';
                const longueurManche = client.tenue.veste.longueurManche ? ` - LM ${client.tenue.veste.longueurManche}cm` : '';
                pieces.push(`Veste ${client.tenue.veste.reference}${taille}${longueurManche}`);
              }
              
              // Gilet
              if (client.tenue.gilet) {
                const taille = client.tenue.gilet.taille ? ` - Taille ${client.tenue.gilet.taille}` : ' - Taille non spécifiée';
                pieces.push(`Gilet ${client.tenue.gilet.reference}${taille}`);
              }
              
              // Pantalon
              if (client.tenue.pantalon) {
                const taille = client.tenue.pantalon.taille ? ` - Taille ${client.tenue.pantalon.taille}` : ' - Taille non spécifiée';
                const longueur = client.tenue.pantalon.longueur ? ` - Longueur ${client.tenue.pantalon.longueur}cm` : '';
                pieces.push(`Pantalon ${client.tenue.pantalon.reference}${taille}${longueur}`);
              }
              
              // Ceinture
              if (client.tenue.ceinture) {
                const taille = client.tenue.ceinture.taille ? ` - Taille ${client.tenue.ceinture.taille}` : ' - Taille non spécifiée';
                pieces.push(`Ceinture ${client.tenue.ceinture.reference}${taille}`);
              }
              
              // Chapeau
              if (client.tenue.tailleChapeau) {
                pieces.push(`Chapeau - Taille ${client.tenue.tailleChapeau}`);
              }
              
              // Chaussures
              if (client.tenue.tailleChaussures) {
                pieces.push(`Chaussures - Pointure ${client.tenue.tailleChaussures}`);
              }
              
              return {
                nom: client.nom,
                prenom: client.prenom,
                tenue: client.tenue,
                pieces: pieces,
                notes: client.notes
              };
            })
          } : undefined
        };

        console.log('📤 Envoi au backend (CREATE) - contractData.client:', contractData.client);
        const createdContract = await rentalContractApi.create(contractData);

        // Proposer de générer le PDF immédiatement
        const shouldGeneratePDF = confirm(`Bon de location #${createdContract.numero} créé avec succès !\n\nVoulez-vous générer le PDF maintenant ?`);

        if (shouldGeneratePDF) {
          // Importer dynamiquement le service PDF
          const { PDFService } = await import('./services/pdfService');
          try {
            PDFService.generatePDF(createdContract as any, 'vendeur');
          } catch (error) {
            console.error('Erreur lors de la génération du PDF:', error);
            alert('Erreur lors de la génération du PDF.');
          }
        }

        setCurrentView('home');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du contrat:', error);
      alert('Erreur lors de la sauvegarde du bon de location. Veuillez réessayer.');
    }
  };

  const handleRentalSaveDraft = async (groupData?: GroupRentalInfo, contract?: Partial<RentalContract>, forceStatus?: 'brouillon' | 'livree' | null) => {
    if (!groupData && !contract) {
      console.warn('Données manquantes pour la sauvegarde');
      return;
    }

    try {
      // Vérifier si on est en mode édition
      const existingDraftId = editParams.editMode && editParams.orderId ? editParams.orderId : undefined;

      // Déterminer le statut à utiliser
      let statusToUse: string;
      if (forceStatus) {
        // Si forceStatus est défini, l'utiliser ('brouillon' ou 'livree')
        statusToUse = forceStatus;
      } else if (existingDraftId) {
        // En mode édition sans forceStatus, conserver le statut existant
        statusToUse = contract?.status || selectedOrder?.status || 'brouillon';
      } else {
        // Nouvelle création sans forceStatus
        statusToUse = 'brouillon';
      }

      console.log('🔍 handleRentalSaveDraft - forceStatus:', forceStatus, 'statusToUse:', statusToUse);

      // Helper pour convertir une date string ou Date en objet Date
      const toDate = (value: string | Date | undefined, fallback: Date): Date => {
        if (!value) return fallback;
        if (value instanceof Date) return value;
        return new Date(value);
      };

      // Convertir les données vers le format de contrat
      const contractData = {
        dateCreation: new Date(),
        dateEvenement: toDate(contract?.dateEvenement, new Date()),
        dateRetrait: toDate(contract?.dateRetrait, new Date()),
        dateRetour: toDate(contract?.dateRetour, new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)),
        client: {
          nom: groupData?.clients?.[0]?.nom || '',
          prenom: groupData?.clients?.[0]?.prenom || '',
          telephone: groupData?.telephone || '',
          email: groupData?.email || ''
        },
        vendeur: groupData?.vendeur || 'N/A',
        tarifLocation: contract?.tarifLocation || undefined,
        depotGarantie: contract?.depotGarantie || 400,
        arrhes: contract?.arrhes || 50,
        paiementArrhes: contract?.paiementArrhes,
        paiementSolde: contract?.paiementSolde,
        paiementDepotGarantie: contract?.paiementDepotGarantie,
        // Filtrer les articlesStock vides (ceux sans reference)
        articlesStock: contract?.articlesStock?.filter(item => item.reference && item.reference.trim() !== '') || [],
        notes: contract?.notes || groupData?.groupNotes || '',
        tenue: groupData?.clients?.[0]?.tenue || {},
        status: statusToUse,
        rendu: contract?.rendu ?? (existingDraftId && selectedOrder ? selectedOrder.rendu : false),
        type: groupData?.clients?.length && groupData.clients.length > 1 ? 'groupe' : 'individuel',
        participantCount: groupData?.clients?.length || 1,
        groupDetails: groupData?.clients && groupData.clients.length > 1 ? {
          participants: groupData.clients.map(client => ({
            nom: client.nom,
            prenom: client.prenom,
            tenue: client.tenue,
            pieces: [], // Sera calculé par le backend
            notes: client.notes
          }))
        } : undefined
      };

      // Passer l'ID et forceStatus au mutation
      await saveDraftMutation.mutateAsync({ id: existingDraftId, data: contractData, forceStatus });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handlePrint = (contractId: string, type: 'jj' | 'client') => {
    alert(`Impression ${type} lancée !`);
  };

  const handleCreateNew = () => {
    // Réinitialiser les paramètres d'édition quand on crée une nouvelle commande
    setEditParams({ editMode: false });
    setCurrentView('measurement');
  };

  const handleNavigateHome = () => {
    setCurrentView('home');
    setSelectedOrder(null);
  };

  const handleNavigateMeasurement = () => {
    setCurrentView('measurement');
  };

  const handleNavigateStock = () => {
    setCurrentView('stock');
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    alert(`Affichage de la commande #${order.numero}`);
  };

  const handleEditOrder = (order: Order) => {
    setSelectedOrder(order);
    setEditParams({ 
      editMode: true, 
      orderId: order.id, 
      itemId: undefined 
    });
    
    const convertedContract = convertOrderToContract(order);
    
    setCurrentView('measurement');
  };

  // handleDeleteOrder est maintenant géré dans le composant Home

  return (
    <AuthProvider>
      <Routes>
        {/* Routes publiques */}
        <Route path="/login" element={<AuthPage />} />
        <Route path="/reset-password" element={<ResetPasswordForm />} />

        {/* Routes protégées */}
        <Route path="/*" element={
          <ProtectedRoute>
            <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
              <Header
                currentView={currentView}
                onNavigateHome={handleNavigateHome}
                onNavigateMeasurement={handleNavigateMeasurement}
                onNavigateStock={handleNavigateStock}
                ordersCount={0}
                pendingOrdersCount={0}
              />

              <main>
                {currentView === 'home' && (
                  <Home
                    onCreateNew={handleCreateNew}
                    onViewOrder={handleViewOrder}
                    onEditOrder={handleEditOrder}
                  />
                )}

                {currentView === 'measurement' && (
                  <MeasurementFormPage
                    onSubmitComplete={handleRentalSubmitComplete}
                    onSaveDraft={handleRentalSaveDraft}
                    onPrint={handlePrint}
                    isEditMode={editParams.editMode}
                    initialGroup={(() => {
                      const group = editParams.editMode && selectedOrder ? convertOrderToGroup(selectedOrder) : undefined;
                      return group;
                    })()}
                    initialContract={(() => {
                      const contract = editParams.editMode && selectedOrder ? convertOrderToContract(selectedOrder) : undefined;
                      console.log('🔍 App.tsx - selectedOrder for edit:', selectedOrder);
                      console.log('🔍 App.tsx - selectedOrder.paiementArrhes:', selectedOrder?.paiementArrhes);
                      console.log('🔍 App.tsx - converted contract.paiementArrhes:', contract?.paiementArrhes);
                      return contract;
                    })()}
                  />
                )}

                {currentView === 'stock' && (
                  <StockManagement />
                )}
              </main>
            </div>
            <FloatingLogoutButton />
          </ProtectedRoute>
        } />
      </Routes>
      <Toaster position="top-right" />
    </AuthProvider>
  )
}

export default App