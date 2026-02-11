const express = require('express');
const transactionController = require('../controllers/transactionController');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

router.get('/', authMiddleware, transactionController.getTransactions);
router.get('/treasury', authMiddleware, transactionController.getTreasury);
router.get('/history', authMiddleware, transactionController.getTreasuryHistory);
router.get('/breakdown', authMiddleware, transactionController.getExpenseBreakdown);
router.get('/profit-per-dish', authMiddleware, transactionController.getProfitPerDish);

module.exports = router;
