const mongoose = require('mongoose');

// شيفت المدرس: فترة (مثلاً ساعتين) يكون فيها مدرس مناوب لمادة معينة
// عشان الطالب يلاقي مدرس متاح يسأله في أي وقت
const shiftSchema = new mongoose.Schema(
  {
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: String, required: true }, // اسم المادة (فيزياء، رياضيات...)
    startsAt: { type: Date, required: true },
    endsAt: { type: Date, required: true },
  },
  { timestamps: true }
);

shiftSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.models.Shift || mongoose.model('Shift', shiftSchema);
