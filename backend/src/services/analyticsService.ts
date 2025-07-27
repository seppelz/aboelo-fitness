import { 
  SessionMetrics, 
  DailyEngagement, 
  RetentionMetrics, 
  HealthImpact,
  ISessionMetrics,
  IDailyEngagement,
  IRetentionMetrics,
  IHealthImpact
} from '../models/Analytics';
import { IUser } from '../models/User';
import mongoose from 'mongoose';

export class AnalyticsService {
  
  // Track session start
  static async startSession(
    userId: string, 
    sessionId: string,
    deviceInfo: {
      deviceType: 'mobile' | 'tablet' | 'desktop';
      userAgent: string;
      screenWidth: number;
      screenHeight: number;
    }
  ): Promise<ISessionMetrics> {
    const session = new SessionMetrics({
      userId: new mongoose.Types.ObjectId(userId),
      sessionId,
      startTime: new Date(),
      exercisesViewed: [],
      exercisesCompleted: [],
      exercisesAborted: [],
      pagesVisited: [],
      deviceType: deviceInfo.deviceType,
      userAgent: deviceInfo.userAgent,
      screenSize: {
        width: deviceInfo.screenWidth,
        height: deviceInfo.screenHeight
      }
    });
    
    await session.save();
    return session;
  }

  // End session and calculate metrics
  static async endSession(sessionId: string): Promise<void> {
    const session = await SessionMetrics.findOne({ sessionId });
    if (session && !session.endTime) {
      session.endTime = new Date();
      session.duration = Math.floor((session.endTime.getTime() - session.startTime.getTime()) / 1000);
      await session.save();
    }
  }

  // Track page visit
  static async trackPageVisit(sessionId: string, page: string): Promise<void> {
    await SessionMetrics.findOneAndUpdate(
      { sessionId },
      { $addToSet: { pagesVisited: page } }
    );
  }

  // Track exercise interaction
  static async trackExerciseViewed(sessionId: string, exerciseId: string): Promise<void> {
    await SessionMetrics.findOneAndUpdate(
      { sessionId },
      { $addToSet: { exercisesViewed: exerciseId } }
    );
  }

  static async trackExerciseCompleted(sessionId: string, exerciseId: string): Promise<void> {
    await SessionMetrics.findOneAndUpdate(
      { sessionId },
      { $addToSet: { exercisesCompleted: exerciseId } }
    );
  }

  static async trackExerciseAborted(sessionId: string, exerciseId: string): Promise<void> {
    await SessionMetrics.findOneAndUpdate(
      { sessionId },
      { $addToSet: { exercisesAborted: exerciseId } }
    );
  }

