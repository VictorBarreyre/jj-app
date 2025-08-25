import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://barreyrevictorcontact:UrxGVftvE26QBCET@cluster0.fpj3xgu.mongodb.net/jj-app?retryWrites=true&w=majority&appName=Cluster0';

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(MONGODB_URI);
    console.log(`✅ MongoDB Atlas connecté : ${conn.connection.host}`);
    console.log(`📊 Base de données: ${conn.connection.name}`);
  } catch (error) {
    console.error('❌ Erreur connexion MongoDB:', error);
    throw error; // Ne pas tuer le processus, juste propager l'erreur
  }
};

export default connectDB;