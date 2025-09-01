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
      },
      {
        id: 'item-1b',
        category: 'chaussures',
        reference: 'Chaussures noires vernies',
        measurements: {
          pointure: '42',
          largeur: 'standard'
        },
        quantity: 1,
        unitPrice: 35,
        totalPrice: 35
      }
    ],
    sousTotal: 185,
    tva: 37,
    total: 222,
    status: 'commandee',
    type: 'individuel',
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
    type: 'individuel',
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
      },
      {
        id: 'item-3b',
        category: 'chapeau',
        reference: 'Haut-de-forme noir',
        measurements: {
          taille: '57'
        },
        quantity: 1,
        unitPrice: 45,
        totalPrice: 45
      }
    ],
    sousTotal: 225,
    total: 225,
    status: 'commandee',
    type: 'individuel',
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
    type: 'individuel',
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
    type: 'individuel',
    createdBy: 'Olivier',
    updatedAt: new Date('2025-01-25')
  },
  {
    id: '6',
    numero: '2025-006',
    client: {
      id: '6',
      nom: 'Famille Rousseau',
      prenom: 'Mariage de Paul & Marie',
      telephone: '01 23 45 67 89',
      email: 'rousseau.mariage@email.com'
    },
    dateCreation: new Date('2025-01-28'),
    dateLivraison: new Date('2025-03-15'),
    items: [
      {
        id: 'item-6a',
        category: 'veste',
        reference: 'Smoking noir châle',
        measurements: {
          longueur: 74,
          poitrine: 104,
          taille: 90,
          epaules: 45,
          manches: 64
        },
        quantity: 1,
        unitPrice: 150,
        totalPrice: 150
      },
      {
        id: 'item-6b',
        category: 'gilet',
        reference: 'Gilet Bleu',
        measurements: {
          longueur: 62,
          poitrine: 104,
          taille: 90
        },
        quantity: 3,
        unitPrice: 80,
        totalPrice: 240
      },
      {
        id: 'item-6c',
        category: 'pantalon',
        reference: 'Uni foncé',
        measurements: {
          taille: 90,
          longueur: 105,
          entrejambe: 80
        },
        quantity: 4,
        unitPrice: 60,
        totalPrice: 240
      }
    ],
    sousTotal: 630,
    tva: 126,
    total: 756,
    status: 'commandee',
    type: 'groupe',
    notes: 'Mariage - 1 marié + 3 témoins',
    createdBy: 'Alexis',
    updatedAt: new Date('2025-01-28')
  },
  {
    id: '7',
    numero: '2025-007',
    client: {
      id: '7',
      nom: 'Cérémonie Martin',
      prenom: 'Anniversaire 50 ans',
      telephone: '06 88 77 66 55',
      email: 'martin.ceremonie@email.com'
    },
    dateCreation: new Date('2025-01-30'),
    dateLivraison: new Date('2025-02-28'),
    items: [
      {
        id: 'item-7a',
        category: 'veste',
        reference: 'Costume bleu',
        measurements: {
          longueur: 72,
          poitrine: 98,
          taille: 86
        },
        quantity: 2,
        unitPrice: 120,
        totalPrice: 240
      },
      {
        id: 'item-7b',
        category: 'chapeau',
        reference: 'Chapeau melon',
        measurements: {
          taille: '56'
        },
        quantity: 2,
        unitPrice: 40,
        totalPrice: 80
      }
    ],
    sousTotal: 320,
    tva: 64,
    total: 384,
    status: 'livree',
    type: 'groupe',
    notes: 'Cérémonie familiale - 2 personnes',
    createdBy: 'Mael',
    updatedAt: new Date('2025-02-28')
  }
];