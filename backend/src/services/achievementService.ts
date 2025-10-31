import User, { IUser, IUserAchievement } from '../models/User';
import Progress from '../models/Progress';
import { ACHIEVEMENTS } from '../models/Achievement';

export const DEFAULT_WEEKLY_GOAL_TARGET = 30;
export const SECONDS_PER_DAY = 24 * 60 * 60 * 1000;

export interface AchievementUnlocked {
  achievement: IUserAchievement;
  isNew: boolean;
}

export class AchievementService {
  
  // Check and unlock achievements for a user
  static async checkAndUnlockAchievements(userId: string): Promise<AchievementUnlocked[]> {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const unlockedAchievements: AchievementUnlocked[] = [];
    const existingAchievementIds = user.achievements.map(a => a.achievementId);

    // Track which daily muscle group achievement tier to award (only award the highest)
    const dailyMuscleGroupAchievements = [
      'daily_all_muscle_groups',  // 6 groups - highest tier
      'daily_5_muscle_groups',     // 5 groups - mid tier
      'daily_3_muscle_groups'      // 3 groups - lowest tier
    ];
    
    let highestDailyMuscleGroupAchievement: string | null = null;

    // First pass: Determine which daily muscle group achievement to award
    for (const achievementId of dailyMuscleGroupAchievements) {
      if (existingAchievementIds.includes(achievementId)) {
        // User already has this achievement, check if we need to consider it
        continue;
      }
      
      const achievementDef = ACHIEVEMENTS.find(a => a.id === achievementId);
      if (achievementDef) {
        const meetsRequirements = await this.checkAchievementRequirements(user, achievementDef);
        if (meetsRequirements && !highestDailyMuscleGroupAchievement) {
          highestDailyMuscleGroupAchievement = achievementId;
          break; // Found the highest tier, stop checking
        }
      }
    }

    for (const achievementDef of ACHIEVEMENTS) {
      // Skip if user already has this achievement
      if (existingAchievementIds.includes(achievementDef.id)) {
        const existing = user.achievements.find(a => a.achievementId === achievementDef.id);
        if (existing) {
          unlockedAchievements.push({ achievement: existing, isNew: false });
        }
        continue;
      }

      // Skip lower-tier daily muscle group achievements if a higher one is being awarded
      if (dailyMuscleGroupAchievements.includes(achievementDef.id) && 
          highestDailyMuscleGroupAchievement && 
          achievementDef.id !== highestDailyMuscleGroupAchievement) {
        continue;
      }

      // Check if user meets requirements
      const meetsRequirements = await this.checkAchievementRequirements(user, achievementDef);
      
      if (meetsRequirements) {
        const newAchievement: IUserAchievement = {
          achievementId: achievementDef.id,
          unlockedAt: new Date(),
          title: achievementDef.title,
          description: achievementDef.description,
          icon: achievementDef.icon,
          rarity: achievementDef.rarity as IUserAchievement['rarity']
        };

        user.achievements.push(newAchievement);
        unlockedAchievements.push({ achievement: newAchievement, isNew: true });
      }
    }

    if (unlockedAchievements.some(a => a.isNew)) {
      await user.save();
    }

    return unlockedAchievements;
  }

  // Check if user meets specific achievement requirements
  private static async checkAchievementRequirements(user: IUser, achievement: any): Promise<boolean> {
    const { requirements } = achievement;

    switch (requirements.type) {
      case 'first_exercise':
        return user.completedExercises.length >= 1;

      case 'exercises_count':
        return user.completedExercises.length >= requirements.value;

      case 'streak_days':
        return user.dailyStreak >= requirements.value;

      case 'points_total':
        return user.points >= requirements.value;

      case 'muscle_groups':
        return await this.checkMuscleGroupsCompleted(user, requirements.muscleGroups);

      case 'perfect_week':
        return await this.checkPerfectWeek(user, requirements);

      case 'daily_muscle_groups':
        return await this.checkDailyMuscleGroups(user, requirements);

      case 'muscle_specialist':
        return await this.checkMuscleSpecialist(user, requirements);

      case 'consistency_muscle_groups':
        return await this.checkConsistencyMuscleGroups(user, requirements);

      case 'perfect_days':
        return user.perfectDaysCount >= requirements.value;

      case 'monthly_balance':
        return await this.checkMonthlyBalance(user, requirements);

      default:
        return false;
    }
  }

