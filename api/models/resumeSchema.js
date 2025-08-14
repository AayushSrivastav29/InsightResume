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
    contactInfo: {
      type: Object,
      default: {},
    },
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Resume", resumeSchema);
