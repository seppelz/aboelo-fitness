import express from 'express';
import {
  getAllExercises,
  getExerciseById,
  getExerciseByVideoId,
  getExercisesByMuscleGroup,
  getExercisesBySittingStatus,
  getExercisesByCategory,
  getExercisesByTheraband,
  getExercisesByDynamic,
  getExercisesByUnilateral,
  createExercise,
  updateExercise,
  deleteExercise
} from '../controllers/exerciseController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

// Öffentliche Routen
router.get('/', getAllExercises);
router.get('/video/:videoId', getExerciseByVideoId);
router.get('/id/:id', getExerciseById);
router.get('/muscle-group/:muscleGroup', getExercisesByMuscleGroup);
router.get('/sitting/:isSitting', getExercisesBySittingStatus);
router.get('/category/:category', getExercisesByCategory);
router.get('/theraband/:usesTheraband', getExercisesByTheraband);
router.get('/dynamic/:isDynamic', getExercisesByDynamic);
router.get('/unilateral/:isUnilateral', getExercisesByUnilateral);

// Admin-Routen (geschützt)
router.post('/', protect, admin, createExercise);
router.put('/:id', protect, admin, updateExercise);
router.delete('/:id', protect, admin, deleteExercise);

export default router;
