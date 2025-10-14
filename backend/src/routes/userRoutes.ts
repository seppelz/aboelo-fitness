import express from 'express';
import { 
  registerUser, 
  loginUser, 
  getUserProfile, 
  updateUserProfile,
  updateUserProgress,
  updateDailyStreak,
  resetUserProgress,
  logoutUser
} from '../controllers/userController';
import { protect } from '../middleware/authMiddleware';
import { loginLimiter } from '../middleware/rateLimiters';
import { validateRequest } from '../middleware/validationMiddleware';
import { loginValidationRules, registerValidationRules } from '../validators/authValidators';

const router = express.Router();

// Öffentliche Routen
router.post('/register', registerValidationRules, validateRequest, registerUser);
router.post('/login', loginLimiter, loginValidationRules, validateRequest, loginUser);
router.post('/logout', protect, logoutUser);

// Geschützte Routen
router.get('/profile', protect, getUserProfile);
router.get('/me', protect, getUserProfile); // Alias for profile
router.put('/profile', protect, updateUserProfile);
router.put('/progress', protect, updateUserProgress);
router.put('/streak', protect, updateDailyStreak);
router.post('/reset-progress', protect, resetUserProgress);

export default router;
