import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import userRoutes from './routes/userRoutes';
import exerciseRoutes from './routes/exerciseRoutes';
import progressRoutes from './routes/progressRoutes';
import analyticsRoutes from './routes/analyticsRoutes';

// Umgebungsvariablen laden
dotenv.config();

// Express-App erstellen
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routen
app.use('/api/users', userRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/analytics', analyticsRoutes);

// Basisroute für API-Test
app.get('/', (req: Request, res: Response) => {
  res.send('Willkommen zur aboelo-fitness API');
});

// MongoDB-Verbindung
const connectDB = async () => {
  try {
    console.log('🔌 [DEBUG] Verbinde mit MongoDB...');
    
    const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoURI) {
      throw new Error('MONGODB_URI or MONGO_URI environment variable is not set');
    }
    
    console.log('📡 [DEBUG] MongoDB URI gefunden:', mongoURI.substring(0, 50) + '...');
    
    await mongoose.connect(mongoURI);
    console.log('✅ [DEBUG] MongoDB-Verbindung erfolgreich hergestellt');
    
    // Teste die Verbindung durch Abfrage der Collections
    if (mongoose.connection.db) {
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log('📚 [DEBUG] Verfügbare Collections:', collections.map(c => c.name));
      
      // Teste die Exercise Collection
      try {
        const exerciseCount = await mongoose.connection.db.collection('exercises').countDocuments();
        console.log(`💪 [DEBUG] Anzahl Übungen in der Datenbank: ${exerciseCount}`);
      } catch (error) {
        console.log('⚠️ [DEBUG] Exercise Collection nicht gefunden oder leer');
      }
      
      // Teste die User Collection
      try {
        const userCount = await mongoose.connection.db.collection('users').countDocuments();
        console.log(`👥 [DEBUG] Anzahl Benutzer in der Datenbank: ${userCount}`);
      } catch (error) {
        console.log('⚠️ [DEBUG] User Collection nicht gefunden oder leer');
      }
    } else {
      console.log('⚠️ [DEBUG] Datenbankverbindung nicht verfügbar für Tests');
    }
    
  } catch (error) {
    console.error('❌ [DEBUG] MongoDB-Verbindungsfehler:', error);
    process.exit(1);
  }
};

// Server starten
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server läuft auf Port ${PORT}`);
  });
});
