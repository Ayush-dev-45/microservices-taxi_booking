const mongoose = require('mongoose');

const connectToDB = () => {
    mongoose.connect(process.env.MONGODB_URL, {}).then(() =>{
        console.log('Connected to MongoDB')  
    }).catch(()=>{
        console.log('Error connecting to MongoDB');
    });
};

module.exports = connectToDB;