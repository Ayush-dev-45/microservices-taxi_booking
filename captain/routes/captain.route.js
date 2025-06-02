const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const captainController = require('../controllers/captain.controller');
const authMiddleware = require('../auth.middleware');

router.post('/register', captainController.registerUser);
router.post('/login', [], captainController.loginUser);
router.get('/profile', authMiddleware.captainAuth, captainController.getUserProfile);
router.get('/logout', [], authMiddleware.captainAuth, captainController.userLogout);
router.patch('/isavailable', [], authMiddleware.captainAuth, captainController.isAvailable);

module.exports = router;