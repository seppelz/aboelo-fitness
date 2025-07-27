import { useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';

// Generate a unique session ID
const generateSessionId = () => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Detect device type based on screen size and user agent
const getDeviceInfo = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const userAgent = navigator.userAgent;
  
  let deviceType: 'mobile' | 'tablet' | 'desktop';
  
  if (width <= 768) {
    deviceType = 'mobile';
  } else if (width <= 1024) {
    deviceType = 'tablet';
  } else {
    deviceType = 'desktop';
  }
  
  return {
    deviceType,
    userAgent,
    screenWidth: width,
    screenHeight: height
  };
};

export const useAnalytics = () => {
  const location = useLocation();
  const sessionIdRef = useRef<string | null>(null);
  const sessionStartTimeRef = useRef<number | null>(null);
  const isAuthenticated = true; // Get this from your auth context

  // Initialize session
  useEffect(() => {
    if (isAuthenticated && !sessionIdRef.current) {
      const initSession = async () => {
        try {
          sessionIdRef.current = generateSessionId();
          sessionStartTimeRef.current = Date.now();
          
          const deviceInfo = getDeviceInfo();
          
          await api.post('/analytics/session/start', {
            sessionId: sessionIdRef.current,
            ...deviceInfo
          });
          
          console.log('Analytics session started:', sessionIdRef.current);
        } catch (error) {
          console.warn('Failed to start analytics session:', error);
        }
      };
      
      initSession();
    }
  }, [isAuthenticated]);

  // Track page visits
  useEffect(() => {
    if (sessionIdRef.current && isAuthenticated) {
      const trackPageVisit = async () => {
        try {
          await api.post('/analytics/session/page-visit', {
            sessionId: sessionIdRef.current,
            page: location.pathname
          });
        } catch (error) {
          console.warn('Failed to track page visit:', error);
        }
      };
      
      trackPageVisit();
    }
  }, [location.pathname, isAuthenticated]);

  // End session on page unload
  useEffect(() => {
    const handleBeforeUnload = async () => {
      if (sessionIdRef.current) {
        try {
          // Use sendBeacon for more reliable tracking on page unload
          if (navigator.sendBeacon) {
            const data = JSON.stringify({ sessionId: sessionIdRef.current });
            navigator.sendBeacon('/api/analytics/session/end', data);
          } else {
            await api.post('/analytics/session/end', {
              sessionId: sessionIdRef.current
            });
          }
        } catch (error) {
          console.warn('Failed to end analytics session:', error);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Analytics tracking methods
  const trackExerciseViewed = useCallback(async (exerciseId: string) => {
    if (!sessionIdRef.current || !isAuthenticated) return;
    
    try {
      await api.post('/analytics/exercise/viewed', {
        sessionId: sessionIdRef.current,
        exerciseId
      });
    } catch (error) {
      console.warn('Failed to track exercise view:', error);
    }
  }, [isAuthenticated]);

  const trackExerciseCompleted = useCallback(async (exerciseId: string) => {
    if (!sessionIdRef.current || !isAuthenticated) return;
    
    try {
      await api.post('/analytics/exercise/completed', {
        sessionId: sessionIdRef.current,
        exerciseId
      });
    } catch (error) {
      console.warn('Failed to track exercise completion:', error);
    }
  }, [isAuthenticated]);

  const trackExerciseAborted = useCallback(async (exerciseId: string) => {
    if (!sessionIdRef.current || !isAuthenticated) return;
    
    try {
      await api.post('/analytics/exercise/aborted', {
        sessionId: sessionIdRef.current,
        exerciseId
      });
    } catch (error) {
      console.warn('Failed to track exercise abort:', error);
    }
  }, [isAuthenticated]);

  const recordHealthImpact = useCallback(async (healthData: {
    painLevel?: number;
    mobilityRating?: number;
    energyLevel?: number;
    sleepQuality?: number;
    overallWellbeing?: number;
    specificImprovements?: string[];
    concerns?: string[];
    notes?: string;
  }) => {
    if (!isAuthenticated) return;
    
    try {
      await api.post('/analytics/health-impact', healthData);
    } catch (error) {
      console.warn('Failed to record health impact:', error);
    }
  }, [isAuthenticated]);

  const getSeniorInsights = useCallback(async () => {
    if (!isAuthenticated) return null;
    
    try {
      const response = await api.get('/analytics/senior-insights');
      return response.data;
    } catch (error) {
      console.warn('Failed to get senior insights:', error);
      return null;
    }
  }, [isAuthenticated]);

  const getUserAnalytics = useCallback(async (days: number = 30) => {
    if (!isAuthenticated) return null;
    
    try {
      const response = await api.get(`/analytics/user?days=${days}`);
      return response.data;
    } catch (error) {
      console.warn('Failed to get user analytics:', error);
      return null;
    }
  }, [isAuthenticated]);

  return {
    sessionId: sessionIdRef.current,
    trackExerciseViewed,
    trackExerciseCompleted,
    trackExerciseAborted,
    recordHealthImpact,
    getSeniorInsights,
    getUserAnalytics
  };
}; 