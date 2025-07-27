import { Request, Response } from 'express';
import { AnalyticsService } from '../services/analyticsService';

// Track session start
export const startSession = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { sessionId, deviceType, userAgent, screenWidth, screenHeight } = req.body;
    
    const session = await AnalyticsService.startSession(userId, sessionId, {
      deviceType,
      userAgent,
      screenWidth,
      screenHeight
    });
    
    res.status(201).json({ success: true, sessionId: session.sessionId });
  } catch (error) {
    console.error('Error starting session:', error);
    res.status(500).json({ message: 'Fehler beim Starten der Sitzung' });
  }
};

// Track session end
export const endSession = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.body;
    
    await AnalyticsService.endSession(sessionId);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error ending session:', error);
    res.status(500).json({ message: 'Fehler beim Beenden der Sitzung' });
  }
};

// Track page visit
export const trackPageVisit = async (req: Request, res: Response) => {
  try {
    const { sessionId, page } = req.body;
    
    await AnalyticsService.trackPageVisit(sessionId, page);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking page visit:', error);
    res.status(500).json({ message: 'Fehler beim Verfolgen der Seitenaufrufe' });
  }
};

// Track exercise interactions
export const trackExerciseViewed = async (req: Request, res: Response) => {
  try {
    const { sessionId, exerciseId } = req.body;
    
    await AnalyticsService.trackExerciseViewed(sessionId, exerciseId);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking exercise view:', error);
    res.status(500).json({ message: 'Fehler beim Verfolgen der Übungsansicht' });
  }
};

export const trackExerciseCompleted = async (req: Request, res: Response) => {
  try {
    const { sessionId, exerciseId } = req.body;
    
    await AnalyticsService.trackExerciseCompleted(sessionId, exerciseId);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking exercise completion:', error);
    res.status(500).json({ message: 'Fehler beim Verfolgen der Übungsabschlüsse' });
  }
};

export const trackExerciseAborted = async (req: Request, res: Response) => {
  try {
    const { sessionId, exerciseId } = req.body;
    
    await AnalyticsService.trackExerciseAborted(sessionId, exerciseId);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking exercise abort:', error);
    res.status(500).json({ message: 'Fehler beim Verfolgen der abgebrochenen Übungen' });
  }
};

// Record health impact data
export const recordHealthImpact = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const healthData = req.body;
    
    const result = await AnalyticsService.recordHealthImpact(userId, healthData);
    
    res.json({ success: true, healthImpact: result });
  } catch (error) {
    console.error('Error recording health impact:', error);
    res.status(500).json({ message: 'Fehler beim Aufzeichnen der Gesundheitsauswirkungen' });
  }
};

// Get dashboard analytics (admin only)
export const getDashboardAnalytics = async (req: Request, res: Response) => {
  try {
    // Check if user is admin (you might want to implement proper admin role checking)
    const user = (req as any).user;
    if (!user.isAdmin) {
      return res.status(403).json({ message: 'Zugriff verweigert. Administratorrechte erforderlich.' });
    }
    
    const timeframe = req.query.timeframe as 'week' | 'month' | 'quarter' || 'month';
    
    const analytics = await AnalyticsService.getDashboardAnalytics(timeframe);
    
    res.json(analytics);
  } catch (error) {
    console.error('Error getting dashboard analytics:', error);
    res.status(500).json({ message: 'Fehler beim Abrufen der Dashboard-Analytik' });
  }
};

// Get user analytics
export const getUserAnalytics = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const days = parseInt(req.query.days as string) || 30;
    
    const analytics = await AnalyticsService.getUserAnalytics(userId, days);
    
    res.json(analytics);
  } catch (error) {
    console.error('Error getting user analytics:', error);
    res.status(500).json({ message: 'Fehler beim Abrufen der Benutzeranalytik' });
  }
};

// Get senior-specific insights
export const getSeniorInsights = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    
    // Get user analytics for the last 30 days
    const analytics = await AnalyticsService.getUserAnalytics(userId, 30);
    
    // Calculate senior-specific insights
    const insights = {
      exerciseConsistency: {
        totalDaysActive: analytics.retention?.totalDaysActive || 0,
        currentStreak: analytics.summary.currentStreak,
        recommendation: analytics.summary.currentStreak >= 7 
          ? "Fantastisch! Sie sind sehr konsequent mit Ihrem Training."
          : "Versuchen Sie, täglich mindestens eine kurze Übung zu machen."
      },
      muscleGroupBalance: {
        trainedGroups: analytics.summary.muscleGroupsTrainedCount,
        totalGroups: 7,
        percentage: Math.round((analytics.summary.muscleGroupsTrainedCount / 7) * 100),
        recommendation: analytics.summary.muscleGroupsTrainedCount >= 5
          ? "Sehr gut! Sie trainieren vielseitig alle Muskelgruppen."
          : "Versuchen Sie, verschiedene Muskelgruppen zu trainieren für bessere Balance."
      },
      sessionPattern: {
        avgDuration: Math.round(analytics.summary.avgSessionDuration / 60), // in minutes
        totalSessions: analytics.summary.totalSessions,
        recommendation: analytics.summary.avgSessionDuration > 300 // 5 minutes
          ? "Ihre Trainingszeiten sind ideal für nachhaltigen Fortschritt."
          : "Kurze, regelmäßige Trainingseinheiten sind perfekt für den Anfang!"
      },
      progressMotivation: {
        totalExercises: analytics.summary.totalExercises,
        improvement: analytics.summary.totalExercises > 20 
          ? "excellent" 
          : analytics.summary.totalExercises > 10 
          ? "good" 
          : "starting",
        message: analytics.summary.totalExercises > 20
          ? "Sie machen großartige Fortschritte! Weiter so!"
          : analytics.summary.totalExercises > 10
          ? "Sie sind auf einem guten Weg. Bleiben Sie dran!"
          : "Jeder Anfang ist ein Erfolg. Sie schaffen das!"
      }
    };
    
    res.json({
      success: true,
      insights,
      analytics: analytics.summary
    });
    
  } catch (error) {
    console.error('Error getting senior insights:', error);
    res.status(500).json({ message: 'Fehler beim Abrufen der Gesundheitseinblicke' });
  }
}; 