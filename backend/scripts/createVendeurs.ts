import mongoose from 'mongoose';
import { UserModel } from '../models/User';
import { connectDB } from '../config/database';

const vendeurs = [
  { nom: 'Sophie', prenom: 'Sophie', email: 'sophie@jjceremonie.fr', password: 'Sophie123!' },
  { nom: 'Olivier', prenom: 'Olivier', email: 'olivier@jjceremonie.fr', password: 'Olivier123!' },
  { nom: 'Laurent', prenom: 'Laurent', email: 'laurent@jjceremonie.fr', password: 'Laurent123!' },
  { nom: 'Alexis', prenom: 'Alexis', email: 'alexis@jjceremonie.fr', password: 'Alexis123!' },
  { nom: 'Mael', prenom: 'Mael', email: 'mael@jjceremonie.fr', password: 'Mael123!' }
];

async function createVendeurs() {
  try {
    await connectDB();
    console.log('✅ Connexion à MongoDB réussie');

    for (const vendeurData of vendeurs) {
      try {
        // Vérifier si l'utilisateur existe déjà
        const existingUser = await UserModel.findOne({ email: vendeurData.email });
        
        if (existingUser) {
          console.log(`⚠️  L'utilisateur ${vendeurData.email} existe déjà`);
          continue;
        }

        // Créer le nouvel utilisateur
        const newUser = new UserModel({
          ...vendeurData,
          role: 'vendeur'
        });

        await newUser.save();
        console.log(`✅ Vendeur créé: ${vendeurData.prenom} (${vendeurData.email})`);
      } catch (error) {
        console.error(`❌ Erreur lors de la création de ${vendeurData.email}:`, error);
      }
    }

    console.log('\n🎉 Script de création des vendeurs terminé');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la connexion à MongoDB:', error);
    process.exit(1);
  }
}

// Exécuter le script
createVendeurs();