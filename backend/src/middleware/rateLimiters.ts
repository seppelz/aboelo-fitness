import rateLimit from 'express-rate-limit';
import { rateLimitConfig } from '../config/env';

export const loginLimiter = rateLimit({
  windowMs: rateLimitConfig.login.windowMs,
  max: rateLimitConfig.login.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Zu viele Login-Versuche. Bitte versuchen Sie es später erneut.',
  },
});
