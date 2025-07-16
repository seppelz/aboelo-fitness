import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

// Funktion zum Erstellen eines JWT Tokens
const generateToken = (id: string): string => {
  return jwt.sign({ id }, String(process.env.JWT_SECRET || 'aboelo_fitness_secret'), {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// @desc    Benutzer registrieren
// @route   POST /api/users/register
// @access  Public
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, age, acceptTerms, passwordConfirmation } = req.body;

    // Überprüfen, ob die E-Mail bereits verwendet wird
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Diese E-Mail-Adresse wird bereits verwendet',
      });
    }

    // Überprüfen, ob Passwörter übereinstimmen
    if (password !== passwordConfirmation) {
      return res.status(400).json({
        success: false,
        message: 'Die Passwörter stimmen nicht überein',
      });
    }

    // Überprüfen, ob die Nutzungsbedingungen akzeptiert wurden
    if (!acceptTerms) {
      return res.status(400).json({
        success: false,
        message: 'Bitte akzeptieren Sie die Nutzungsbedingungen',
      });
    }

    // Benutzer erstellen
    const user = await User.create({
      name,
      email,
      password,
      age,
    });

    // Token generieren und senden
    const token = generateToken(user._id);
    
    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        level: user.level,
        points: user.points,
        achievements: user.achievements,
        dailyStreak: user.dailyStreak,
      },
    });
  } catch (error) {
    console.error('Registrierungsfehler:', error);
    res.status(500).json({
      success: false,
      message: 'Serverfehler bei der Registrierung',
    });
  }
};

// @desc    Benutzer anmelden
// @route   POST /api/users/login
// @access  Public
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Überprüfen, ob E-Mail und Passwort eingegeben wurden
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Bitte geben Sie E-Mail und Passwort ein',
      });
    }

    // Benutzer suchen
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Ungültige Anmeldedaten',
      });
    }

    // Passwort überprüfen
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Ungültige Anmeldedaten',
      });
    }

    // Token generieren und senden
    const token = generateToken(user._id);
    
    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        level: user.level,
        points: user.points,
        achievements: user.achievements,
        dailyStreak: user.dailyStreak,
      },
    });
  } catch (error) {
    console.error('Anmeldungsfehler:', error);
    res.status(500).json({
      success: false,
      message: 'Serverfehler bei der Anmeldung',
    });
  }
};

// @desc    Aktuellen Benutzer abrufen
// @route   GET /api/users/me
// @access  Private
export const getMe = async (req: Request & { user?: IUser }, res: Response) => {
  try {
    const user = req.user;

    res.status(200).json({
      success: true,
      user: {
        _id: user?._id,
        name: user?.name,
        email: user?.email,
        age: user?.age,
        level: user?.level,
        points: user?.points,
        achievements: user?.achievements,
        dailyStreak: user?.dailyStreak,
      },
    });
  } catch (error) {
    console.error('Fehler beim Abrufen des Benutzerprofils:', error);
    res.status(500).json({
      success: false,
      message: 'Serverfehler beim Abrufen des Benutzerprofils',
    });
  }
};
