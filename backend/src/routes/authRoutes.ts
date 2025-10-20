import express from 'express';
import { requestPasswordReset, resetPassword } from '../controllers/userController';
import { passwordResetLimiter } from '../middleware/rateLimiters';
import { validateRequest } from '../middleware/validationMiddleware';
import { forgotPasswordValidationRules, resetPasswordValidationRules } from '../validators/authValidators';

const router = express.Router();

router.post(
  '/forgot-password',
  passwordResetLimiter,
  forgotPasswordValidationRules,
  validateRequest,
  requestPasswordReset,
);

router.post(
  '/reset-password',
  passwordResetLimiter,
  resetPasswordValidationRules,
  validateRequest,
  resetPassword,
);

export default router;
