import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { subscribeToPush, unsubscribeFromPush, sendTestPush } from '../controllers/pushController';

const router = express.Router();

router.post('/subscribe', protect, subscribeToPush);
router.post('/unsubscribe', protect, unsubscribeFromPush);
router.post('/test', protect, sendTestPush);

export default router;
