import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import crypto from 'crypto';
import User, { IUser } from '../models/User';
import Progress from '../models/Progress';
import { jwtConfig } from '../config/env';
import { clearAuthCookie, setAuthCookie } from '../utils/authCookies';
import { sendPasswordResetEmail } from '../services/emailService';

// JWT Token generieren
const generateToken = (id: string) => {
  return jwt.sign({ id }, jwtConfig.secret, {
    expiresIn: jwtConfig.expiresIn,
  });
};

const PASSWORD_RESET_EXPIRATION_MS = 60 * 60 * 1000;

export const requestPasswordReset = async (req: Request, res: Response) => {
  const { email } = req.body;
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

  try {
    if (!normalizedEmail) {
      return res.status(400).json({
        success: false,
        message: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.',
      });
    }

    const user = await User.findOne({ email: normalizedEmail });

    if (user) {
      console.info('[requestPasswordReset] Benutzer gefunden, erstelle Reset-Token für:', user.email);
      const resetToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

      user.passwordResetToken = hashedToken;
      user.passwordResetExpires = new Date(Date.now() + PASSWORD_RESET_EXPIRATION_MS);

      await user.save({ validateBeforeSave: false });
      console.info('[requestPasswordReset] Reset-Token in Datenbank gespeichert');

      try {
        console.info('[requestPasswordReset] Versuche E-Mail zu senden...');
        await sendPasswordResetEmail(user.email, resetToken);
        console.info('[requestPasswordReset] E-Mail erfolgreich versendet');
      } catch (emailError: any) {
        console.error('[requestPasswordReset] ❌ FEHLER beim E-Mail-Versand');
        console.error('[requestPasswordReset] Error type:', emailError?.constructor?.name);
        console.error('[requestPasswordReset] Error message:', emailError?.message);
        console.error('[requestPasswordReset] Error stack:', emailError?.stack);
        
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
        console.error('[requestPasswordReset] Reset-Token aus Datenbank entfernt wegen E-Mail-Fehler');
        
        // Important: Don't reveal to user that email failed (security)
        // But log it extensively for debugging
      }
    } else {
      console.info('[requestPasswordReset] Kein Benutzer mit dieser E-Mail gefunden:', normalizedEmail);
    }

    res.status(200).json({
      success: true,
      message: 'Falls ein Konto gefunden wurde, wurde eine E-Mail zum Zurücksetzen versendet.',
    });
  } catch (error: any) {
    console.error('Passwort-Reset-Anfrage fehlgeschlagen:', error);
    res.status(500).json({
      success: false,
      message: 'Serverfehler bei der Passwort-Reset-Anfrage',
    });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token, password } = req.body;

  try {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Reset-Token ist ungültig oder abgelaufen.',
      });
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    const refreshedToken = generateToken(formatObjectId(user._id) ?? '');
    setAuthCookie(res, refreshedToken);

    res.status(200).json({
      success: true,
      user: formatUserResponse(user as IUser),
    });
  } catch (error: any) {
    console.error('Passwort-Zurücksetzung fehlgeschlagen:', error);
    res.status(500).json({
      success: false,
      message: 'Serverfehler bei der Passwort-Zurücksetzung',
    });
  }
};

export const logoutUser = async (_req: Request, res: Response) => {
  clearAuthCookie(res);

  res.status(200).json({
    success: true,
    message: 'Abmeldung erfolgreich',
  });
};

const formatObjectId = (value: mongoose.Types.ObjectId | string | undefined | null): string | undefined => {
  if (!value) {
    return undefined;
  }
  if (value instanceof mongoose.Types.ObjectId) {
    return value.toString();
  }
  if (typeof value === 'object' && 'toString' in value) {
    return (value as any).toString();
  }
  return String(value);
};

