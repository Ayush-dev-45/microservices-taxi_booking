const mongoose = require('mongoose');

const RideSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    captain: {
        type: mongoose.Schema.Types.ObjectId,
    },
    pickup: {
        type: String,
        required: true
    },
    destination: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['requested', 'accepted', 'started', 'completed'],
        default: 'requested'
    }
});

module.exports = mongoose.model('ride', RideSchema);