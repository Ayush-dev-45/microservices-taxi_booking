const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const userController = require('../controllers/user.controller');
const authMiddleware = require('../auth.middleware');

router.post('/register', userController.registerUser);
router.post('/login', [], userController.loginUser);
router.get('/profile', authMiddleware.userAuth, userController.getUserProfile);
router.get('/logout', [], authMiddleware.userAuth, userController.userLogout);

module.exports = router;