import mongoose, { Document } from 'mongoose';
import bcrypt from 'bcryptjs';

// Interface für User Achievement
export interface IUserAchievement {
  achievementId: string;
  unlockedAt: Date;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

// Interface für Benutzer
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  age?: number;
  level: number;
  points: number;
  achievements: IUserAchievement[];
  dailyStreak: number;
  longestStreak: number;
  lastActivityDate?: Date;
  perfectDaysCount: number; // Days when all 6 muscle groups were trained
  streakProtectionUsed?: Date; // Last time streak protection was used
  completedExercises: mongoose.Types.ObjectId[];
  exerciseFrequency: Map<string, number>; // Track how often each exercise was recommended/completed
  hasTheraband: boolean; // Whether user has theraband equipment available
  weeklyGoal: {
    exercisesTarget: number;
    currentProgress: number;
    weekStartDate: Date;
  };
  monthlyStats: {
    exercisesCompleted: number;
    pointsEarned: number;
    month: number;
    year: number;
  };
  reminderSettings: {
    enabled: boolean;
    intervalMinutes: number;
  };
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Schema für Benutzer
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Bitte geben Sie Ihren Namen ein'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Bitte geben Sie Ihre E-Mail-Adresse ein'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, 'Bitte geben Sie ein Passwort ein'],
      minlength: 6,
    },
    age: {
      type: Number,
    },
    level: {
      type: Number,
      default: 1,
    },
    points: {
      type: Number,
      default: 0,
    },
    achievements: [{
      achievementId: { type: String, required: true },
      unlockedAt: { type: Date, required: true },
      title: { type: String, required: true },
      description: { type: String, required: true },
      icon: { type: String, required: true },
      rarity: { 
        type: String, 
        enum: ['common', 'rare', 'epic', 'legendary'], 
        required: true 
      }
    }],
    dailyStreak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
    lastActivityDate: {
      type: Date,
    },
    perfectDaysCount: {
      type: Number,
      default: 0,
    },
    streakProtectionUsed: {
      type: Date,
    },
    completedExercises: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exercise',
      },
    ],
    exerciseFrequency: {
      type: Map,
      of: Number,
      default: new Map(),
    },
    hasTheraband: {
      type: Boolean,
      default: false,
    },
    weeklyGoal: {
      exercisesTarget: { type: Number, default: 5 },
      currentProgress: { type: Number, default: 0 },
      weekStartDate: { type: Date, default: Date.now }
    },
    monthlyStats: {
      exercisesCompleted: { type: Number, default: 0 },
      pointsEarned: { type: Number, default: 0 },
      month: { type: Number, default: () => new Date().getMonth() },
      year: { type: Number, default: () => new Date().getFullYear() }
    },
    reminderSettings: {
      enabled: { type: Boolean, default: true },
      intervalMinutes: { type: Number, default: 60 }
    }
  },
  {
    timestamps: true,
  }
);

// Passwort vor dem Speichern hashen
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Methode zum Vergleichen von Passwörtern
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', userSchema);

