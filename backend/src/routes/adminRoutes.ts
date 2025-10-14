import express from 'express';
import { protect, admin } from '../middleware/authMiddleware';
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getDailyAnalytics,
} from '../controllers/adminController';
import { validateRequest } from '../middleware/validationMiddleware';
import {
  createAdminUserValidation,
  updateAdminUserValidation,
  deleteAdminUserValidation,
  analyticsQueryValidation,
} from '../validators/adminValidators';

const router = express.Router();

router.use(protect, admin);

router.get('/users', getUsers);
router.post('/users', createAdminUserValidation, validateRequest, createUser);
router.put('/users/:id', updateAdminUserValidation, validateRequest, updateUser);
router.delete('/users/:id', deleteAdminUserValidation, validateRequest, deleteUser);

router.get('/analytics/daily', analyticsQueryValidation, validateRequest, getDailyAnalytics);

export default router;
