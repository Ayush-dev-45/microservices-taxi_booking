const mongoose = require('mongoose');

const connectToDB = () => {
    mongoose.connect(process.env.MONGODB_URL).then(()=>{
        console.log("Connected to Database");
    }).catch(() => {
        console.error();
    })
};

module.exports = connectToDB;