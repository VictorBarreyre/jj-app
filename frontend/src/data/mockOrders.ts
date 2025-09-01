import { Order } from '@/types/order';

export const mockOrders: Order[] = [
  {
    id: '1',
    numero: '2025-001',
    client: {
      id: '1',
      nom: 'Dupont',
      prenom: 'Jean',
      telephone: '06 12 34 56 78',
      email: 'jean.dupont@email.com',
      adresse: {
        rue: '123 rue de la Paix',
        ville: 'Paris',
        codePostal: '75001',
        pays: 'France'
      }
    },
    dateCreation: new Date('2025-01-15'),
    dateLivraison: new Date('2025-02-15'),
    items: [
      {
        id: 'item-1',
        category: 'veste',
        reference: 'Smoking noir châle',
        measurements: {
          longueur: 72,
          poitrine: 102,
          taille: 88,
          epaules: 44,
          manches: 62
        },
        quantity: 1,
        unitPrice: 150,
        totalPrice: 150
      }
    ],
    sousTotal: 150,
    tva: 30,
    total: 180,
    status: 'commandee',
    notes: 'Client préfère les manches un peu plus longues',
    createdBy: 'Alexis',
    updatedAt: new Date('2025-01-15')
  },
  {
    id: '2',
    numero: '2025-002',
    client: {
      id: '2',
      nom: 'Martin',
      prenom: 'Pierre',
      telephone: '06 98 76 54 32',
      email: 'pierre.martin@email.com'
    },
    dateCreation: new Date('2025-01-16'),
    dateLivraison: new Date('2025-02-20'),
    items: [
      {
        id: 'item-2',
        category: 'veste',
        reference: 'Costume bleu',
        measurements: {
          longueur: 74,
          poitrine: 106,
          taille: 92
        },
        quantity: 1,
        unitPrice: 120,
        totalPrice: 120
      },
      {
        id: 'item-3',
        category: 'pantalon',
        reference: 'Bleu ville',
        measurements: {
          taille: 92,
          longueur: 108,
          entrejambe: 82
        },
        quantity: 1,
        unitPrice: 80,
        totalPrice: 80
      }
    ],
    sousTotal: 200,
    tva: 40,
    total: 240,
    status: 'livree',
    notes: 'Mariage le 22 février - urgent',
    createdBy: 'Mael',
    updatedAt: new Date('2025-01-17')
  },
  {
    id: '3',
    numero: '2025-003',
    client: {
      id: '3',
      nom: 'Bernard',
      prenom: 'Sophie',
      telephone: '06 11 22 33 44',
      email: 'sophie.bernard@email.com'
    },
    dateCreation: new Date('2025-01-18'),
    items: [
      {
        id: 'item-4',
        category: 'veste',
        reference: 'Jaquette FFF',
        measurements: {
          longueur: 68,
          poitrine: 96
        },
        quantity: 1,
        unitPrice: 180,
        totalPrice: 180
      }
    ],
    sousTotal: 180,
    total: 180,
    status: 'commandee',
    notes: '',
    createdBy: 'Olivier',
    updatedAt: new Date('2025-01-18')
  },
  {
    id: '4',
    numero: '2025-004',
    client: {
      id: '4',
      nom: 'Durand',
      prenom: 'Michel',
      telephone: '06 55 44 33 22'
    },
    dateCreation: new Date('2025-01-20'),
    dateLivraison: new Date('2025-03-01'),
    items: [
      {
        id: 'item-5',
        category: 'veste',
        reference: 'Habit noir',
        measurements: {
          longueur: 76,
          poitrine: 110,
          taille: 96
        },
        quantity: 1,
        unitPrice: 200,
        totalPrice: 200
      }
    ],
    sousTotal: 200,
    tva: 40,
    total: 240,
    status: 'livree',
    createdBy: 'Sophie',
    updatedAt: new Date('2025-01-21')
  },
  {
    id: '5',
    numero: '2025-005',
    client: {
      id: '5',
      nom: 'Lemoine',
      prenom: 'Paul',
      telephone: '06 77 88 99 00'
    },
    dateCreation: new Date('2025-01-22'),
    dateLivraison: new Date('2025-01-25'),
    items: [
      {
        id: 'item-6',
        category: 'veste',
        reference: 'Smoking bleu',
        measurements: {
          longueur: 70,
          poitrine: 98
        },
        quantity: 1,
        unitPrice: 160,
        totalPrice: 160
      }
    ],
    sousTotal: 160,
    tva: 32,
    total: 192,
    status: 'rendue',
    createdBy: 'Olivier',
    updatedAt: new Date('2025-01-25')
  }
];