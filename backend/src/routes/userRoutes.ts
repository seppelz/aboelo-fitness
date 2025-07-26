import express from 'express';
import { 
  registerUser, 
  loginUser, 
  getUserProfile, 
  updateUserProfile,
  updateUserProgress,
  updateDailyStreak,
  resetUserProgress
} from '../controllers/userController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Öffentliche Routen
router.post('/register', registerUser);
router.post('/login', loginUser);

// Geschützte Routen
router.get('/profile', protect, getUserProfile);
router.get('/me', protect, getUserProfile); // Alias for profile
router.put('/profile', protect, updateUserProfile);
router.put('/progress', protect, updateUserProgress);
router.put('/streak', protect, updateDailyStreak);
router.post('/reset-progress', protect, resetUserProgress);

export default router;