  // Check if user has trained all required muscle groups
  private static async checkMuscleGroupsCompleted(user: IUser, requiredGroups: string[]): Promise<boolean> {
    const recentProgress = await Progress.find({
      user: user._id,
      completed: true,
      date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
    }).populate('exercise', 'muscleGroup');

    const trainedGroups = new Set<string>();
    for (const progressEntry of recentProgress) {
      const exerciseDoc = progressEntry.exercise as { muscleGroup?: string } | null | undefined;
      const muscleGroup = exerciseDoc?.muscleGroup;
      if (!muscleGroup) {
        continue;
      }
      trainedGroups.add(muscleGroup);
    }

    return requiredGroups.every(group => trainedGroups.has(group));
  }

  // Check if user had a perfect week (5 out of 7 days with all 6 muscle groups)
  private static async checkPerfectWeek(user: IUser, requirements?: any): Promise<boolean> {
    const days = requirements?.days || 7;
    const perfectDaysRequired = requirements?.perfectDays || 5;
    const daysAgo = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const dailyStats = await Progress.aggregate([
      {
        $match: {
          user: user._id,
          completed: true,
          date: { $gte: daysAgo }
        }
      },
      {
        $lookup: {
          from: 'exercises',
          localField: 'exercise',
          foreignField: '_id',
          as: 'exerciseData'
        }
      },
      {
        $unwind: '$exerciseData'
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            day: { $dayOfMonth: '$date' }
          },
          muscleGroups: { $addToSet: '$exerciseData.muscleGroup' }
        }
      },
      {
        $addFields: {
          muscleGroupCount: { $size: '$muscleGroups' },
          isPerfectDay: { $eq: [{ $size: '$muscleGroups' }, 6] }
        }
      }
    ]);

    // Count days with all 6 muscle groups
    const perfectDaysCount = dailyStats.filter(day => day.isPerfectDay).length;
    return perfectDaysCount >= perfectDaysRequired;
  }

  // Check daily muscle groups trained
  private static async checkDailyMuscleGroups(user: IUser, requirements: any): Promise<boolean> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const todayProgress = await Progress.find({
      user: user._id,
      completed: true,
      date: { $gte: startOfDay, $lt: endOfDay }
    }).populate('exercise', 'muscleGroup');

    const trainedGroupSet = new Set<string>();
    for (const progressEntry of todayProgress) {
      const exerciseDoc = progressEntry.exercise as { muscleGroup?: string } | null | undefined;
      const muscleGroup = exerciseDoc?.muscleGroup;
      if (!muscleGroup) {
        continue;
      }
      trainedGroupSet.add(muscleGroup);
    }
    const trainedGroups = [...trainedGroupSet];

    // Check if specific muscle groups were trained
    if (requirements.muscleGroups) {
      return requirements.muscleGroups.every((group: string) => trainedGroups.includes(group));
    }

    // Check if minimum number of different muscle groups were trained
    if (requirements.value) {
      return trainedGroups.length >= requirements.value;
    }

    return false;
  }

  // Check muscle group specialist achievement
  private static async checkMuscleSpecialist(user: IUser, requirements: any): Promise<boolean> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const todayProgress = await Progress.find({
      user: user._id,
      completed: true,
      date: { $gte: startOfDay, $lt: endOfDay }
    }).populate('exercise', 'muscleGroup');

    const targetGroupCount = todayProgress.filter(p => {
      const exerciseDoc = p.exercise as { muscleGroup?: string } | null | undefined;
      const muscleGroup = exerciseDoc?.muscleGroup;
      return muscleGroup === requirements.muscleGroup;
    }).length;

    return targetGroupCount >= requirements.value;
  }

  // Check consistency muscle group achievement
  private static async checkConsistencyMuscleGroups(user: IUser, requirements: any): Promise<boolean> {
    const { days, minMuscleGroups } = requirements;
    const daysAgo = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Get daily muscle group counts for the last 'days' days
    const dailyStats = await Progress.aggregate([
      {
        $match: {
          user: user._id,
          completed: true,
          date: { $gte: daysAgo }
        }
      },
      {
        $lookup: {
          from: 'exercises',
          localField: 'exercise',
          foreignField: '_id',
          as: 'exerciseData'
        }
      },
      {
        $unwind: '$exerciseData'
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            day: { $dayOfMonth: '$date' }
          },
          muscleGroups: { $addToSet: '$exerciseData.muscleGroup' }
        }
      },
      {
        $addFields: {
          muscleGroupCount: { $size: '$muscleGroups' }
        }
      }
    ]);

    // Check if we have stats for all required days and each day meets minimum muscle groups
    return dailyStats.length >= days && 
           dailyStats.every(day => day.muscleGroupCount >= minMuscleGroups);
  }

  // Check monthly balance achievement (e.g., train X muscle groups on Y days in a month)
  private static async checkMonthlyBalance(user: IUser, requirements: any): Promise<boolean> {
    const { days, targetDays, minMuscleGroups } = requirements;
    const daysAgo = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Get daily muscle group counts for the last 'days' period
    const dailyStats = await Progress.aggregate([
      {
        $match: {
          user: user._id,
          completed: true,
          date: { $gte: daysAgo }
        }
      },
      {
        $lookup: {
          from: 'exercises',
          localField: 'exercise',
          foreignField: '_id',
          as: 'exerciseData'
        }
      },
      {
        $unwind: '$exerciseData'
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            day: { $dayOfMonth: '$date' }
          },
          muscleGroups: { $addToSet: '$exerciseData.muscleGroup' }
        }
      },
      {
        $addFields: {
          muscleGroupCount: { $size: '$muscleGroups' }
        }
      }
    ]);

    // Count days that meet the minimum muscle group requirement
    const qualifyingDays = dailyStats.filter(day => day.muscleGroupCount >= minMuscleGroups).length;
    return qualifyingDays >= targetDays;
  }

  // Update daily streak for user with streak protection
  static async updateDailyStreak(user: IUser): Promise<{ streakUpdated: boolean; newStreak: number; streakBroken: boolean; protectionUsed: boolean }> {
    const today = new Date();

    // If no last activity date, this is the first activity
    if (!user.lastActivityDate) {
      user.dailyStreak = 1;
      user.longestStreak = Math.max(user.longestStreak, user.dailyStreak);
      user.lastActivityDate = today;
      await user.save();
      return { streakUpdated: true, newStreak: 1, streakBroken: false, protectionUsed: false };
    }

    const lastActivity = new Date(user.lastActivityDate);
    const daysSinceLastActivity = Math.floor((today.getTime() - lastActivity.getTime()) / SECONDS_PER_DAY);

    let streakBroken = false;
    let protectionUsed = false;

    if (daysSinceLastActivity === 0) {
      return { streakUpdated: false, newStreak: user.dailyStreak, streakBroken: false, protectionUsed: false };
    }

    if (daysSinceLastActivity === 1) {
      user.dailyStreak += 1;
      if (user.dailyStreak > user.longestStreak) {
        user.longestStreak = user.dailyStreak;
      }
    } else if (daysSinceLastActivity === 2) {
      const weekAgo = new Date(today.getTime() - 7 * SECONDS_PER_DAY);
      const canUseProtection = !user.streakProtectionUsed || new Date(user.streakProtectionUsed) < weekAgo;

      if (canUseProtection && user.dailyStreak > 0) {
        protectionUsed = true;
        user.streakProtectionUsed = today;
      } else {
        streakBroken = user.dailyStreak > 0;
        user.dailyStreak = 1;
      }
    } else {
      streakBroken = user.dailyStreak > 0;
      user.dailyStreak = 1;
    }

    user.lastActivityDate = today;
    await user.save();

    return {
      streakUpdated: true,
      newStreak: user.dailyStreak,
      streakBroken,
      protectionUsed,
    };
  }

  static getStreakMessage(streak: number, streakBroken: boolean = false): string {
    if (streakBroken) {
      return "Nicht schlimm! Jeder Neustart ist ein Erfolg. Lassen Sie uns wieder durchstarten! 💪";
    }

    if (streak === 1) {
      return "Großartiger Start! Der erste Schritt ist getan! 🎯";
    }

    if (streak === 3) {
      return "3 Tage in Folge! Sie sind auf dem richtigen Weg! 🔥";
    }

    if (streak === 7) {
      return "Eine ganze Woche! Sie sind ein echter Champion! ⚡";
    }

    if (streak === 14) {
      return "Zwei Wochen Durchhaltevermögen! Unglaublich! 🌟";
    }

    if (streak === 30) {
      return "30 Tage! Sie sind absolut unaufhaltsam! 👑";
    }

    if (streak % 10 === 0) {
      return `${streak} Tage in Folge! Sie sind eine Inspiration! 🚀`;
    }

    if (streak % 7 === 0) {
      return `${streak} Tage Streak! Weiter so! 💎`;
    }

    return `${streak} Tage am Stück! Fantastisch! 💪`;
  }

  static ensureWeeklyGoalInitialized(user: IUser, now: Date) {
    if (!user.weeklyGoal) {
      user.weeklyGoal = {
        exercisesTarget: DEFAULT_WEEKLY_GOAL_TARGET,
        currentProgress: 0,
        weekStartDate: now,
      };
      return;
    }

    if (!user.weeklyGoal.exercisesTarget || user.weeklyGoal.exercisesTarget < DEFAULT_WEEKLY_GOAL_TARGET) {
      user.weeklyGoal.exercisesTarget = DEFAULT_WEEKLY_GOAL_TARGET;
    }

    if (!user.weeklyGoal.weekStartDate) {
      user.weeklyGoal.weekStartDate = now;
    }

    if (typeof user.weeklyGoal.currentProgress !== 'number' || Number.isNaN(user.weeklyGoal.currentProgress)) {
      user.weeklyGoal.currentProgress = 0;
    }
  }

  static async updateWeeklyGoal(user: IUser): Promise<{ goalCompleted: boolean; progress: number; target: number }> {
    const now = new Date();

    AchievementService.ensureWeeklyGoalInitialized(user, now);

    const weekStart = new Date(user.weeklyGoal.weekStartDate);
    const daysSinceWeekStart = Math.floor((now.getTime() - weekStart.getTime()) / SECONDS_PER_DAY);

    if (daysSinceWeekStart >= 7) {
      user.weeklyGoal.currentProgress = 1;
      user.weeklyGoal.weekStartDate = now;
    } else {
      user.weeklyGoal.currentProgress += 1;
    }

    const goalCompleted = user.weeklyGoal.currentProgress >= user.weeklyGoal.exercisesTarget;

    await user.save();

    return {
      goalCompleted,
      progress: user.weeklyGoal.currentProgress,
      target: user.weeklyGoal.exercisesTarget,
    };
  }

  // Get daily motivational quote
  static getDailyMotivationalQuote(): string {
    const quotes = [
      "Jeder Schritt zählt! 💪",
      "Sie schaffen das! 🌟",
      "Bleiben Sie dran und glauben Sie an sich! 🔥",
      "Heute ist ein neuer Tag für neue Erfolge! ⚡",
      "Ihre Gesundheit ist das wertvollste Gut! 💎",
      "Kleine Schritte führen zu großen Veränderungen! 🚀",
      "Sie sind stärker als Sie denken! 💪",
      "Jede Übung bringt Sie ihrem Ziel näher! 🎯",
      "Disziplin heute, Stolz morgen! 👑",
      "Ihr Körper dankt Ihnen für jede Bewegung! 🌈",
      "Fortschritt ist besser als Perfektion! ✨",
      "Sie investieren in Ihre beste Version! 🌟",
      "Glauben Sie an den Prozess! 🔥",
      "Motivation bringt Sie zum Start, Gewohnheit zum Ziel! ⚡",
      "Heute ist der perfekte Tag zum Trainieren! 💎"
    ];

    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 24 / 60 / 60 / 1000);
    return quotes[dayOfYear % quotes.length];
  }
} 