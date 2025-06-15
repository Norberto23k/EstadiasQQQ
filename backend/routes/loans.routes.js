import express from 'express';
import { getLoans, createLoan, updateLoan, deleteLoan } from '../controllers/loans.controller.js';
import { verifyToken as authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authMiddleware, getLoans);
router.post('/', authMiddleware, createLoan);
router.put('/:id', authMiddleware, updateLoan);
router.delete('/:id', authMiddleware, deleteLoan);

export default router;