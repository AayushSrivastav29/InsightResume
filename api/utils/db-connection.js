const mongoose = require("mongoose");
require("dotenv").config();
const uri = process.env.DB_URI;

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log("Already connected to mongoDB");
    return;
  }
  try {
    const connect = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    isConnected = true;
    console.log(`mongoDB connected: ${connect.connection.host}`);
  } catch (error) {
    console.log("Mongodb connection error:", error.message);
  }
};

module.exports = connectDB;
