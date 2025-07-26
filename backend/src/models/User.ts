import mongoose, { Document } from 'mongoose';
import bcrypt from 'bcryptjs';

// Interface für Benutzer
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  age?: number;
  level: number;
  points: number;
  achievements: string[];
  dailyStreak: number;
  completedExercises: mongoose.Types.ObjectId[];
  exerciseFrequency: Map<string, number>; // Track how often each exercise was recommended/completed
  hasTheraband: boolean; // Whether user has theraband equipment available
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
    achievements: {
      type: [String],
      default: [],
    },
    dailyStreak: {
      type: Number,
      default: 0,
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
