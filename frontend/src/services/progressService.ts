import api from './api';
import type { Exercise } from '../types';

// Vereinfachte Typdefinitionen
interface Progress {
  exerciseId: string;
  userId: string;
  status: 'completed' | 'aborted';
  date: string;
  watchTimePercentage: number;
  points: number;
}

interface DailyProgress {
  date: string;
  completedExercises: Exercise[];
  pointsToday: number;
  exercisesToday: number;
  streak: number;
  targetExercisesPerDay: number;
  muscleGroupProgress: {
    muscleGroup: string;
    completed: number;
    total: number;
  }[];
  recentlyCompletedExercises: {
    exercise: Exercise;
    completedAt: string;
  }[];
}

interface WeeklyProgress {
  startOfWeek: string;
  endOfWeek: string;
  exercisesCompletedThisWeek: number;
  pointsThisWeek: number;
  activityByDay: {
    day: number;
    exercisesCompleted: number;
    pointsEarned: number;
    muscleGroupsTrained: string[];
  }[];
  muscleGroupsTrainedThisWeek: {
    muscleGroup: string;
    count: number;
    percentage: number;
  }[];
}

interface MonthlyProgress {
  month: number;
  year: number;
  totalExercisesThisMonth: number;
  totalPointsThisMonth: number;
  daysWithActivityThisMonth: number;
  activityByDate: {
    date: string;
    exercisesCompleted: number;
    pointsEarned: number;
    muscleGroupsTrained: string[];
  }[];
  mostTrainedMuscleGroups: {
    muscleGroup: string;
    count: number;
  }[];
}

interface ExerciseRecommendation {
  recommendedExercises: Exercise[];
  reason: string;
}

// Übungsfortschritt speichern
export const saveProgress = async (
  exerciseId: string, 
  completed: boolean, 
  aborted: boolean, 
  watchDuration: number
): Promise<{ progress: Progress, pointsEarned: number }> => {
  const response = await api.post('/progress/save', {
    exerciseId,
    completed,
    aborted,
    watchDuration
  });
  return response.data;
};

// Benutzerfortschritt abrufen
export const getUserProgress = async (): Promise<Progress[]> => {
  const response = await api.get('/progress/user');
  return response.data;
};

// Täglichen Fortschritt abrufen
export const getDailyProgress = async (): Promise<DailyProgress> => {
  const response = await api.get('/progress/daily');
  return response.data;
};

// Wöchentlichen Fortschritt abrufen
export const getWeeklyProgress = async (): Promise<WeeklyProgress> => {
  const response = await api.get('/progress/weekly');
  return response.data;
};

// Empfehlungen für Übungen abrufen
export const getRecommendedExercises = async (): Promise<ExerciseRecommendation> => {
  const response = await api.get('/progress/recommendations');
  return response.data;
};

// Monatlichen Fortschritt abrufen
export const getMonthlyProgress = async (): Promise<MonthlyProgress> => {
  const response = await api.get('/progress/monthly');
  return response.data;
};

// Daily Streak aktualisieren
export const updateDailyStreak = async (): Promise<{ dailyStreak: number }> => {
  const response = await api.put('/users/streak');
  return response.data;
};
