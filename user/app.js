const express = require('express');
const app = express();
const userRoutes = require('./routes/user.route');
const dotenv = require('dotenv');
dotenv.config();
const cookieParser = require('cookie-parser');
const cors = require('cors');
const connectToDB = require('./db/db');

connectToDB();

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors());
app.use(cookieParser());

app.use('/', userRoutes);

module.exports = app;