import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Laden der Umgebungsvariablen
dotenv.config();

// MongoDB-Verbindungs-URI aus Umgebungsvariablen oder direkt konfiguriert
const MONGODB_URI = process.env.MONGODB_URI || 
  'mongodb+srv://sebastiansoecker:WSdj83HqSmKrv04B@cluster0.slnc9kk.mongodb.net/aboelo-fitness?retryWrites=true&w=majority';

// Verbindung zur MongoDB herstellen
const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB Verbindung erfolgreich hergestellt');
  } catch (error) {
    console.error('MongoDB Verbindungsfehler:', error);
    process.exit(1);
  }
};

export default connectDB;
