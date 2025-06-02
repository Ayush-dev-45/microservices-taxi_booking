const rideModel = require('../models/ride.model');
const {publishToQueue} = require('../services/rabbitMq');

module.exports.createRide = async (req, res, next) => {
    const {pickup, destination} = req.body;
    const newRide = await rideModel.create({
        user: req.user._id,
        pickup,
        destination
    });
    await newRide.save();
    publishToQueue('new-ride', JSON.stringify(newRide));
    console.log(newRide);
    
    return res.status(201).json(newRide);
};

module.exports.acceptRide = async (req, res, next) => {
    const {rideId} = req.query;
    const ride = await rideModel.findById(rideId);
    if(!ride) return res.status(401).json({msg: "Ride not found"});
    ride.status = 'accepted';
    await ride.save();
    publishToQueue("ride-accept", JSON.stringify(ride));
    res.status(201).json(ride);
}