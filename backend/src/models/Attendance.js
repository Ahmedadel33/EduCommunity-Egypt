const mongoose = require('mongoose');

// حضور المدرس: كل جلسة دخول (وقت الدخول والخروج والمدة)
// الأدمن بيشوفها ويحسب وقت المدرس، وتدخل في تقييمه
const attendanceSchema = new mongoose.Schema(
  {
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    loginAt: { type: Date, required: true },
    logoutAt: { type: Date, default: null },
    durationMinutes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

attendanceSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.models.Attendance || mongoose.model('Attendance', attendanceSchema);
