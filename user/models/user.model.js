const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
    fullName: {
        firstName: {
            type: String,
            required: true,
            minlength: 3
        },
        lastName: {
            type: String,
            required: true
        },
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        minlength: 6,
        required: true,
        select: false
    },
    socketId: {
        type: String
    }
});

UserSchema.methods.generateAuthToken = function() {
    const token = jwt.sign({_id: this._id}, process.env.JWT_SECRET, {expiresIn: '24h'});
    return token;
}

UserSchema.methods.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password);  
}

UserSchema.statics.hashPassword = async function(password) {
    return await bcrypt.hash(password, 10);
}

module.exports = mongoose.model('user', UserSchema);