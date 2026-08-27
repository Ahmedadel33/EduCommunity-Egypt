const mongoose = require('mongoose');

// درس أونلاين (المعلم بيحدّد موعد ورابط اجتماع Jitsi)
const lessonSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    grade: { type: String, required: true },
    subject: { type: String, default: '' },
    startsAt: { type: Date, required: true },  // موعد الدرس
    meetingUrl: { type: String, required: true }, // رابط غرفة الفيديو
    description: { type: String, default: '' },
  },
  { timestamps: true }
);

lessonSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.models.Lesson || mongoose.model('Lesson', lessonSchema);
