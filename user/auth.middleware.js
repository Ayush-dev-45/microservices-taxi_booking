const userModel = require('./models/user.model');
const jwt = require('jsonwebtoken');
const blackListModel = require('./models/blacklist.model');

module.exports.userAuth = async (req, res, next) => {
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
        const user = await userModel.findOne({_id: decoded._id});
        if(!user){
            return res.status(400).json({msg: "Invalid user"});
        } 
        req.user = user;
        return next();
    } catch (error) {
        console.log(error);
        throw res.status(500).json("Internal Server Error")
    }
}