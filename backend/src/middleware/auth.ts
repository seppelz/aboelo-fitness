import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

// Interface für den Auth-Request mit User
interface AuthRequest extends Request {
  user?: any;
}

// Middleware zum Schutz von Routen
export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;

  // Token aus dem Header extrahieren
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Prüfen, ob Token vorhanden ist
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Nicht autorisiert, bitte einloggen',
    });
  }

  try {
    // Token verifizieren
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'aboelo_fitness_secret');

    // Benutzer zum Request hinzufügen
    req.user = await User.findById(decoded.id);
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Nicht autorisiert, bitte einloggen',
    });
  }
};
