const mongoose = require('mongoose');

const challengeSubmissionSchema = new mongoose.Schema({
  challengeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Challenge',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  answer: {
    type: String,
  },
  score: {
    type: Number,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

// Enforce unique submissions per user per challenge
challengeSubmissionSchema.index({ challengeId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('ChallengeSubmission', challengeSubmissionSchema);
