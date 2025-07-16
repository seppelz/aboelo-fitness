import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

interface JwtPayload {
  id: string;
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token;

  // Token aus dem Authorization Header auslesen
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Token extrahieren
      token = req.headers.authorization.split(' ')[1];

      // Token verifizieren
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'geheimnis') as JwtPayload;

      // Benutzer aus der Datenbank abrufen (ohne Passwort)
      (req as any).user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Nicht autorisiert, Token ungültig' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Nicht autorisiert, kein Token' });
  }
};

// Admin-Middleware
export const admin = (req: Request, res: Response, next: NextFunction) => {
  if ((req as any).user && (req as any).user.isAdmin) {
    next();
  } else {
    res.status(401).json({ message: 'Nicht autorisiert als Admin' });
  }
};
