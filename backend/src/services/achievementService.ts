import User, { IUser, IUserAchievement } from '../models/User';
import Progress from '../models/Progress';
import { ACHIEVEMENTS } from '../models/Achievement';

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

    for (const achievementDef of ACHIEVEMENTS) {
      // Skip if user already has this achievement
      if (existingAchievementIds.includes(achievementDef.id)) {
        const existing = user.achievements.find(a => a.achievementId === achievementDef.id);
        if (existing) {
          unlockedAchievements.push({ achievement: existing, isNew: false });
        }
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
          rarity: achievementDef.rarity
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
        return await this.checkPerfectWeek(user);

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

    const trainedGroups = new Set(
      recentProgress.map(p => (p.exercise as any).muscleGroup)
    );

    return requiredGroups.every(group => trainedGroups.has(group));
  }

  // Check if user had a perfect week (met daily goals every day)
  private static async checkPerfectWeek(user: IUser): Promise<boolean> {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const dailyProgress = await Progress.aggregate([
      {
        $match: {
          user: user._id,
          completed: true,
          date: { $gte: weekAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            day: { $dayOfMonth: '$date' }
          },
          count: { $sum: 1 }
        }
      }
    ]);

    // Check if user exercised for 7 consecutive days with at least 1 exercise per day
    return dailyProgress.length >= 7 && dailyProgress.every(day => day.count >= 1);
  }

  // Update daily streak for user
  static async updateDailyStreak(user: IUser): Promise<{ streakUpdated: boolean; newStreak: number; streakBroken: boolean }> {
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    
    // If no last activity date, this is the first activity
    if (!user.lastActivityDate) {
      user.dailyStreak = 1;
      user.lastActivityDate = today;
      await user.save();
      return { streakUpdated: true, newStreak: 1, streakBroken: false };
    }

    const lastActivity = new Date(user.lastActivityDate);
    const daysSinceLastActivity = Math.floor((today.getTime() - lastActivity.getTime()) / (24 * 60 * 60 * 1000));

    let streakBroken = false;
    
    if (daysSinceLastActivity === 0) {
      // Same day activity, no streak change
      return { streakUpdated: false, newStreak: user.dailyStreak, streakBroken: false };
    } else if (daysSinceLastActivity === 1) {
      // Consecutive day, increment streak
      user.dailyStreak += 1;
      if (user.dailyStreak > user.longestStreak) {
        user.longestStreak = user.dailyStreak;
      }
    } else {
      // Streak broken, reset to 1
      streakBroken = user.dailyStreak > 0;
      user.dailyStreak = 1;
    }

    user.lastActivityDate = today;
    await user.save();

    return { 
      streakUpdated: true, 
      newStreak: user.dailyStreak, 
      streakBroken 
    };
  }

  // Update weekly goal progress
  static async updateWeeklyGoal(user: IUser): Promise<{ goalCompleted: boolean; progress: number; target: number }> {
    const now = new Date();
    const weekStart = new Date(user.weeklyGoal.weekStartDate);
    const daysSinceWeekStart = Math.floor((now.getTime() - weekStart.getTime()) / (24 * 60 * 60 * 1000));

    // If more than 7 days since week start, reset weekly goal
    if (daysSinceWeekStart >= 7) {
      user.weeklyGoal.currentProgress = 1; // Starting with current exercise
      user.weeklyGoal.weekStartDate = now;
    } else {
      user.weeklyGoal.currentProgress += 1;
    }

    const goalCompleted = user.weeklyGoal.currentProgress >= user.weeklyGoal.exercisesTarget;
    
    await user.save();

    return {
      goalCompleted,
      progress: user.weeklyGoal.currentProgress,
      target: user.weeklyGoal.exercisesTarget
    };
  }

  // Get encouraging streak messages
  static getStreakMessage(streak: number, streakBroken: boolean = false): string {
    if (streakBroken) {
      return "Nicht schlimm! Jeder Neustart ist ein Erfolg. Lass uns wieder durchstarten! 💪";
    }

    if (streak === 1) {
      return "Großartiger Start! Der erste Schritt ist getan! 🎯";
    } else if (streak === 3) {
      return "3 Tage in Folge! Du bist auf dem richtigen Weg! 🔥";
    } else if (streak === 7) {
      return "Eine ganze Woche! Du bist ein echter Champion! ⚡";
    } else if (streak === 14) {
      return "Zwei Wochen Durchhaltevermögen! Unglaublich! 🌟";
    } else if (streak === 30) {
      return "30 Tage! Du bist absolut unaufhaltsam! 👑";
    } else if (streak % 10 === 0) {
      return `${streak} Tage in Folge! Du bist eine Inspiration! 🚀`;
    } else if (streak % 7 === 0) {
      return `${streak} Tage Streak! Weiter so! 💎`;
    } else {
      return `${streak} Tage am Stück! Fantastisch! 💪`;
    }
  }

  // Get daily motivational quote
  static getDailyMotivationalQuote(): string {
    const quotes = [
      "Jeder Schritt zählt! 💪",
      "Du schaffst das! 🌟",
      "Bleib dran und glaub an dich! 🔥",
      "Heute ist ein neuer Tag für neue Erfolge! ⚡",
      "Deine Gesundheit ist das wertvollste Gut! 💎",
      "Kleine Schritte führen zu großen Veränderungen! 🚀",
      "Du bist stärker als du denkst! 💪",
      "Jede Übung bringt dich deinem Ziel näher! 🎯",
      "Disziplin heute, Stolz morgen! 👑",
      "Dein Körper dankt dir für jede Bewegung! 🌈",
      "Fortschritt ist besser als Perfektion! ✨",
      "Du investierst in deine beste Version! 🌟",
      "Glaube an den Prozess! 🔥",
      "Motivation bringt dich zum Start, Gewohnheit zum Ziel! ⚡",
      "Heute ist der perfekte Tag zum Trainieren! 💎"
    ];

    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 24 / 60 / 60 / 1000);
    return quotes[dayOfYear % quotes.length];
  }
} 