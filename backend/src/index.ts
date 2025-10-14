import express, { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors, { CorsOptions } from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import csrf from 'csurf';
import fs from 'fs';
import http from 'http';
import https from 'https';
import userRoutes from './routes/userRoutes';
import exerciseRoutes from './routes/exerciseRoutes';
import progressRoutes from './routes/progressRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import adminRoutes from './routes/adminRoutes';
import { cookieConfig, csrfConfig, httpsConfig, rateLimitConfig } from './config/env';

// Umgebungsvariablen laden
dotenv.config();

// Express-App erstellen
const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

const configuredOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim()).filter(Boolean)
  : undefined;

const fallbackOrigins = process.env.NODE_ENV === 'production'
  ? []
  : ['http://localhost:3000', 'https://localhost:3000'];

const allowedOrigins = configuredOrigins && configuredOrigins.length > 0
  ? configuredOrigins
  : fallbackOrigins;

const corsOptions: CorsOptions = {
  origin: allowedOrigins.length > 0 ? allowedOrigins : false,
  credentials: allowedOrigins.length > 0,
};

app.use(cors(corsOptions));
app.use(cookieParser());

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: rateLimitConfig.general.windowMs,
  max: rateLimitConfig.general.max,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(generalLimiter);

// Body parsing
app.use(express.json({ limit: '1mb' }));

const csrfHeaderName = csrfConfig.headerName.toLowerCase();

const csrfProtection = csrf({
  cookie: {
    key: csrfConfig.secretCookieName,
    httpOnly: true,
    secure: cookieConfig.secure,
    sameSite: cookieConfig.sameSite,
    domain: cookieConfig.domain,
    path: cookieConfig.path,
    maxAge: cookieConfig.maxAgeMs,
  },
  value: (req) => {
    const header = req.headers[csrfHeaderName];
    if (typeof header === 'string') {
      return header;
    }
    if (Array.isArray(header) && header.length > 0) {
      return header[0];
    }
    return '';
  },
});

app.use(csrfProtection);

// Issue CSRF token cookie for clients
app.use((req: Request, res: Response, next: NextFunction) => {
  const csrfToken = (req as any).csrfToken ? (req as any).csrfToken() : undefined;
  if (typeof csrfToken === 'string' && csrfToken.length > 0) {
    res.cookie(csrfConfig.cookieName, csrfToken, {
      httpOnly: false,
      secure: cookieConfig.secure,
      sameSite: cookieConfig.sameSite,
      domain: cookieConfig.domain,
      path: cookieConfig.path,
      maxAge: cookieConfig.maxAgeMs,
    });
    res.locals.csrfToken = csrfToken;
  }
  next();
});

app.get('/api/auth/csrf', (req: Request, res: Response) => {
  res.status(200).json({ csrfToken: res.locals.csrfToken });
});

// Routen
app.use('/api/users', userRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);

// CSRF error handler
app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({
      success: false,
      message: 'Ungültiges CSRF-Token',
    });
  }
  return next(err);
});

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

const createServer = () => {
  if (httpsConfig.enabled) {
    if (!httpsConfig.keyPath || !httpsConfig.certPath) {
      throw new Error('HTTPS aktiviert, aber HTTPS_KEY_PATH oder HTTPS_CERT_PATH nicht gesetzt');
    }

    const options: https.ServerOptions = {
      key: fs.readFileSync(httpsConfig.keyPath, 'utf8'),
      cert: fs.readFileSync(httpsConfig.certPath, 'utf8'),
    };

    if (httpsConfig.passphrase) {
      options.passphrase = httpsConfig.passphrase;
    }

    console.log('✅ [DEBUG] HTTPS ist aktiviert');
    return https.createServer(options, app);
  }

  console.log('ℹ️  [DEBUG] HTTPS ist deaktiviert, verwende HTTP');
  return http.createServer(app);
};

const server = createServer();

// Server starten
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server läuft auf Port ${PORT}`);
  });
});
