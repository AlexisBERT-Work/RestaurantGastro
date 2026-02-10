const express = require('express');
const ingredientController = require('../controllers/ingredientController');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

router.get('/', authMiddleware, ingredientController.getAllIngredients);
router.post('/', authMiddleware, ingredientController.addIngredient);

module.exports = router;