  // Update daily engagement metrics
  static async updateDailyEngagement(
    userId: string,
    data: {
      sessionDuration: number;
      exercisesCompleted: number;
      muscleGroupsTrained: string[];
      muscleGroupDurations: Record<string, number>;
    }
  ): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const existing = await DailyEngagement.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      date: today
    });

    if (existing) {
      existing.totalSessions += 1;
      existing.totalDuration += data.sessionDuration;
      existing.exercisesCompleted += data.exercisesCompleted;
      
      // Merge unique muscle groups
      const uniqueGroups = new Set([...existing.uniqueMuscleGroupsTrained, ...data.muscleGroupsTrained]);
      existing.uniqueMuscleGroupsTrained = Array.from(uniqueGroups);
      
      // Merge time spent per muscle group
      for (const [group, duration] of Object.entries(data.muscleGroupDurations)) {
        const currentTime = existing.timeSpentPerMuscleGroup.get(group) || 0;
        existing.timeSpentPerMuscleGroup.set(group, currentTime + duration);
      }
      
      await existing.save();
    } else {
      const engagement = new DailyEngagement({
        userId: new mongoose.Types.ObjectId(userId),
        date: today,
        totalSessions: 1,
        totalDuration: data.sessionDuration,
        exercisesCompleted: data.exercisesCompleted,
        uniqueMuscleGroupsTrained: data.muscleGroupsTrained,
        timeSpentPerMuscleGroup: new Map(Object.entries(data.muscleGroupDurations))
      });
      
      await engagement.save();
    }
  }

  // Update retention metrics
  static async updateRetentionMetrics(userId: string): Promise<void> {
    const user = await mongoose.model('User').findById(userId);
    if (!user) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let retention = await RetentionMetrics.findOne({ userId: new mongoose.Types.ObjectId(userId) });
    
    if (!retention) {
      retention = new RetentionMetrics({
        userId: new mongoose.Types.ObjectId(userId),
        registrationDate: user.createdAt || today,
        lastActiveDate: today,
        totalDaysActive: 1,
        consecutiveDaysActive: 1,
        longestStreak: 1,
        retentionEvents: [{ day: 0, active: true }]
      });
    } else {
      const daysSinceRegistration = Math.floor((today.getTime() - retention.registrationDate.getTime()) / (24 * 60 * 60 * 1000));
      const daysSinceLastActive = Math.floor((today.getTime() - retention.lastActiveDate.getTime()) / (24 * 60 * 60 * 1000));
      
      // Update if it's a new day
      if (daysSinceLastActive > 0) {
        retention.lastActiveDate = today;
        retention.totalDaysActive += 1;
        
        // Update consecutive days
        if (daysSinceLastActive === 1) {
          retention.consecutiveDaysActive += 1;
          retention.longestStreak = Math.max(retention.longestStreak, retention.consecutiveDaysActive);
        } else {
          retention.consecutiveDaysActive = 1;
        }
        
        // Add retention event
        retention.retentionEvents.push({ day: daysSinceRegistration, active: true });
        
        // Update retention flags
        retention.is7DayRetained = daysSinceRegistration >= 7 && retention.totalDaysActive >= 2;
        retention.is30DayRetained = daysSinceRegistration >= 30 && retention.totalDaysActive >= 7;
        retention.is90DayRetained = daysSinceRegistration >= 90 && retention.totalDaysActive >= 15;
      }
    }
    
    await retention.save();
  }

  // Record health impact data
  static async recordHealthImpact(
    userId: string,
    healthData: {
      painLevel?: number;
      mobilityRating?: number;
      energyLevel?: number;
      sleepQuality?: number;
      overallWellbeing?: number;
      specificImprovements?: string[];
      concerns?: string[];
      notes?: string;
    }
  ): Promise<IHealthImpact> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Update or create today's health impact record
    const existing = await HealthImpact.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      date: today
    });
    
    if (existing) {
      Object.assign(existing, healthData);
      await existing.save();
      return existing;
    } else {
      const healthImpact = new HealthImpact({
        userId: new mongoose.Types.ObjectId(userId),
        date: today,
        ...healthData
      });
      
      await healthImpact.save();
      return healthImpact;
    }
  }

  // Get comprehensive analytics dashboard data
  static async getDashboardAnalytics(timeframe: 'week' | 'month' | 'quarter' = 'month') {
    const days = timeframe === 'week' ? 7 : timeframe === 'month' ? 30 : 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Get user engagement metrics
    const userEngagement = await DailyEngagement.aggregate([
      { $match: { date: { $gte: startDate } } },
      {
        $group: {
          _id: null,
          totalUsers: { $addToSet: '$userId' },
          totalSessions: { $sum: '$totalSessions' },
          totalDuration: { $sum: '$totalDuration' },
          totalExercises: { $sum: '$exercisesCompleted' },
          avgSatisfaction: { $avg: '$userSatisfactionRating' },
          avgDifficulty: { $avg: '$difficultyRating' }
        }
      }
    ]);

    // Get retention metrics
    const retentionData = await RetentionMetrics.aggregate([
      {
        $group: {
          _id: null,
          total7Day: { $sum: { $cond: ['$is7DayRetained', 1, 0] } },
          total30Day: { $sum: { $cond: ['$is30DayRetained', 1, 0] } },
          total90Day: { $sum: { $cond: ['$is90DayRetained', 1, 0] } },
          totalUsers: { $sum: 1 },
          avgStreak: { $avg: '$longestStreak' }
        }
      }
    ]);

    // Get muscle group completion rates
    const muscleGroupStats = await DailyEngagement.aggregate([
      { $match: { date: { $gte: startDate } } },
      { $unwind: '$uniqueMuscleGroupsTrained' },
      {
        $group: {
          _id: '$uniqueMuscleGroupsTrained',
          count: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get device usage stats
    const deviceStats = await SessionMetrics.aggregate([
      { $match: { startTime: { $gte: startDate } } },
      {
        $group: {
          _id: '$deviceType',
          count: { $sum: 1 },
          avgDuration: { $avg: '$duration' }
        }
      }
    ]);

    // Get health impact trends
    const healthTrends = await HealthImpact.aggregate([
      { $match: { date: { $gte: startDate } } },
      {
        $group: {
          _id: null,
          avgPainReduction: { $avg: '$painLevel' },
          avgMobilityImprovement: { $avg: '$mobilityRating' },
          avgEnergyIncrease: { $avg: '$energyLevel' },
          avgWellbeingImprovement: { $avg: '$overallWellbeing' },
          totalImprovements: { $sum: { $size: { $ifNull: ['$specificImprovements', []] } } }
        }
      }
    ]);

    return {
      timeframe,
      engagement: userEngagement[0] || {},
      retention: retentionData[0] || {},
      muscleGroups: muscleGroupStats,
      devices: deviceStats,
      healthImpact: healthTrends[0] || {},
      generatedAt: new Date()
    };
  }

  // Get individual user analytics
  static async getUserAnalytics(userId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const userObjectId = new mongoose.Types.ObjectId(userId);
    
    // Get user's engagement history
    const engagement = await DailyEngagement.find({
      userId: userObjectId,
      date: { $gte: startDate }
    }).sort({ date: -1 });
    
    // Get user's retention metrics
    const retention = await RetentionMetrics.findOne({ userId: userObjectId });
    
    // Get user's health progress
    const healthProgress = await HealthImpact.find({
      userId: userObjectId,
      date: { $gte: startDate }
    }).sort({ date: -1 });
    
    // Get user's session patterns
    const sessions = await SessionMetrics.find({
      userId: userObjectId,
      startTime: { $gte: startDate }
    }).sort({ startTime: -1 });
    
    return {
      userId,
      timeframe: `${days} days`,
      engagement,
      retention,
      healthProgress,
      sessions,
      summary: {
        totalSessions: sessions.length,
        totalExercises: engagement.reduce((sum, day) => sum + day.exercisesCompleted, 0),
        avgSessionDuration: sessions.length > 0 
          ? sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / sessions.length 
          : 0,
        muscleGroupsTrainedCount: new Set(
          engagement.flatMap(day => day.uniqueMuscleGroupsTrained)
        ).size,
        currentStreak: retention?.consecutiveDaysActive || 0
      }
    };
  }
} 