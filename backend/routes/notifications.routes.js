const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const authMiddleware = require('../middleware/auth');

router.get('/user/:userId', authMiddleware, notificationController.getUserNotifications);
router.post('/user/:userId', authMiddleware, notificationController.sendToUser);
router.post('/admins', authMiddleware, notificationController.sendToAdmins);

export default router;