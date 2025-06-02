const captainModel = require('./models/captain.model');
const jwt = require('jsonwebtoken');
const blackListModel = require('./models/blacklist.model');

module.exports.captainAuth = async (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    if(!token){
        return res.status(400).json({msg:"Login first"});
    }
    const isBlackList = await blackListModel.findOne({token: token});
    if(isBlackList){
        return res.status(400).json({msg:"Invalid user"});
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const captain = await captainModel.findOne({_id: decoded._id});
        if(!captain){
            return res.status(400).json({msg: "Invalid user"});
        } 
        req.captain = captain;
        return next();
    } catch (error) {
        console.log(error);
        throw res.status(500).json("Internal Server Error")
    }
}