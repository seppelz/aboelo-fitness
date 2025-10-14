// Benutzertypen
export interface UserAchievement {
  achievementId: string;
  unlockedAt: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface User {
  _id: string;
  name: string;
  email: string;
  age?: number;
  role: 'admin' | 'user';
  level: number;
  points: number;
  achievements: UserAchievement[];
  dailyStreak: number;
  longestStreak: number;
  lastActivityDate?: string;
  perfectDaysCount: number;
  streakProtectionUsed?: string;
  completedExercises: string[];
  hasTheraband: boolean;
  weeklyGoal: {
    exercisesTarget: number;
    currentProgress: number;
    weekStartDate: string;
  };
  monthlyStats: {
    exercisesCompleted: number;
    pointsEarned: number;
    month: number;
    year: number;
  };
  reminderSettings?: {
    enabled: boolean;
    intervalMinutes: number;
  };
}

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  message: string;
  streakBroken: boolean;
}

export interface WeeklyGoal {
  progress: number;
  target: number;
  completed: boolean;
  message: string;
}

export interface AchievementUnlocked {
  achievement: UserAchievement;
  isNew: boolean;
}

export interface PerfectDayInfo {
  isPerfectDay: boolean;
  bonusPoints: number;
  message: string;
}

export interface GamificationData {
  achievements: AchievementUnlocked[];
  streakInfo: StreakInfo | null;
  weeklyGoal: WeeklyGoal | null;
  perfectDay: PerfectDayInfo | null;
  motivationalQuote: string;
}

export interface ProgressResponse {
  message: string;
  progress: Progress;
  pointsEarned: number;
  gamification: GamificationData;
}

// Übungstypen
export interface Exercise {
  _id: string;
  videoId: string; // ID zur Identifizierung der Übung
  name?: string;
  title?: string;
  description?: string;
  preparation: string; // Vorbereitung der Übung
  execution: string; // Ausführungsbeschreibung
  goal: string; // Ziel der Übung
  tips: string; // Tipps zur korrekten Ausführung
  muscleGroup: MuscleGroup;
  difficulty: number;
  duration?: number; // in Sekunden
  videoUrl?: string; // Vollständige Video-URL (optional)
  youtubeVideoId: string; // YouTube-Video-ID
  thumbnailUrl?: string;
  category: ExerciseCategory; // mobilisierend, kräftigend
  isSitting: boolean; // Sitzend oder stehend (ersetzt das bisherige type-Feld)
  usesTheraband: boolean; // Verwendet Theraband
  isDynamic: boolean; // Dynamische oder statische Übung
  isUnilateral: boolean; // Einseitige Übung
  tags?: string[];
  instructions?: string[];
  
  // Kompatibilitätsfelder für existierende Komponenten
  type?: ExerciseType; // Veraltet: durch isSitting ersetzt
  equipment?: Equipment[]; // Veraltet: durch usesTheraband ersetzt
}

// Fortschrittstypen
export interface Progress {
  _id: string;
  user: string | User;
  exercise: string | Exercise;
  completed: boolean;
  aborted: boolean;
  watchDuration: number;
  date: string;
  pointsEarned: number;
  createdAt: string;
  updatedAt: string;
}

// Enums für Übungen
export type MuscleGroup = 'Bauch' | 'Po' | 'Schulter' | 'Brust' | 'Nacken' | 'Rücken';
export type ExerciseType = 'sitzend' | 'stehend';
export type ExerciseCategory = 'Mobilisation' | 'Kraft';
export type Equipment = 'Theraband' | 'ohne';

// Typen für Fortschrittsverfolgung
export interface DailyProgress {
  progress: Progress[];
  muscleGroupsTrainedToday: MuscleGroup[];
  totalMuscleGroups: number;
  totalExercisesCompleted: number;
}

export interface DailySummary {
  date: string;
  exercisesCompleted: number;
  exercisesAborted: number;
  muscleGroupsTrained: MuscleGroup[];
  pointsEarned: number;
}

export interface WeeklyProgress {
  dailySummary: DailySummary[];
  dailyActivitySummary: {
    dayOfWeek: number;
    exercisesCompleted: number;
  }[];
  muscleGroupStats: {
    muscleGroup: string;
    count: number;
    percentage: number;
  }[];
  totalExercisesCompleted: number;
  totalPointsEarned: number;
  totalExercisesThisWeek: number;
  totalPointsThisWeek: number;
  daysWithActivityThisWeek: number;
}

export interface MonthlyProgress {
  month: number;
  year: number;
  totalExercisesThisMonth: number;
  totalPointsThisMonth: number;
  daysWithActivityThisMonth: number;
  activityByDate: {
    date: string;
    exercisesCompleted: number;
    pointsEarned: number;
    muscleGroupsTrained: MuscleGroup[];
  }[];
  mostTrainedMuscleGroups: {
    muscleGroup: string;
    count: number;
  }[];
}

export interface ExerciseRecommendation {
  trainedToday: MuscleGroup[];
  recommendations: Exercise[];
  muscleGroupsTrainedToday?: MuscleGroup[];
  totalMuscleGroups?: number;
}

// Typen für Authentifizierung
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
  age?: number;
  passwordConfirmation: string;
  acceptTerms: boolean;
}

// Gamification-Typen
export interface Achievement {
  _id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
}

export interface Level {
  level: number;
  pointsRequired: number;
  title: string;
  benefits: string[];
}
