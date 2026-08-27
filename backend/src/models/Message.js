const mongoose = require('mongoose');

// رسالة في الشات — نص و/أو مرفق (صوت / صورة / ملف)
const messageSchema = new mongoose.Schema(
  {
    room: { type: String, required: true }, // اسم الغرفة (بنستخدم الصف كغرفة، مثل sec-1)
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, default: '' },    // النص (ممكن يكون فاضي لو رسالة مرفق بس)

    // نوع الرسالة: نص عادي · تسجيل صوتي · صورة · ملف
    kind: { type: String, enum: ['text', 'voice', 'image', 'file'], default: 'text' },
    attachmentUrl: { type: String, default: '' },   // رابط المرفق
    attachmentName: { type: String, default: '' },   // اسم الملف الأصلي
    attachmentType: { type: String, default: '' },   // نوع الملف (mime)
  },
  { timestamps: true }
);

messageSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.models.Message || mongoose.model('Message', messageSchema);
