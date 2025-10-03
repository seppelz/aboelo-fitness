import api from './api';
import { Exercise, MuscleGroup, ExerciseType, ExerciseCategory, Equipment } from '../types';

// Alle Übungen abrufen
export const getAllExercises = async (): Promise<Exercise[]> => {
  console.log('🔍 [DEBUG] getAllExercises: Starte API-Aufruf...');
  
  try {
    const response = await api.get('/exercises');
    console.log(`✅ [DEBUG] getAllExercises: ${response.data.length} Übungen vom Server erhalten`);
    
    // Debug-Informationen für die ersten 3 Übungen
    if (response.data.length > 0) {
      console.log('📋 [DEBUG] Erste 3 Übungen vom Server:');
      response.data.slice(0, 3).forEach((exercise: Exercise, index: number) => {
        console.log(`  ${index + 1}. ${exercise.name} (ID: ${exercise._id})`);
        console.log(`     VideoID: ${exercise.videoId || 'N/A'}`);
        console.log(`     Muskelgruppe: ${exercise.muscleGroup}`);
        console.log(`     Dauer: ${exercise.duration}s`);
        console.log(`     Equipment: ${exercise.equipment || 'N/A'}`);
        console.log(`     Video URL: ${exercise.videoUrl || 'N/A'}`);
      });
    } else {
      console.log('⚠️ [DEBUG] Keine Übungen vom Server erhalten!');
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ [DEBUG] getAllExercises Fehler:', error);
    throw error;
  }
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
