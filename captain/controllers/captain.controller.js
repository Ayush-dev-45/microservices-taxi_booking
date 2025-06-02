const blackListModel = require('../models/blacklist.model');
const captainModel = require('../models/captain.model');
const userModel = require('../models/captain.model');
const { validationResult } = require('express-validator');
const { subscribeToQueue } = require('../services/rabbitMq');

const pendingReq = [];

module.exports.registerUser = async (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        console.log(errors);
        throw new Error('Invalid Inputs');
    }
    const { fullName, email, password } = req.body;
    console.log(fullName, email, password);
    
    try {
        const isUserExist = await userModel.findOne({email});
    if(isUserExist) {
        return res.status(400).json({message: 'User Already Exists'});
    }
    const hashedPassword = await userModel.hashPassword(password);
    const newUser = new userModel({
        fullName: {
            firstName: fullName.firstName,
            lastName: fullName.lastName
        },
        email,
        password: hashedPassword
    });
    await newUser.save();
    const token = newUser.generateAuthToken();
    res.cookie('token', token);
    delete newUser._doc.password;
    return res.status(201).json({token, newUser});
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: 'Internal Server Error'});
    }
};

module.exports.loginUser = async (req, res, next) => {
    const {email, password} = req.body;
    try {
        const user = await userModel.findOne({email}).select('+password');
        if(!user){
            return res.status(401).json({msg: "Invalid Username or password"});
        }
        
        const isPasswordMatch = await user.comparePassword(password);
        if(!isPasswordMatch){
            return res.status(401).json({msg: "Invalid  password"});
        }
        const token = await user.generateAuthToken();
        res.cookie('token', token);
        delete user._doc.password;
        return res.status(201).json({token, user});
    } catch (error) {
        console.log(error);
        
        return res.status(500).json({message: 'Internal Server Error'});
    }
}

module.exports.getUserProfile = async (req, res, next) => {
    const captain = req.captain;
    return res.status(201).json(captain);
}

module.exports.userLogout = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
        if(!token) return res.status(401).json({msg: "user not found"})
        res.clearCookie(token);
        await blackListModel.create({token});
        return res.status(201).json({msg: "User logged out successfully"});
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: 'Internal Server Error'});
    }
}

module.exports.isAvailable = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
        if(!token) return res.status(400).json("Unauthorized");
        const captain = await captainModel.findById(req.captain._id);
        captain.isAvailable = !captain.isAvailable;
        await captain.save();
        return res.status(201).json(captain);
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: 'Internal Server Error'});
    }
}

module.exports.waitForNewRide = async (req, res, next) => {
    //set time out for long polling
    req.setTimeout(30000, () => {
        res.send(204).end();
    });
    pendingReq.push(res); //push res to pendingRequests
};

subscribeToQueue("new-ride", (data)=>{
    const rideData = JSON.parse(data);
    pendingReq.forEach(res =>{
        res.json(rideData);
    })
    //console.log(JSON.parse(data));
    pendingReq.length = 0;
})