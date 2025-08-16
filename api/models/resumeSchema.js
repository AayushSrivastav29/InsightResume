const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  filename: {
    type: String,
    required: true,
  },
  originalText: {
    type: String,
    required: true,
  },
  filePath: {
    type: String,
    required: true,
  },
  fileSize: {
    type: Number,
    required: true,
  },
  mimeType: {
    type: String,
    required: true,
    enum: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
  },
  extractedData: {
    skills: {
      type: [String],
      default: [],
    },
    experience: {
      type: [String],
      default: [],
    },
    education: {
      type: [String],
      default: [],
    },
    certifications: {
      type: [String],
      default: [],
    },
    summary:{
      type: [String],
      default: [],
    },
    contactInfo: {
      email: {
        type: String,
        trim: true,
        lowercase: true,
      },
      phone: {
        type: String,
        trim: true,
      },
      name: {
        type: String,
        trim: true,
      },
      address: {
        type: String,
        trim: true,
      },
    },
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Resume", resumeSchema);
