const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const rideController = require('../controllers/ride.controller');

router.post('/creat-ride', authMiddleware.authUser, rideController.createRide);

module.exports = router;