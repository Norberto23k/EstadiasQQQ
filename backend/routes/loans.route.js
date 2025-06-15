const express = require('express');
const router = express.Router();
const loansController = require('../controllers/loans.controller');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, loansController.getLoans);
router.post('/', authMiddleware, loansController.createLoan);
router.put('/:id', authMiddleware, loansController.updateLoan);
router.delete('/:id', authMiddleware, loansController.deleteLoan);

module.exports = router;