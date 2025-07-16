import { Request, Response } from 'express';
import Exercise, { IExercise } from '../models/Exercise';

// Alle Übungen abrufen
// Neue Funktionen für die erweiterten Filteroptionen
export const getExercisesByDynamic = async (req: Request, res: Response) => {
  try {
    const isDynamic = req.params.isDynamic === 'true';
    const exercises = await Exercise.find({ isDynamic });
    
    if (exercises.length > 0) {
      res.json(exercises);
    } else {
      res.status(404).json({ message: `Keine ${isDynamic ? 'dynamischen' : 'statischen'} Übungen gefunden` });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getExercisesByUnilateral = async (req: Request, res: Response) => {
  try {
    const isUnilateral = req.params.isUnilateral === 'true';
    const exercises = await Exercise.find({ isUnilateral });
    
    if (exercises.length > 0) {
      res.json(exercises);
    } else {
      res.status(404).json({ message: `Keine ${isUnilateral ? 'einseitigen' : 'beidseitigen'} Übungen gefunden` });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getExerciseByVideoId = async (req: Request, res: Response) => {
  try {
    const videoId = req.params.videoId;
    const exercise = await Exercise.findOne({ videoId });
    
    if (exercise) {
      res.json(exercise);
    } else {
      res.status(404).json({ message: 'Übung mit dieser VideoID nicht gefunden' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Alle Übungen abrufen
export const getAllExercises = async (req: Request, res: Response) => {
  try {
    const exercises = await Exercise.find({});
    res.json(exercises);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Übung nach ID abrufen
export const getExerciseById = async (req: Request, res: Response) => {
  try {
    const exercise = await Exercise.findById(req.params.id);

    if (exercise) {
      res.json(exercise);
    } else {
      res.status(404).json({ message: 'Übung nicht gefunden' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Übungen nach Muskelgruppe filtern
export const getExercisesByMuscleGroup = async (req: Request, res: Response) => {
  try {
    const muscleGroup = req.params.muscleGroup;
    const exercises = await Exercise.find({ muscleGroup });
    
    if (exercises.length > 0) {
      res.json(exercises);
    } else {
      res.status(404).json({ message: 'Keine Übungen für diese Muskelgruppe gefunden' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Übungen nach Sitzend/Stehend filtern
export const getExercisesBySittingStatus = async (req: Request, res: Response) => {
  try {
    const isSitting = req.params.isSitting === 'true';
    const exercises = await Exercise.find({ isSitting });
    
    if (exercises.length > 0) {
      res.json(exercises);
    } else {
      res.status(404).json({ message: `Keine ${isSitting ? 'sitzenden' : 'stehenden'} Übungen gefunden` });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Übungen nach Kategorie filtern (Kraft, Mobilisation)
export const getExercisesByCategory = async (req: Request, res: Response) => {
  try {
    const category = req.params.category;
    const exercises = await Exercise.find({ category });
    
    if (exercises.length > 0) {
      res.json(exercises);
    } else {
      res.status(404).json({ message: `Keine ${category} Übungen gefunden` });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Übungen nach Theraband filtern
export const getExercisesByTheraband = async (req: Request, res: Response) => {
  try {
    const usesTheraband = req.params.usesTheraband === 'true';
    const exercises = await Exercise.find({ usesTheraband });
    
    if (exercises.length > 0) {
      res.json(exercises);
    } else {
      res.status(404).json({ message: `Keine Übungen ${usesTheraband ? 'mit' : 'ohne'} Theraband gefunden` });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Neue Übung erstellen (Admin-Funktion)
export const createExercise = async (req: Request, res: Response) => {
  try {
    const {
      videoId,
      title,
      preparation,
      execution,
      goal,
      tips,
      muscleGroup,
      category,
      isSitting,
      usesTheraband,
      isDynamic,
      isUnilateral,
      youtubeVideoId,
      difficulty,
      duration,
      thumbnailUrl,
      tags,
      instructions
    } = req.body;

    const exercise = await Exercise.create({
      videoId,
      title,
      preparation,
      execution,
      goal,
      tips,
      muscleGroup,
      category,
      isSitting,
      usesTheraband,
      isDynamic,
      isUnilateral,
      youtubeVideoId,
      difficulty: difficulty || 1,
      duration,
      thumbnailUrl,
      tags: tags || [],
      instructions: instructions || []
    });

    res.status(201).json(exercise);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Übung aktualisieren (Admin-Funktion)
export const updateExercise = async (req: Request, res: Response) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    
    if (!exercise) {
      return res.status(404).json({ message: 'Übung nicht gefunden' });
    }

    const {
      videoId,
      title,
      preparation,
      execution,
      goal,
      tips,
      muscleGroup,
      category,
      isSitting,
      usesTheraband,
      isDynamic,
      isUnilateral,
      youtubeVideoId,
      difficulty,
      duration,
      thumbnailUrl,
      tags,
      instructions
    } = req.body;

    exercise.videoId = videoId || exercise.videoId;
    exercise.title = title || exercise.title;
    exercise.preparation = preparation || exercise.preparation;
    exercise.execution = execution || exercise.execution;
    exercise.goal = goal || exercise.goal;
    exercise.tips = tips || exercise.tips;
    exercise.muscleGroup = muscleGroup || exercise.muscleGroup;
    exercise.category = category || exercise.category;
    
    // Boolean-Werte nur aktualisieren, wenn sie explizit definiert sind
    exercise.isSitting = isSitting !== undefined ? isSitting : exercise.isSitting;
    exercise.usesTheraband = usesTheraband !== undefined ? usesTheraband : exercise.usesTheraband;
    exercise.isDynamic = isDynamic !== undefined ? isDynamic : exercise.isDynamic;
    exercise.isUnilateral = isUnilateral !== undefined ? isUnilateral : exercise.isUnilateral;
    
    exercise.youtubeVideoId = youtubeVideoId || exercise.youtubeVideoId;
    exercise.difficulty = difficulty || exercise.difficulty;
    exercise.duration = duration || exercise.duration;
    exercise.thumbnailUrl = thumbnailUrl || exercise.thumbnailUrl;
    exercise.tags = tags || exercise.tags;
    exercise.instructions = instructions || exercise.instructions;

    const updatedExercise = await exercise.save();
    res.json(updatedExercise);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Übung löschen (Admin-Funktion)
export const deleteExercise = async (req: Request, res: Response) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    
    if (!exercise) {
      return res.status(404).json({ message: 'Übung nicht gefunden' });
    }

    await exercise.deleteOne();
    res.json({ message: 'Übung erfolgreich gelöscht' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
