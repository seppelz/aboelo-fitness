import api from './api';
import { Exercise, MuscleGroup, ExerciseType, ExerciseCategory, Equipment } from '../types';

// Alle Übungen abrufen
export const getAllExercises = async (): Promise<Exercise[]> => {
  const response = await api.get('/exercises');
  return response.data;
};

// Übung nach ID abrufen
export const getExerciseById = async (id: string): Promise<Exercise> => {
  const response = await api.get(`/exercises/id/${id}`);
  return response.data;
};

// Übung nach Video-ID abrufen
export const getExerciseByVideoId = async (videoId: string): Promise<Exercise> => {
  const response = await api.get(`/exercises/video/${videoId}`);
  return response.data;
};

// Übungen nach Muskelgruppe filtern
export const getExercisesByMuscleGroup = async (muscleGroup: MuscleGroup): Promise<Exercise[]> => {
  const response = await api.get(`/exercises/muscle-group/${muscleGroup}`);
  return response.data;
};

// Übungen nach Kategorie filtern (mobilisierend, kräftigend)
export const getExercisesByCategory = async (category: ExerciseCategory): Promise<Exercise[]> => {
  const response = await api.get(`/exercises/category/${category}`);
  return response.data;
};

// Sitzende Übungen abrufen
export const getSittingExercises = async (): Promise<Exercise[]> => {
  const response = await api.get('/exercises/sitting');
  return response.data;
};

// Stehende Übungen abrufen
export const getStandingExercises = async (): Promise<Exercise[]> => {
  const response = await api.get('/exercises/standing');
  return response.data;
};

// Übungen mit Theraband abrufen
export const getTherabandExercises = async (): Promise<Exercise[]> => {
  const response = await api.get('/exercises/theraband');
  return response.data;
};

// Übungen ohne Theraband abrufen
export const getExercisesWithoutTheraband = async (): Promise<Exercise[]> => {
  const response = await api.get('/exercises/no-theraband');
  return response.data;
};

// Dynamische Übungen abrufen
export const getDynamicExercises = async (): Promise<Exercise[]> => {
  const response = await api.get('/exercises/dynamic');
  return response.data;
};

// Statische Übungen abrufen
export const getStaticExercises = async (): Promise<Exercise[]> => {
  const response = await api.get('/exercises/static');
  return response.data;
};

// Einseitige Übungen abrufen
export const getUnilateralExercises = async (): Promise<Exercise[]> => {
  const response = await api.get('/exercises/unilateral');
  return response.data;
};

// Beidseitige Übungen abrufen
export const getBilateralExercises = async (): Promise<Exercise[]> => {
  const response = await api.get('/exercises/bilateral');
  return response.data;
};

// Kompatibilitätsmethoden

// Übungen nach Typ filtern (sitzend, stehend) - Kompatibilitätsmethode
export const getExercisesByType = async (type: ExerciseType): Promise<Exercise[]> => {
  // Route anhand des types aufrufen
  if (type === 'sitzend' as ExerciseType) {
    return await getSittingExercises();
  } else if (type === 'stehend' as ExerciseType) {
    return await getStandingExercises();
  } else {
    return await getAllExercises();
  }
};

// Übungen nach Equipment filtern - Kompatibilitätsmethode
export const getExercisesByEquipment = async (equipment: Equipment): Promise<Exercise[]> => {
  // Route anhand des Equipments aufrufen
  if (equipment === 'Theraband' as Equipment) {
    return await getTherabandExercises();
  } else if (equipment === 'ohne' as Equipment) {
    return await getExercisesWithoutTheraband();
  } else {
    return await getAllExercises();
  }
};