const formatUserResponse = (user: IUser) => ({
  _id: formatObjectId(user._id) ?? '',
  name: user.name,
  email: user.email,
  age: user.age,
  level: user.level,
  points: user.points,
  role: user.role || 'user',
  achievements: user.achievements,
  dailyStreak: user.dailyStreak,
  longestStreak: user.longestStreak,
  lastActivityDate: user.lastActivityDate,
  perfectDaysCount: user.perfectDaysCount,
  streakProtectionUsed: user.streakProtectionUsed,
  completedExercises: Array.isArray(user.completedExercises)
    ? user.completedExercises
        .map(exerciseId => formatObjectId(exerciseId as any))
        .filter((id): id is string => typeof id === 'string')
    : [],
  hasTheraband: user.hasTheraband,
  weeklyGoal: user.weeklyGoal,
  monthlyStats: user.monthlyStats,
  reminderSettings: user.reminderSettings || { enabled: true, intervalMinutes: 60 },
});

// Benutzer registrieren
export const registerUser = async (req: Request, res: Response) => {
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
    if (passwordConfirmation && password !== passwordConfirmation) {
      return res.status(400).json({
        success: false,
        message: 'Die Passwörter stimmen nicht überein',
      });
    }

    // Überprüfen, ob die Nutzungsbedingungen akzeptiert wurden
    if (acceptTerms !== undefined && !acceptTerms) {
      return res.status(400).json({
        success: false,
        message: 'Bitte akzeptieren Sie die Nutzungsbedingungen',
      });
    }

    // Neuen Benutzer erstellen
    const user = await User.create({
      name,
      email,
      password,
      age,
      role: 'user',
    });

    if (user) {
      const token = generateToken(formatObjectId(user._id) ?? '');
      setAuthCookie(res, token);

      res.status(201).json({
        success: true,
        user: formatUserResponse(user),
      });
    } else {
      res.status(400).json({ 
        success: false,
        message: 'Ungültige Benutzerdaten' 
      });
    }
  } catch (error: any) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Benutzer anmelden
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Überprüfen, ob E-Mail und Passwort eingegeben wurden
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Bitte geben Sie E-Mail und Passwort ein',
      });
    }

    // Benutzer in der Datenbank suchen
    const user = await User.findOne({ email });

    // Prüfen, ob Benutzer existiert und das Passwort korrekt ist
    if (user && (await user.comparePassword(password))) {
      const token = generateToken(user._id.toString());
      setAuthCookie(res, token);

      res.status(200).json({
        success: true,
        user: formatUserResponse(user),
      });
    } else {
      res.status(401).json({ 
        success: false,
        message: 'Ungültige E-Mail oder Passwort' 
      });
    }
  } catch (error: any) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Benutzerprofil abrufen
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    // req.user wird vom Authentifizierungs-Middleware gesetzt
    const user = await User.findById((req as any).user._id).select('-password');

    if (user) {
      res.json({
        success: true,
        user: formatUserResponse(user as IUser),
      });
    } else {
      res.status(404).json({ 
        success: false,
        message: 'Benutzer nicht gefunden' 
      });
    }
  } catch (error: any) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
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

      if (req.body.reminderSettings) {
        const { enabled, intervalMinutes } = req.body.reminderSettings;
        if (!user.reminderSettings) {
          user.reminderSettings = { enabled: true, intervalMinutes: 60 } as any;
        }
        if (typeof enabled === 'boolean') {
          user.reminderSettings.enabled = enabled;
        }
        if (intervalMinutes !== undefined) {
          const parsedInterval = parseInt(intervalMinutes, 10);
          if (!Number.isNaN(parsedInterval)) {
            user.reminderSettings.intervalMinutes = Math.max(1, parsedInterval);
          }
        }
      }

      // Update weekly goal
      if (req.body.weeklyGoal) {
        const { exercisesTarget } = req.body.weeklyGoal;
        if (!user.weeklyGoal) {
          user.weeklyGoal = {
            exercisesTarget: 5,
            currentProgress: 0,
            weekStartDate: new Date()
          };
        }
        if (exercisesTarget !== undefined) {
          const parsedTarget = parseInt(exercisesTarget, 10);
          if (!Number.isNaN(parsedTarget)) {
            user.weeklyGoal.exercisesTarget = Math.max(1, Math.min(50, parsedTarget));
          }
        }
      }

      const updatedUser = await user.save();

      const refreshedToken = generateToken(formatObjectId(updatedUser._id) ?? '');
      setAuthCookie(res, refreshedToken);

      res.json({
        success: true,
        user: formatUserResponse(updatedUser as unknown as IUser),
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
