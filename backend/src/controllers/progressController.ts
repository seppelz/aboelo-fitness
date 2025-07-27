import { Request, Response } from 'express';
import Progress from '../models/Progress';
import User from '../models/User';
import Exercise from '../models/Exercise';
import { AchievementService } from '../services/achievementService';

// Übungsfortschritt speichern
export const saveProgress = async (req: Request, res: Response) => {
  try {
    const { exerciseId, completed, aborted, watchDuration } = req.body;
    const userId = (req as any).user._id;

    console.log('saveProgress called with:', {
      exerciseId,
      completed,
      aborted,
      watchDuration,
      userId: userId.toString()
    });

    // Validate required fields
    if (!exerciseId) {
      return res.status(400).json({ message: 'exerciseId ist erforderlich' });
    }

    if (completed === undefined || aborted === undefined) {
      return res.status(400).json({ message: 'completed und aborted sind erforderlich' });
    }

    // Übung überprüfen
    const exercise = await Exercise.findById(exerciseId);
    if (!exercise) {
      return res.status(404).json({ message: 'Übung nicht gefunden' });
    }

    // Check for duplicate progress on the same day for completed exercises
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    
    const existingProgress = await Progress.findOne({
      user: userId,
      exercise: exerciseId,
      completed: true,
      date: { $gte: startOfDay, $lt: endOfDay }
    });
    
    if (existingProgress && completed) {
      console.log('Duplicate completed exercise found, preventing save');
      return res.status(400).json({ 
        message: 'Diese Übung wurde heute bereits abgeschlossen',
        alreadyCompleted: true 
      });
    }

    console.log('No existing progress found, proceeding with save...');

    // Punkte berechnen
    let pointsEarned = 0;
    if (completed) {
      // Basis-Punkte für abgeschlossene Übung
      pointsEarned = 10;
      
      // Zusätzliche Punkte basierend auf der Schwierigkeit
      pointsEarned += ((exercise.difficulty || 1) - 1) * 5;
    } else if (!aborted) {
      // Teilpunkte für teilweise angesehene Übungen
      const exerciseDuration = exercise.duration || 1;
      const progressPercentage = Math.min(100, (watchDuration / exerciseDuration) * 100);
      pointsEarned = Math.floor((progressPercentage / 100) * 10);
    }

    console.log(`Saving progress: exercise ${exerciseId}, completed: ${completed}, points: ${pointsEarned}`);

    // Fortschritt speichern
    const progress = await Progress.create({
      user: userId,
      exercise: exerciseId,
      completed,
      aborted,
      watchDuration,
      pointsEarned
    });

    console.log(`Progress saved successfully with ID: ${progress._id}`);

    let gamificationData = {
      achievements: [],
      streakInfo: null,
      weeklyGoal: null,
      motivationalQuote: AchievementService.getDailyMotivationalQuote()
    };

    // Benutzerpunkte und Gamification aktualisieren (nur für abgeschlossene Übungen)
    if (pointsEarned > 0 && completed) {
      const user = await User.findById(userId);
      if (user) {
        // Points und Level aktualisieren
        user.points += pointsEarned;
        
        // Level aktualisieren (alle 100 Punkte ein Level)
        const newLevel = Math.floor(user.points / 100) + 1;
        if (newLevel > user.level) {
          user.level = newLevel;
        }

        // Abgeschlossene Übung zur Liste hinzufügen
        if (!user.completedExercises.some(id => id.toString() === (exercise._id as any).toString())) {
          user.completedExercises.push(exercise._id as any);
        }

        // Exercise frequency tracking aktualisieren
        const exerciseFrequency = user.exerciseFrequency || new Map();
        const exerciseIdStr = (exercise._id as any).toString();
        const currentFreq = exerciseFrequency.get(exerciseIdStr) || 0;
        exerciseFrequency.set(exerciseIdStr, currentFreq + 1);
        user.exerciseFrequency = exerciseFrequency;

        // Monthly stats aktualisieren
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        if (user.monthlyStats.month !== currentMonth || user.monthlyStats.year !== currentYear) {
          user.monthlyStats = {
            exercisesCompleted: 1,
            pointsEarned: pointsEarned,
            month: currentMonth,
            year: currentYear
          };
        } else {
          user.monthlyStats.exercisesCompleted += 1;
          user.monthlyStats.pointsEarned += pointsEarned;
        }

        await user.save();

        // Update streak (nur für abgeschlossene Übungen)
        const streakResult = await AchievementService.updateDailyStreak(user);
        gamificationData.streakInfo = {
          currentStreak: streakResult.newStreak,
          longestStreak: user.longestStreak,
          message: AchievementService.getStreakMessage(streakResult.newStreak, streakResult.streakBroken),
          streakBroken: streakResult.streakBroken
        };

        // Update weekly goal
        const weeklyGoalResult = await AchievementService.updateWeeklyGoal(user);
        gamificationData.weeklyGoal = {
          progress: weeklyGoalResult.progress,
          target: weeklyGoalResult.target,
          completed: weeklyGoalResult.goalCompleted,
          message: weeklyGoalResult.goalCompleted ? 
            "🎉 Wochenziel erreicht! Du bist fantastisch!" : 
            `${weeklyGoalResult.progress}/${weeklyGoalResult.target} Übungen diese Woche`
        };

        // Check and unlock achievements
        const achievements = await AchievementService.checkAndUnlockAchievements(userId);
        gamificationData.achievements = achievements;
      }
    }

    res.json({
      message: 'Fortschritt erfolgreich gespeichert',
      progress,
      pointsEarned,
      gamification: gamificationData
    });
  } catch (error: any) {
    console.error('Error saving progress:', error);
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
      totalMuscleGroups: 8, // Bauch, Beine, Po, Schulter, Arme, Brust, Nacken und Rücken
      totalExercisesCompleted: progress.filter(p => p.completed).length
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Wöchentlichen Fortschritt eines Benutzers abrufen
export const getWeeklyProgress = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    
    // Zeitraum für die aktuelle Woche festlegen
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);
    endOfWeek.setHours(0, 0, 0, 0);

    console.log('getWeeklyProgress: Today is:', now.toISOString());
    console.log('getWeeklyProgress: Week range:', startOfWeek.toISOString(), 'to', endOfWeek.toISOString());

    const progress = await Progress.find({
      user: userId,
      date: { $gte: startOfWeek, $lt: endOfWeek }
    }).populate('exercise', 'title muscleGroup type category');

    console.log('getWeeklyProgress: Found', progress.length, 'progress entries for this week');
    console.log('getWeeklyProgress: Completed exercises:', progress.filter(p => p.completed).length);
    if (progress.length > 0) {
      console.log('getWeeklyProgress: Progress dates:', progress.map(p => p.date.toISOString()));
    }
    
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

    // Daily activity summary für das Frontend
    const dailyActivitySummary = dailySummary.map((day, index) => ({
      dayOfWeek: index, // 0 = Sonntag, 1 = Montag, etc.
      exercisesCompleted: day.exercisesCompleted
    }));

    // Muskelgruppen-Statistiken
    const muscleGroupCounts = new Map<string, number>();
    const totalCompletedExercises = progress.filter(p => p.completed).length;
    
    progress
      .filter(p => p.completed)
      .forEach(p => {
        const muscleGroup = (p.exercise as any).muscleGroup;
        muscleGroupCounts.set(muscleGroup, (muscleGroupCounts.get(muscleGroup) || 0) + 1);
      });

    const muscleGroupStats = Array.from(muscleGroupCounts.entries()).map(([muscleGroup, count]) => ({
      muscleGroup,
      count,
      percentage: totalCompletedExercises > 0 ? (count / totalCompletedExercises) * 100 : 0
    }));

    // Aktive Tage zählen
    const daysWithActivity = dailySummary.filter(day => day.exercisesCompleted > 0).length;
    
    res.json({
      dailySummary,
      dailyActivitySummary,
      muscleGroupStats,
      totalExercisesCompleted: totalCompletedExercises,
      totalPointsEarned: progress.reduce((sum, p) => sum + p.pointsEarned, 0),
      totalExercisesThisWeek: totalCompletedExercises,
      totalPointsThisWeek: progress.reduce((sum, p) => sum + p.pointsEarned, 0),
      daysWithActivityThisWeek: daysWithActivity
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Monatlichen Fortschritt eines Benutzers abrufen
export const getMonthlyProgress = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    
    // Zeitraum für den aktuellen Monat festlegen
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const progress = await Progress.find({
      user: userId,
      date: { $gte: startOfMonth, $lt: endOfMonth }
    }).populate('exercise', 'title muscleGroup type category');
    
    // Tägliche Aktivität für den Monat
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const activityByDate = Array(daysInMonth).fill(0).map((_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth(), index + 1);
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
        pointsEarned: dayProgress.reduce((sum, p) => sum + p.pointsEarned, 0),
        muscleGroupsTrained: Array.from(muscleGroups)
      };
    });

    // Meisttrainierte Muskelgruppen
    const muscleGroupCounts = new Map<string, number>();
    progress
      .filter(p => p.completed)
      .forEach(p => {
        const muscleGroup = (p.exercise as any).muscleGroup;
        muscleGroupCounts.set(muscleGroup, (muscleGroupCounts.get(muscleGroup) || 0) + 1);
      });

    const mostTrainedMuscleGroups = Array.from(muscleGroupCounts.entries())
      .map(([muscleGroup, count]) => ({ muscleGroup, count }))
      .sort((a, b) => b.count - a.count);

    res.json({
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      totalExercisesThisMonth: progress.filter(p => p.completed).length,
      totalPointsThisMonth: progress.reduce((sum, p) => sum + p.pointsEarned, 0),
      daysWithActivityThisMonth: activityByDate.filter(day => day.exercisesCompleted > 0).length,
      activityByDate,
      mostTrainedMuscleGroups
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

    // Alle Muskelgruppen (corrected - removed 'Arme' as it doesn't exist in Exercise model)
    const allMuscleGroups = ['Bauch', 'Beine', 'Po', 'Schulter', 'Brust', 'Nacken', 'Rücken'];
    
    // Nicht trainierte Muskelgruppen finden
    const untrainedMuscleGroups = allMuscleGroups.filter(
      group => !trainedMuscleGroups.has(group)
    );

    // Smart exercise selection: one exercise per untrained muscle group, balanced by frequency
    const recommendations = [];
    const exerciseFrequency = user.exerciseFrequency || new Map();

    for (const muscleGroup of untrainedMuscleGroups) {
      // Get exercises for this muscle group, filtered by theraband preference
      let exerciseQuery: any = { muscleGroup };
      
      // If user doesn't have theraband, only show exercises without theraband
      if (!user.hasTheraband) {
        exerciseQuery.usesTheraband = false;
      }
      // If user has theraband, show both with and without theraband exercises (no additional filter needed)
      
      const exercisesInGroup = await Exercise.find(exerciseQuery);
      
      if (exercisesInGroup.length > 0) {
        // Sort by frequency (least recommended first) to balance exposure
        const sortedExercises = exercisesInGroup.sort((a, b) => {
          const freqA = exerciseFrequency.get((a._id as any).toString()) || 0;
          const freqB = exerciseFrequency.get((b._id as any).toString()) || 0;
          return freqA - freqB;
        });
        
        // Pick the least recommended exercise from this muscle group
        const selectedExercise = sortedExercises[0];
        recommendations.push(selectedExercise);
        
        // Update frequency tracking for this recommendation
        const exerciseId = (selectedExercise._id as any).toString();
        const currentFreq = exerciseFrequency.get(exerciseId) || 0;
        exerciseFrequency.set(exerciseId, currentFreq + 1);
      }
    }

    // Update user's exercise frequency tracking
    user.exerciseFrequency = exerciseFrequency;
    await user.save();

    res.json({
      trainedToday: Array.from(trainedMuscleGroups),
      recommendations: recommendations,
      muscleGroupsTrainedToday: Array.from(trainedMuscleGroups),
      totalMuscleGroups: allMuscleGroups.length
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
