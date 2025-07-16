import { Request, Response } from 'express';
import Progress from '../models/Progress';
import User from '../models/User';
import Exercise from '../models/Exercise';

// Übungsfortschritt speichern
export const saveProgress = async (req: Request, res: Response) => {
  try {
    const { exerciseId, completed, aborted, watchDuration } = req.body;
    const userId = (req as any).user._id;

    // Übung überprüfen
    const exercise = await Exercise.findById(exerciseId);
    if (!exercise) {
      return res.status(404).json({ message: 'Übung nicht gefunden' });
    }

    // Punkte berechnen
    let pointsEarned = 0;
    if (completed) {
      // Basis-Punkte für abgeschlossene Übung
      pointsEarned = 10;
      
      // Zusätzliche Punkte basierend auf der Schwierigkeit
      pointsEarned += (exercise.difficulty - 1) * 5;
    } else if (!aborted) {
      // Teilpunkte für teilweise angesehene Übungen
      const progressPercentage = Math.min(100, (watchDuration / exercise.duration) * 100);
      pointsEarned = Math.floor((progressPercentage / 100) * 10);
    }

    // Fortschritt speichern
    const progress = await Progress.create({
      user: userId,
      exercise: exerciseId,
      completed,
      aborted,
      watchDuration,
      pointsEarned
    });

    // Benutzerpunkte aktualisieren
    if (pointsEarned > 0) {
      const user = await User.findById(userId);
      if (user) {
        user.points += pointsEarned;
        
        // Level aktualisieren (alle 100 Punkte ein Level)
        const newLevel = Math.floor(user.points / 100) + 1;
        if (newLevel > user.level) {
          user.level = newLevel;
        }

        // Wenn Übung abgeschlossen ist, zur Liste der abgeschlossenen Übungen hinzufügen
        if (completed && !user.completedExercises.includes(exercise._id)) {
          user.completedExercises.push(exercise._id);
        }

        await user.save();
      }
    }

    res.status(201).json({
      progress,
      pointsEarned
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Fortschritt eines Benutzers abrufen
export const getUserProgress = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const progress = await Progress.find({ user: userId })
      .populate('exercise', 'title muscleGroup type category')
      .sort('-date');
    
    res.json(progress);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Täglichen Fortschritt eines Benutzers abrufen
export const getDailyProgress = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    
    // Zeitraum für heute festlegen
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    const progress = await Progress.find({
      user: userId,
      date: { $gte: startOfDay, $lt: endOfDay }
    }).populate('exercise', 'title muscleGroup type category');

    // Trainierte Muskelgruppen zählen
    const muscleGroupsTrainedToday = new Set(
      progress
        .filter(p => p.completed)
        .map(p => (p.exercise as any).muscleGroup)
    );

    res.json({
      progress,
      muscleGroupsTrainedToday: Array.from(muscleGroupsTrainedToday),
      totalMuscleGroups: 8 // Bauch, Beine, Po, Schulter, Arme, Brust, Nacken und Rücken
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Wöchentlichen Fortschritt eines Benutzers abrufen
export const getWeeklyProgress = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    
    // Zeitraum für die letzte Woche festlegen
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(now);
    endOfWeek.setDate(startOfWeek.getDate() + 7);
    endOfWeek.setHours(0, 0, 0, 0);

    const progress = await Progress.find({
      user: userId,
      date: { $gte: startOfWeek, $lt: endOfWeek }
    }).populate('exercise', 'title muscleGroup type category');
    
    // Tägliche Zusammenfassung erstellen
    const dailySummary = Array(7).fill(0).map((_, index) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + index);
      const dayStart = new Date(date);
      const dayEnd = new Date(date);
      dayEnd.setDate(date.getDate() + 1);
      
      // Übungen für diesen Tag filtern
      const dayProgress = progress.filter(
        p => p.date >= dayStart && p.date < dayEnd
      );
      
      // Trainierte Muskelgruppen an diesem Tag
      const muscleGroups = new Set(
        dayProgress
          .filter(p => p.completed)
          .map(p => (p.exercise as any).muscleGroup)
      );
      
      return {
        date: date.toISOString().split('T')[0],
        exercisesCompleted: dayProgress.filter(p => p.completed).length,
        exercisesAborted: dayProgress.filter(p => p.aborted).length,
        muscleGroupsTrained: Array.from(muscleGroups),
        pointsEarned: dayProgress.reduce((sum, p) => sum + p.pointsEarned, 0)
      };
    });
    
    res.json({
      dailySummary,
      totalExercisesCompleted: progress.filter(p => p.completed).length,
      totalPointsEarned: progress.reduce((sum, p) => sum + p.pointsEarned, 0)
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Empfehlungen für Übungen basierend auf dem Fortschritt
export const getRecommendedExercises = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'Benutzer nicht gefunden' });
    }

    // Heute trainierte Muskelgruppen abrufen
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    const todayProgress = await Progress.find({
      user: userId,
      completed: true,
      date: { $gte: startOfDay, $lt: endOfDay }
    }).populate('exercise');

    const trainedMuscleGroups = new Set(
      todayProgress.map(p => (p.exercise as any).muscleGroup)
    );

    // Alle Muskelgruppen
    const allMuscleGroups = ['Bauch', 'Beine', 'Po', 'Schulter', 'Arme', 'Brust', 'Nacken', 'Rücken'];
    
    // Nicht trainierte Muskelgruppen finden
    const untrainedMuscleGroups = allMuscleGroups.filter(
      group => !trainedMuscleGroups.has(group)
    );

    // Übungen für nicht trainierte Muskelgruppen empfehlen
    const recommendedExercises = await Exercise.find({
      muscleGroup: { $in: untrainedMuscleGroups }
    }).limit(5);

    res.json({
      trainedToday: Array.from(trainedMuscleGroups),
      recommendations: recommendedExercises
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
