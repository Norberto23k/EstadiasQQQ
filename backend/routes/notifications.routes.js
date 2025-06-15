import express from 'express';
import { 
  getNotifications,
  markAsRead 
} from '../controllers/notifications.controller.js';
import { verifyToken as authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/user/:userId', authMiddleware, getNotifications);
router.post('/user/:userId', authMiddleware,);
router.post('/admins', authMiddleware, );

export default router;