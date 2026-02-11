const express = require('express');
const ingredientStockController = require('../controllers/ingredientStockController');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

router.get('/stock', authMiddleware, ingredientStockController.getUserStock);
router.post('/purchase', authMiddleware, ingredientStockController.purchaseIngredient);

module.exports = router;
