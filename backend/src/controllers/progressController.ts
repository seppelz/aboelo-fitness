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

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    // Punkte berechnen mit Bonus für Extra-Übungen
    let pointsEarned = 0;
    if (completed) {
      // Basis-Punkte für abgeschlossene Übung
      pointsEarned = 10;
      
      // Zusätzliche Punkte basierend auf der Schwierigkeit
      pointsEarned += ((exercise.difficulty || 1) - 1) * 5;
      
      // Bonus für Extra-Übungen derselben Muskelgruppe am selben Tag
      const todayProgressSameMuscle = await Progress.find({
        user: userId,
        completed: true,
        date: { $gte: startOfDay, $lt: endOfDay }
      }).populate('exercise');
      
      const sameMuscleGroupCount = todayProgressSameMuscle.filter(
        p => p.exercise && (p.exercise as any).muscleGroup === exercise.muscleGroup
      ).length;
      
      // First exercise of muscle group: 10 points (base)
      // Second exercise: +5 bonus
      // Third+ exercise: +3 bonus each
      if (sameMuscleGroupCount === 1) {
        pointsEarned += 5;
      } else if (sameMuscleGroupCount >= 2) {
        pointsEarned += 3;
      }
    } else if (!aborted) {
      // Teilpunkte für teilweise angesehene Übungen
      const exerciseDuration = exercise.duration || 1;
      const progressPercentage = Math.min(100, (watchDuration / exerciseDuration) * 100);
      pointsEarned = Math.floor((progressPercentage / 100) * 10);
    }
    // Fortschritt speichern
    const progress = await Progress.create({
      user: userId,
      exercise: exerciseId,
      completed,
      aborted,
      watchDuration,
      pointsEarned,
      timeOfDay: new Date().getHours() // Track time of day for analytics
    });

    console.log(`Progress saved successfully with ID: ${progress._id}`);

    interface StreakInfo {
      currentStreak: number;
      longestStreak: number;
      message: string;
      streakBroken: boolean;
      protectionUsed?: boolean;
      protectionMessage?: string;
    }
    
    interface WeeklyGoalInfo {
      progress: number;
      target: number;
      completed: boolean;
      message: string;
    }
    
    interface PerfectDayInfo {
      isPerfectDay: boolean;
      bonusPoints: number;
      message: string;
    }
    
    let gamificationData: {
      achievements: any[];
      streakInfo: StreakInfo | null;
      weeklyGoal: WeeklyGoalInfo | null;
      perfectDay: PerfectDayInfo | null;
      motivationalQuote: string;
    } = {
      achievements: [],
      streakInfo: null,
      weeklyGoal: null,
      perfectDay: null,
      motivationalQuote: AchievementService.getDailyMotivationalQuote()
    };

    // Benutzerpunkte und Gamification aktualisieren (nur für abgeschlossene Übungen)
    if (pointsEarned > 0 && completed) {
      const user = await User.findById(userId);
      if (user) {
        // Ensure legacy users have required nested documents initialized
        if (!user.exerciseFrequency || typeof (user.exerciseFrequency as any).set !== 'function') {
          const rawFrequency = (user.exerciseFrequency as any) || {};
          const frequencyEntries = typeof rawFrequency === 'object' && rawFrequency !== null
            ? Object.entries(rawFrequency)
            : [];
          const normalized = new Map<string, number>();
          for (const [key, value] of frequencyEntries) {
            if (typeof key === 'string') {
              const numericValue = typeof value === 'number' ? value : parseInt(String(value), 10);
              if (!isNaN(numericValue)) {
                normalized.set(key, numericValue);
              }
            }
          }
          user.exerciseFrequency = normalized;
        }

        if (!user.weeklyGoal) {
          user.weeklyGoal = {
            exercisesTarget: 5,
            currentProgress: 0,
            weekStartDate: new Date()
          };
        }

        if (!user.monthlyStats) {
          const nowDate = new Date();
          user.monthlyStats = {
            exercisesCompleted: 0,
            pointsEarned: 0,
            month: nowDate.getMonth(),
            year: nowDate.getFullYear()
          };
        }

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
        const exerciseFrequency = user.exerciseFrequency instanceof Map
          ? user.exerciseFrequency
          : new Map<string, number>(
              Object.entries((user.exerciseFrequency as any) || {})
                .map(([key, value]) => {
                  const numericValue = typeof value === 'number' ? value : parseInt(String(value), 10);
                  return [key, isNaN(numericValue) ? 0 : numericValue] as [string, number];
                })
            );
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
        const streakMessage = AchievementService.getStreakMessage(streakResult.newStreak, streakResult.streakBroken);
        gamificationData.streakInfo = {
          currentStreak: streakResult.newStreak,
          longestStreak: user.longestStreak,
          message: streakMessage,
          streakBroken: streakResult.streakBroken,
          protectionUsed: streakResult.protectionUsed,
          protectionMessage: streakResult.protectionUsed
            ? '🛡️ Streak-Schutz aktiv: Wir haben Ihren Streak für Sie geschützt!'
            : undefined
        };

        // Update weekly goal
        const weeklyGoalResult = await AchievementService.updateWeeklyGoal(user);
        gamificationData.weeklyGoal = {
          progress: weeklyGoalResult.progress,
          target: weeklyGoalResult.target,
          completed: weeklyGoalResult.goalCompleted,
          message: weeklyGoalResult.goalCompleted ? 
            "🎉 Wochenziel erreicht! Sie sind fantastisch!" : 
            `${weeklyGoalResult.progress}/${weeklyGoalResult.target} Übungen diese Woche`
        };

        // Check for Perfect Day (all 6 muscle groups trained)
        const todayProgress = await Progress.find({
          user: userId,
          completed: true,
          date: { $gte: startOfDay, $lt: endOfDay }
        }).populate('exercise');
        
        const trainedMuscleGroups = new Set<string>();
        for (const progressEntry of todayProgress) {
          const muscleGroup = ((progressEntry.exercise as any)?.muscleGroup) as string | undefined;
          if (!muscleGroup) {
            continue;
          }
          trainedMuscleGroups.add(muscleGroup);
        }
        
        const allMuscleGroups = ['Bauch', 'Po', 'Schulter', 'Brust', 'Nacken', 'Rücken'];
        const isPerfectDay = allMuscleGroups.every(group => trainedMuscleGroups.has(group));
        const todayDateKey = startOfDay.toISOString();
        const lastPerfectDayDateKey = user.lastPerfectDayDate ? new Date(user.lastPerfectDayDate).toISOString().split('T')[0] : null;
        const currentDateKey = startOfDay.toISOString().split('T')[0];

        if (isPerfectDay && lastPerfectDayDateKey !== currentDateKey) {
          // Award Perfect Day bonus once per day
          const perfectDayBonus = 50;
          user.points += perfectDayBonus;
          pointsEarned += perfectDayBonus;
          
          user.perfectDaysCount += 1;
          user.lastPerfectDayDate = startOfDay;
          
          await user.save();
          
          gamificationData.perfectDay = {
            isPerfectDay: true,
            bonusPoints: perfectDayBonus,
            message: `🎉 Perfekter Tag! Alle 6 Muskelgruppen trainiert! +${perfectDayBonus} Bonus-Punkte!`
          };
          
        }

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

    // Get user for streak information
    const user = await User.findById(userId);

    const progress = await Progress.find({
      user: userId,
      date: { $gte: startOfDay, $lt: endOfDay }
    }).populate('exercise', 'title muscleGroup type category');

    // Trainierte Muskelgruppen zählen
    const muscleGroupsTrainedToday = new Set(
      progress
        .filter(p => p.completed && p.exercise)
        .map(p => ((p.exercise as any)?.muscleGroup) as string)
        .filter(Boolean)
    );

    res.json({
      progress,
      muscleGroupsTrainedToday: Array.from(muscleGroupsTrainedToday),
      totalMuscleGroups: 6, // Bauch, Po, Schulter, Brust, Nacken und Rücken
      totalExercisesCompleted: progress.filter(p => p.completed).length,
      targetExercisesPerDay: 6, // Goal: at least one exercise per muscle group
      dailyStreak: user?.dailyStreak || 0,
      longestStreak: user?.longestStreak || 0,
      lastActivityDate: user?.lastActivityDate
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
          .filter(p => p.completed && p.exercise)
          .map(p => ((p.exercise as any)?.muscleGroup) as string)
          .filter(Boolean)
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
      .filter(p => p.completed && p.exercise)
      .forEach(p => {
        const muscleGroup = ((p.exercise as any)?.muscleGroup) as string | undefined;
        if (!muscleGroup) {
          return;
        }
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

    const defaultResponse = {
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      totalExercisesThisMonth: 0,
      totalPointsThisMonth: 0,
      daysWithActivityThisMonth: 0,
      activityByDate: [] as {
        date: string;
        exercisesCompleted: number;
        pointsEarned: number;
        muscleGroupsTrained: string[];
      }[],
      mostTrainedMuscleGroups: [] as { muscleGroup: string; count: number }[]
    };

    const progressDocs = await Progress.find({
      user: userId,
      date: { $gte: startOfMonth, $lt: endOfMonth }
    })
      .populate('exercise', 'title muscleGroup type category')
      .lean();

    if (!progressDocs.length) {
      const daysInMonthEmpty = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      defaultResponse.activityByDate = Array.from({ length: daysInMonthEmpty }, (_, index) => {
        const date = new Date(now.getFullYear(), now.getMonth(), index + 1);
        return {
          date: date.toISOString().split('T')[0],
          exercisesCompleted: 0,
          pointsEarned: 0,
          muscleGroupsTrained: []
        };
      });
      return res.json(defaultResponse);
    }

    const sanitizedProgress = progressDocs.map((doc) => {
      const rawDate = doc.date instanceof Date ? doc.date : doc.date ? new Date(doc.date) : null;
      const points = typeof doc.pointsEarned === 'number'
        ? doc.pointsEarned
        : Number(doc.pointsEarned) || 0;
      const completed = doc.completed === true;
      const muscleGroup = doc.exercise && typeof doc.exercise === 'object'
        ? (doc.exercise as any).muscleGroup
        : undefined;
      return {
        completed,
        date: rawDate,
        pointsEarned: points,
        muscleGroup: typeof muscleGroup === 'string' ? muscleGroup : undefined
      };
    });

    const activityByDateMap = new Map<string, {
      exercisesCompleted: number;
      pointsEarned: number;
      muscleGroups: Set<string>;
    }>();
    const muscleGroupCounts = new Map<string, number>();
    let totalExercises = 0;
    let totalPoints = 0;

    sanitizedProgress.forEach((entry) => {
      if (!entry.date) {
        return;
      }
      const dateKey = entry.date.toISOString().split('T')[0];
      if (!activityByDateMap.has(dateKey)) {
        activityByDateMap.set(dateKey, {
          exercisesCompleted: 0,
          pointsEarned: 0,
          muscleGroups: new Set<string>()
        });
      }

      const summary = activityByDateMap.get(dateKey)!;
      summary.pointsEarned += entry.pointsEarned;
      totalPoints += entry.pointsEarned;

      if (entry.completed) {
        summary.exercisesCompleted += 1;
        totalExercises += 1;
        if (entry.muscleGroup) {
          summary.muscleGroups.add(entry.muscleGroup);
          muscleGroupCounts.set(
            entry.muscleGroup,
            (muscleGroupCounts.get(entry.muscleGroup) || 0) + 1
          );
        }
      }
    });

    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const activityByDate = Array.from({ length: daysInMonth }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth(), index + 1);
      const dateKey = date.toISOString().split('T')[0];
      const summary = activityByDateMap.get(dateKey);
      return {
        date: dateKey,
        exercisesCompleted: summary ? summary.exercisesCompleted : 0,
        pointsEarned: summary ? summary.pointsEarned : 0,
        muscleGroupsTrained: summary ? Array.from(summary.muscleGroups) : []
      };
    });

    const mostTrainedMuscleGroups = Array.from(muscleGroupCounts.entries())
      .map(([muscleGroup, count]) => ({ muscleGroup, count }))
      .sort((a, b) => b.count - a.count);

    const daysWithActivity = activityByDate.reduce(
      (count, day) => (day.exercisesCompleted > 0 ? count + 1 : count),
      0
    );

    res.json({
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      totalExercisesThisMonth: totalExercises,
      totalPointsThisMonth: totalPoints,
      daysWithActivityThisMonth: daysWithActivity,
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
      todayProgress
        .filter(p => p.exercise)
        .map(p => ((p.exercise as any)?.muscleGroup) as string)
        .filter(Boolean)
    );

    // Alle Muskelgruppen - 6 groups total
    const allMuscleGroups = ['Bauch', 'Po', 'Schulter', 'Brust', 'Nacken', 'Rücken'];
    
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
