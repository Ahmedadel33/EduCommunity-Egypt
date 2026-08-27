const mongoose = require('mongoose');

// المادة التعليمية: ملف PDF أو فيديو أو صورة توضيحية مرتبطة بمادة وصف
const materialSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    grade: { type: String, required: true },
    type: { type: String, enum: ['pdf', 'video', 'graphic'], required: true },
    fileUrl: { type: String, required: true },       // رابط الملف أو الفيديو
    isNextGrade: { type: Boolean, default: false },  // مادة الصف التالي (للإجازة)
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    // مصدر المادة: 'ministry' = مادة الوزارة (يرفعها الأدمن) · 'teacher' = مادة توضيحية (يرفعها المدرس)
    source: { type: String, enum: ['ministry', 'teacher'], default: 'teacher' },
    // حالة المادة: مواد الأدمن معتمدة فورًا، ومواد المدرس تفضل pending لحد ما الأدمن يوافق
    status: { type: String, enum: ['approved', 'pending'], default: 'approved' },
  },
  { timestamps: true }
);

materialSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.models.Material || mongoose.model('Material', materialSchema);
