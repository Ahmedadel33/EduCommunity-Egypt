const mongoose = require('mongoose');

// مكافأة (الأدمن بيديها لطالب أو معلم متميّز)
const rewardSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    type: { type: String, enum: ['badge', 'prize', 'honor'], default: 'badge' },
    note: { type: String, default: '' },
    givenBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

rewardSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.models.Reward || mongoose.model('Reward', rewardSchema);
