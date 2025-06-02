const rideModel = require('../models/ride.model');

module.exports.createRide = async (req, res, next) => {
    const {pickup, destination} = req.body;
    const newRide = rideModel.create({
        user: req.user._id,
        pickup,
        destination
    });
    await newRide.save();
}