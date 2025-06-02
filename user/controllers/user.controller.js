const blackListModel = require('../models/blacklist.model');
const userModel = require('../models/user.model');
const { validationResult } = require('express-validator');
const { subscribeToQueue } = require('../services/rabbitMq');

const acceptedRides = [];

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
    const user = req.user;
    return res.status(201).json(user);
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

module.exports.acceptedRide = async (req, res, next) => {
    //long polling
    req.setTimeout(30000, ()=>{
        res.send(204).end();
    })
    acceptedRides.push(res);
}

subscribeToQueue("ride-accept", (data)=>{
    const acceptedRide = JSON.parse(data);
    acceptedRides.forEach(res => {
        res.json(acceptedRide);
    });
    acceptedRides.length = 0;
});