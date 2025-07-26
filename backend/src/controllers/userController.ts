import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import Progress from '../models/Progress';

// JWT Token generieren
const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'geheimnis', {
    expiresIn: '30d',
  });
};

// Benutzer registrieren
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, age } = req.body;

    // Prüfen, ob Benutzer bereits existiert
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Benutzer existiert bereits' });
    }

    // Neuen Benutzer erstellen
    const user = await User.create({
      name,
      email,
      password,
      age,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        level: user.level,
        points: user.points,
        achievements: user.achievements,
        dailyStreak: user.dailyStreak,
        hasTheraband: user.hasTheraband,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Ungültige Benutzerdaten' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Benutzer anmelden
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Benutzer in der Datenbank suchen
    const user = await User.findOne({ email });

    // Prüfen, ob Benutzer existiert und das Passwort korrekt ist
    if (user && (await user.comparePassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        level: user.level,
        points: user.points,
        achievements: user.achievements,
        dailyStreak: user.dailyStreak,
        hasTheraband: user.hasTheraband,
        token: generateToken(user._id.toString()),
      });
    } else {
      res.status(401).json({ message: 'Ungültige E-Mail oder Passwort' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Benutzerprofil abrufen
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    // req.user wird vom Authentifizierungs-Middleware gesetzt
    const user = await User.findById((req as any).user._id).select('-password');

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'Benutzer nicht gefunden' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Benutzerprofil aktualisieren
export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const user = await User.findById((req as any).user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      
      if (req.body.age) {
        user.age = req.body.age;
      }
      
      if (req.body.password) {
        user.password = req.body.password;
      }

      // Update theraband preference
      if (typeof req.body.hasTheraband === 'boolean') {
        user.hasTheraband = req.body.hasTheraband;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        age: updatedUser.age,
        level: updatedUser.level,
        points: updatedUser.points,
        achievements: updatedUser.achievements,
        dailyStreak: updatedUser.dailyStreak,
        hasTheraband: updatedUser.hasTheraband,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: 'Benutzer nicht gefunden' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Punkte und Achievements aktualisieren
export const updateUserProgress = async (req: Request, res: Response) => {
  try {
    const { points, achievement } = req.body;
    const user = await User.findById((req as any).user._id);

    if (!user) {
      return res.status(404).json({ message: 'Benutzer nicht gefunden' });
    }

    // Punkte hinzufügen und Level berechnen
    if (points) {
      user.points += points;
      
      // Level-Berechnung (einfaches Beispiel: alle 100 Punkte ein Level)
      const newLevel = Math.floor(user.points / 100) + 1;
      
      // Wenn Level-Aufstieg
      if (newLevel > user.level) {
        user.level = newLevel;
      }
    }

    // Achievement hinzufügen, falls es noch nicht existiert
    if (achievement && !user.achievements.includes(achievement)) {
      user.achievements.push(achievement);
    }

    await user.save();
    
    res.json({
      points: user.points,
      level: user.level,
      achievements: user.achievements
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Daily Streak aktualisieren
export const updateDailyStreak = async (req: Request, res: Response) => {
  try {
    const user = await User.findById((req as any).user._id);

    if (!user) {
      return res.status(404).json({ message: 'Benutzer nicht gefunden' });
    }

    // Streak erhöhen
    user.dailyStreak += 1;
    await user.save();
    
    res.json({
      dailyStreak: user.dailyStreak
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Reset user progress data (for testing/cleaning)
export const resetUserProgress = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id.toString();
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'Benutzer nicht gefunden' });
    }

    // Reset user profile data
    user.points = 0;
    user.level = 1;
    user.completedExercises = [];
    user.exerciseFrequency = new Map();
    user.dailyStreak = 0;
    user.achievements = [];

    await user.save();

    // ALSO DELETE ALL PROGRESS ENTRIES for this user
    const deleteResult = await Progress.deleteMany({ user: userId });
    
    console.log(`Reset complete: Deleted ${deleteResult.deletedCount} progress entries for user ${userId}`);
    
    res.json({
      message: 'Alle Fortschrittsdaten zurückgesetzt',
      user: {
        points: user.points,
        level: user.level,
        completedExercises: user.completedExercises,
        dailyStreak: user.dailyStreak,
        achievements: user.achievements
      },
      progressEntriesDeleted: deleteResult.deletedCount
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
