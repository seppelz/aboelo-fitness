import mongoose, { Document } from 'mongoose';

// Interface für Achievement
export interface IAchievement extends Document {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'milestone' | 'streak' | 'completion' | 'special' | 'weekly';
  pointsRequired?: number;
  exercisesRequired?: number;
  streakRequired?: number;
  requirements: {
    type: 'first_exercise' | 'exercises_count' | 'streak_days' | 'points_total' | 'muscle_groups' | 'weekly_goal' | 'perfect_week';
    value?: number;
    muscleGroups?: string[];
  };
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: Date;
}

// Schema für Achievement
const achievementSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['milestone', 'streak', 'completion', 'special', 'weekly'],
      required: true,
    },
    pointsRequired: {
      type: Number,
    },
    exercisesRequired: {
      type: Number,
    },
    streakRequired: {
      type: Number,
    },
    requirements: {
      type: {
        type: String,
        enum: ['first_exercise', 'exercises_count', 'streak_days', 'points_total', 'muscle_groups', 'weekly_goal', 'perfect_week'],
        required: true,
      },
      value: {
        type: Number,
      },
      muscleGroups: [{
        type: String,
      }],
    },
    rarity: {
      type: String,
      enum: ['common', 'rare', 'epic', 'legendary'],
      required: true,
    },
    unlockedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IAchievement>('Achievement', achievementSchema);

// Predefined achievements
export const ACHIEVEMENTS = [
  {
    id: 'first_exercise',
    title: 'Erste Schritte',
    description: 'Deine erste Übung abgeschlossen!',
    icon: '🎯',
    category: 'milestone',
    requirements: { type: 'first_exercise' },
    rarity: 'common',
  },
  {
    id: 'exercises_10',
    title: 'Durchstarter',
    description: '10 Übungen erfolgreich abgeschlossen',
    icon: '💪',
    category: 'completion',
    requirements: { type: 'exercises_count', value: 10 },
    rarity: 'common',
  },
  {
    id: 'exercises_50',
    title: 'Fleißiger Trainee',
    description: '50 Übungen erfolgreich abgeschlossen',
    icon: '🏆',
    category: 'completion',
    requirements: { type: 'exercises_count', value: 50 },
    rarity: 'rare',
  },
  {
    id: 'exercises_100',
    title: 'Fitness-Veteran',
    description: '100 Übungen erfolgreich abgeschlossen',
    icon: '👑',
    category: 'completion',
    requirements: { type: 'exercises_count', value: 100 },
    rarity: 'epic',
  },
  {
    id: 'streak_3',
    title: '3-Tage-Streak',
    description: '3 Tage in Folge trainiert',
    icon: '🔥',
    category: 'streak',
    requirements: { type: 'streak_days', value: 3 },
    rarity: 'common',
  },
  {
    id: 'streak_7',
    title: 'Wöchentlicher Champion',
    description: '7 Tage in Folge trainiert',
    icon: '⚡',
    category: 'streak',
    requirements: { type: 'streak_days', value: 7 },
    rarity: 'rare',
  },
  {
    id: 'streak_30',
    title: 'Unaufhaltsam',
    description: '30 Tage in Folge trainiert',
    icon: '🌟',
    category: 'streak',
    requirements: { type: 'streak_days', value: 30 },
    rarity: 'legendary',
  },
  {
    id: 'points_500',
    title: 'Punktesammler',
    description: '500 Punkte erreicht',
    icon: '💎',
    category: 'milestone',
    requirements: { type: 'points_total', value: 500 },
    rarity: 'rare',
  },
  {
    id: 'points_1000',
    title: 'Punktemeister',
    description: '1000 Punkte erreicht',
    icon: '💰',
    category: 'milestone',
    requirements: { type: 'points_total', value: 1000 },
    rarity: 'epic',
  },
  {
    id: 'all_muscle_groups',
    title: 'Ganzheitlicher Trainer',
    description: 'Alle Muskelgruppen trainiert',
    icon: '🎪',
    category: 'special',
    requirements: { 
      type: 'muscle_groups', 
      muscleGroups: ['Bauch', 'Beine', 'Po', 'Schulter', 'Arme', 'Brust', 'Nacken', 'Rücken'] 
    },
    rarity: 'epic',
  },
  {
    id: 'perfect_week',
    title: 'Perfekte Woche',
    description: 'Eine ganze Woche alle täglichen Ziele erreicht',
    icon: '🌈',
    category: 'weekly',
    requirements: { type: 'perfect_week' },
    rarity: 'legendary',
  }
]; 