const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const connectDB = require('./utils/db-connection');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

connectDB();


//import routes
const userRoute = require('./routes/userRoute');
const resumeRoute = require('./routes/resumeRoute');
const analysisRoute = require('./routes/analysisRoute');

app.use('/api/user', userRoute);
app.use('/api/resume', resumeRoute);
app.use('/api/analyse', analysisRoute);


const PORT=process.env.PORT;

app.listen(PORT, ()=>{
    console.log(`server is running at ${PORT}`);
})