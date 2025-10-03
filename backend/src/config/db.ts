import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Laden der Umgebungsvariablen
dotenv.config();

// MongoDB-Verbindungs-URI aus Umgebungsvariablen
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/aboelo-fitness';

// Verbindung zur MongoDB herstellen
const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB Verbindung erfolgreich hergestellt');
    console.log('Datenbank:', mongoose.connection.name);
  } catch (error) {
    console.error('MongoDB Verbindungsfehler:', error);
    process.exit(1);
  }
};

export default connectDB;
