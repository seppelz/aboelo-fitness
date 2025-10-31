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
      enum: ['milestone', 'streak', 'completion', 'special', 'weekly', 'daily', 'specialist', 'consistency'],
      required: true,
    },
    pointsRequired: {
      type: Number,
    },
    streakRequired: {
      type: Number,
    },
    requirements: {
      type: {
        type: String,
        enum: ['first_exercise', 'exercises_count', 'streak_days', 'points_total', 'muscle_groups', 'weekly_goal', 'perfect_week', 'daily_muscle_groups', 'muscle_specialist', 'consistency_muscle_groups', 'perfect_days', 'monthly_balance'],
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
    id: 'streak_14',
    title: 'Wochenkrieger',
    description: '14 Tage in Folge trainiert',
    icon: '⚔️',
    category: 'streak',
    requirements: { type: 'streak_days', value: 14 },
    rarity: 'epic',
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
      muscleGroups: ['Bauch', 'Po', 'Schulter', 'Brust', 'Nacken', 'Rücken'] 
    },
    rarity: 'epic',
  },
  {
    id: 'perfect_week',
    title: 'Perfekte Woche',
    description: '5 von 7 Tagen alle 6 Muskelgruppen trainiert',
    icon: '🌈',
    category: 'weekly',
    requirements: { type: 'perfect_week', days: 7, perfectDays: 5 },
    rarity: 'epic',
  },
  // Daily Muscle Group Achievements
  {
    id: 'daily_all_muscle_groups',
    title: 'Täglicher Allrounder',
    description: 'Alle 6 Muskelgruppen an einem Tag trainiert',
    icon: '🔥',
    category: 'daily',
    requirements: { 
      type: 'daily_muscle_groups', 
      muscleGroups: ['Bauch', 'Po', 'Schulter', 'Brust', 'Nacken', 'Rücken'] 
    },
    rarity: 'legendary',
  },
  {
    id: 'daily_5_muscle_groups',
    title: 'Fokus-Tag',
    description: '5 verschiedene Muskelgruppen an einem Tag trainiert',
    icon: '⭐',
    category: 'daily',
    requirements: { type: 'daily_muscle_groups', value: 5 },
    rarity: 'epic',
  },
  {
    id: 'daily_3_muscle_groups',
    title: 'Ausgewogener Tag',
    description: '3 verschiedene Muskelgruppen an einem Tag trainiert',
    icon: '🎯',
    category: 'daily',
    requirements: { type: 'daily_muscle_groups', value: 3 },
    rarity: 'rare',
  },
  {
    id: 'muscle_specialist_bauch',
    title: 'Bauch-Spezialist',
    description: '5 Bauch-Übungen an einem Tag abgeschlossen',
    icon: '💪',
    category: 'specialist',
    requirements: { type: 'muscle_specialist', muscleGroup: 'Bauch', value: 5 },
    rarity: 'rare',
  },
  {
    id: 'muscle_specialist_ruecken',
    title: 'Rücken-Spezialist',
    description: '5 Rücken-Übungen an einem Tag abgeschlossen',
    icon: '🔄',
    category: 'specialist',
    requirements: { type: 'muscle_specialist', muscleGroup: 'Rücken', value: 5 },
    rarity: 'rare',
  },
  {
    id: 'muscle_specialist_po',
    title: 'Po-Spezialist',
    description: '5 Po-Übungen an einem Tag abgeschlossen',
    icon: '🍑',
    category: 'specialist',
    requirements: { type: 'muscle_specialist', muscleGroup: 'Po', value: 5 },
    rarity: 'rare',
  },
  {
    id: 'muscle_specialist_schulter',
    title: 'Schulter-Spezialist',
    description: '5 Schulter-Übungen an einem Tag abgeschlossen',
    icon: '💪',
    category: 'specialist',
    requirements: { type: 'muscle_specialist', muscleGroup: 'Schulter', value: 5 },
    rarity: 'rare',
  },
  {
    id: 'muscle_specialist_brust',
    title: 'Brust-Spezialist',
    description: '5 Brust-Übungen an einem Tag abgeschlossen',
    icon: '🦸',
    category: 'specialist',
    requirements: { type: 'muscle_specialist', muscleGroup: 'Brust', value: 5 },
    rarity: 'rare',
  },
  {
    id: 'muscle_specialist_nacken',
    title: 'Nacken-Spezialist',
    description: '5 Nacken-Übungen an einem Tag abgeschlossen',
    icon: '🦒',
    category: 'specialist',
    requirements: { type: 'muscle_specialist', muscleGroup: 'Nacken', value: 5 },
    rarity: 'rare',
  },
  {
    id: 'consistency_champion',
    title: 'Beständigkeits-Champion',
    description: '7 Tage in Folge alle 6 Muskelgruppen trainiert',
    icon: '👑',
    category: 'consistency',
    requirements: { type: 'consistency_muscle_groups', days: 7, minMuscleGroups: 6 },
    rarity: 'legendary',
  },
  // Perfect Days Achievements - Removed duplicate 'Perfekter Tag', kept progressive achievements
  {
    id: 'balanced_month',
    title: 'Ausgewogener Monat',
    description: 'Mindestens 3 Muskelgruppen an 20 Tagen im Monat trainiert',
    icon: '⚖️',
    category: 'consistency',
    requirements: { type: 'monthly_balance', days: 30, targetDays: 20, minMuscleGroups: 3 },
    rarity: 'epic',
  },
  {
    id: 'perfect_month',
    title: 'Perfekter Monat',
    description: 'Alle 6 Muskelgruppen an 20 Tagen im Monat trainiert',
    icon: '🏅',
    category: 'consistency',
    requirements: { type: 'monthly_balance', days: 30, targetDays: 20, minMuscleGroups: 6 },
    rarity: 'legendary',
  },
  {
    id: 'perfect_days_10',
    title: 'Perfektionist',
    description: '10 Tage alle 6 Muskelgruppen trainiert',
    icon: '🌟',
    category: 'special',
    requirements: { type: 'perfect_days', value: 10 },
    rarity: 'epic',
  },
  {
    id: 'perfect_days_30',
    title: 'Meister der Balance',
    description: '30 Tage alle 6 Muskelgruppen trainiert',
    icon: '💫',
    category: 'special',
    requirements: { type: 'perfect_days', value: 30 },
    rarity: 'legendary',
  },
  {
    id: 'perfect_days_100',
    title: 'Legende der Vollständigkeit',
    description: '100 Tage alle 6 Muskelgruppen trainiert',
    icon: '🏆',
    category: 'special',
    requirements: { type: 'perfect_days', value: 100 },
    rarity: 'legendary',
  }
]; 