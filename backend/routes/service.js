const express = require('express');
const serviceController = require('../controllers/serviceController');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// All routes are protected
router.get('/state', authMiddleware, serviceController.getServiceState);
router.post('/start', authMiddleware, serviceController.startService);
router.post('/stop', authMiddleware, serviceController.stopService);
router.post('/serve', authMiddleware, serviceController.serveOrder);
router.get('/discovered', authMiddleware, serviceController.getDiscoveredRecipeIds);

module.exports = router;
