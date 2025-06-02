const jwt = require('jsonwebtoken');
const axios = require('axios');

module.exports.authUser = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
        if(!token){
            return res.status(400).json("Invalid auth");
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const response = await axios.get(`${BASE_URL}/user/profile`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        const user = response.data;
        if(!user) return res.status(400).json({msg: "User not found"});
        req.user = user;
        return next();
    } catch (error) {
        return res.status(500).json({ msg: "Authentication failed: Server Error", error: error.message });
    }
}