const express = require('express');
const labController = require('../controllers/labController');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Protected routes - require JWT token
router.post('/experiment', authMiddleware, labController.experimentAndMatch);
router.get('/recipes/all', authMiddleware, labController.getAllRecipes);
router.get('/recipes/my', authMiddleware, labController.getUserRecipes);

module.exports = router;
