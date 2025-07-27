import express from 'express';
import { protect } from '../middleware/authMiddleware';
import {
  startSession,
  endSession,
  trackPageVisit,
  trackExerciseViewed,
  trackExerciseCompleted,
  trackExerciseAborted,
  recordHealthImpact,
  getDashboardAnalytics,
  getUserAnalytics,
  getSeniorInsights
} from '../controllers/analyticsController';

const router = express.Router();

// Session tracking
router.post('/session/start', protect, startSession);
router.post('/session/end', protect, endSession);
router.post('/session/page-visit', protect, trackPageVisit);

// Exercise tracking
router.post('/exercise/viewed', protect, trackExerciseViewed);
router.post('/exercise/completed', protect, trackExerciseCompleted);
router.post('/exercise/aborted', protect, trackExerciseAborted);

// Health impact tracking
router.post('/health-impact', protect, recordHealthImpact);

// Analytics retrieval
router.get('/dashboard', protect, getDashboardAnalytics); // Admin only (checked in controller)
router.get('/user', protect, getUserAnalytics);
router.get('/senior-insights', protect, getSeniorInsights);

export default router; 