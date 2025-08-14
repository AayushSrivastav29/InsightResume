const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const ForgotPasswordRequests = new mongoose.Schema(
  {
    id: {
      type: String,
      default: uuidv4,
      required: true,
      unique: true,
    },
    isActive: {
      type: Boolean,
      required: true,
      default: false,
    },
    UserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "ForgotPasswordRequests",
  ForgotPasswordRequests
);

// const { Sequelize, DataTypes } = require("sequelize");
// const sequelize = require("../utils/db-connection");
// const  uuid = require('uuid');

// const ForgotPasswordRequests = sequelize.define('ForgotPasswordRequests', {

//     id: {
//         type: DataTypes.UUID,
//         defaultValue: DataTypes.UUIDV4,
//         allowNull: false,
//         primaryKey: true
//     },
//     isActive: {
//         type: DataTypes.BOOLEAN,
//         allowNull: false,
//         defaultValue: false
//     }
// });

// module.exports = ForgotPasswordRequests;
