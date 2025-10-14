import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { jwtConfig } from '../config/env';
import { AUTH_COOKIE_NAME } from '../constants/auth';

interface JwtPayload {
  id: string;
}

const extractTokenFromRequest = (req: Request): string | null => {
  const cookieToken = (req as any).cookies?.[AUTH_COOKIE_NAME];
  if (typeof cookieToken === 'string' && cookieToken.length > 0) {
    return cookieToken;
  }

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring('Bearer '.length).trim();
  }

  return null;
};

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  const token = extractTokenFromRequest(req);

  if (!token) {
    return res.status(401).json({ message: 'Nicht autorisiert, kein Token' });
  }

  try {
    const decoded = jwt.verify(token, jwtConfig.secret) as JwtPayload;
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'Nicht autorisiert, Benutzer nicht gefunden' });
    }

    (req as any).user = user;
    next();
  } catch (error) {
    console.error('JWT verification failed:', error);
    res.status(401).json({ message: 'Nicht autorisiert, Token ungültig' });
  }
};

// Admin-Middleware
export const admin = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  if (user && user.role === 'admin') {
    next();
  } else {
    res.status(401).json({ message: 'Nicht autorisiert als Admin' });
  }
};
