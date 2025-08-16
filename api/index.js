const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const connectDB = require('./utils/db-connection');
require('dotenv').config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

//import routes
const userRoute = require('./routes/userRoute');
const resumeRoute = require('./routes/resumeRoute');

app.use('/api/user', userRoute);
app.use('/api/resume', resumeRoute);


const PORT=process.env.PORT;

app.listen(PORT, ()=>{
    console.log(`server is running at ${PORT}`);
})