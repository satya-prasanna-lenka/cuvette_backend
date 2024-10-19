const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema({
  createdBy: {
    type: String,
    required: true,
  },
  jobTitle: {
    type: String,
    required: true,
  },
  jobDescription: {
    type: String,
    required: true,
  },
  experienceLevel: {
    type: String,

    required: true,
  },
  candidates: [
    {
      email: {
        type: String,
        required: true,
      },
    },
  ],
  endDate: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Interview", interviewSchema);
