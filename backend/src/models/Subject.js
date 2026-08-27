const mongoose = require('mongoose');

// المادة الدراسية (مثال: رياضيات — الصف الأول الثانوي)
const subjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    grade: { type: String, required: true }, // مثل: sec-1
    description: { type: String, default: '' },
    icon: { type: String, default: 'book' },
  },
  { timestamps: true }
);

subjectSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.models.Subject || mongoose.model('Subject', subjectSchema);
