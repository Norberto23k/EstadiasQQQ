const express = require('express');
const router = express.Router();
const reservationsController = require('../controllers/reservations.controller');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

router.get('/', authMiddleware, reservationsController.getAllReservations);
router.post('/', authMiddleware, reservationsController.createReservation);
router.put('/:id/approve', authMiddleware, adminMiddleware, reservationsController.approveReservation);
router.put('/:id/reject', authMiddleware, adminMiddleware, reservationsController.rejectReservation);
router.get('/user/:userId', authMiddleware, reservationsController.getReservationsByUser);

export default router;