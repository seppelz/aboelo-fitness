import express from 'express';
import {
  saveProgress,
  getUserProgress,
  getDailyProgress,
  getWeeklyProgress,
  getRecommendedExercises
} from '../controllers/progressController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Alle Routen sind geschützt (erfordern Authentifizierung)
router.post('/save', protect, saveProgress);
router.get('/user', protect, getUserProgress);
router.get('/daily', protect, getDailyProgress);
router.get('/weekly', protect, getWeeklyProgress);
router.get('/recommendations', protect, getRecommendedExercises);

export default router;
