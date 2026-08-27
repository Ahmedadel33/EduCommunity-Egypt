const mongoose = require('mongoose');

// تاسك سوفت سكيلز (مثال: اقرأ كتاب واعمل عنه بريزنتيشن)
const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    points: { type: Number, default: 10 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

taskSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.models.SoftSkillTask || mongoose.model('SoftSkillTask', taskSchema);
