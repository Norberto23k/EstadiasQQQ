import express from 'express';
import { 
  getAllReservations,
  createReservation,
  approveReservation,
  rejectReservation,
  getReservationsByUser
} from '../controllers/reservations.controller.js';
import { verifyToken as authMiddleware } from '../middleware/auth.js';
import { adminCheck as adminMiddleware } from '../middleware/admin.js';

const router = express.Router();

router.get('/', authMiddleware, getAllReservations);
router.post('/', authMiddleware, createReservation);
router.put('/:id/approve', authMiddleware, adminMiddleware, approveReservation);
router.put('/:id/reject', authMiddleware, adminMiddleware, rejectReservation);
router.get('/user/:userId', authMiddleware, getReservationsByUser);

export default router;