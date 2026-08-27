const mongoose = require('mongoose');

// شكل بيانات المستخدم في قاعدة البيانات
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['student', 'teacher', 'admin', 'supervisor'],
      default: 'student',
    },
    grade: String,        // الصف الدراسي (للطالب)
    subject: String,      // تخصّص المدرس (فيزياء / رياضيات ...) — للمدرس فقط
    schoolCode: String,   // كود المدرسة
    nationalId: String,   // الرقم القومي
    bio: { type: String, default: '' },   // نبذة تعريفية (من صفحة الإعدادات)
    points: { type: Number, default: 0 },
    badges: { type: [String], default: [] },

    // ===== تفضيلات المستخدم (من صفحة الإعدادات: إشعارات/خصوصية/لغة ومظهر) =====
    // بنخزّنها كلها في object واحد عشان صفحة الإعدادات تحفظها وترجّعها بسهولة.
    preferences: {
      notifications: {
        newMaterial:  { type: Boolean, default: true },
        liveLesson:   { type: Boolean, default: true },
        challenges:   { type: Boolean, default: true },
        rewards:      { type: Boolean, default: true },
        chat:         { type: Boolean, default: false },
        weeklyDigest: { type: Boolean, default: true },
      },
      privacy: {
        showProfile:   { type: Boolean, default: true },
        showPoints:    { type: Boolean, default: true },
        showBadges:    { type: Boolean, default: true },
        allowMessages: { type: Boolean, default: false },
        dataAnalytics: { type: Boolean, default: true },
      },
      language: { type: String, default: 'ar' },     // ar | en
      theme:    { type: String, default: 'light' },  // light | dark | system
      fontSize: { type: String, default: 'medium' }, // small | medium | large
    },
  },
  { timestamps: true } // يضيف createdAt و updatedAt تلقائياً
);

// لما نحوّل المستخدم لـ JSON: نخلي id بدل _id ونشيل كلمة المرور (عشان الأمان)
userSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret.password;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
