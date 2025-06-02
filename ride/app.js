const express = require('express');
const app = express();
const rideRoutes = require('./routes/ride.route');
const dotenv = require('dotenv');
dotenv.config();
const cookieParser = require('cookie-parser');
const cors = require('cors');
const connectToDB = require('./db/db');
const rabitMQ = require('./services/rabbitMq.js');

connectToDB();
rabitMQ.connect();

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors());
app.use(cookieParser());

app.use('/', rideRoutes);

module.exports = app;


// using RabbitMQ --> microservices ke beech mein asynchronous communication ke liye queue based messenger