import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import userRoutes from './routes/userRoutes';
import exerciseRoutes from './routes/exerciseRoutes';
import progressRoutes from './routes/progressRoutes';

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

// Basisroute für API-Test
app.get('/', (req: Request, res: Response) => {
  res.send('Willkommen zur aboelo-fitness API');
});

// MongoDB-Verbindung
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb+srv://sebastiansoecker:WSdj83HqSmKrv04B@cluster0.slnc9kk.mongodb.net/aboelo-fitness?retryWrites=true&w=majority';
    await mongoose.connect(mongoURI);
    console.log('MongoDB-Verbindung hergestellt');
  } catch (error) {
    console.error('MongoDB-Verbindungsfehler:', error);
    process.exit(1);
  }
};

// Server starten
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server läuft auf Port ${PORT}`);
  });
});
