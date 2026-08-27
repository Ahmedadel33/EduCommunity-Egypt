const mongoose = require('mongoose');

// تسليم الطالب لتاسك (بيرفع بريزنتيشن، والمعلم يديله درجة)
const submissionSchema = new mongoose.Schema(
  {
    task: { type: mongoose.Schema.Types.ObjectId, ref: 'SoftSkillTask', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fileUrl: { type: String, required: true }, // ملف البريزنتيشن المرفوع
    grade: { type: Number, default: null },    // الدرجة (فاضية لحد ما المعلم يصحّح)
    feedback: { type: String, default: '' },
  },
  { timestamps: true }
);

submissionSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.models.Submission || mongoose.model('Submission', submissionSchema);
