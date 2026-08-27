const SoftSkillTask = require('../models/SoftSkillTask');
const Submission = require('../models/Submission');
const ApiError = require('../utils/ApiError');

// ===== طبقة الخدمات (Service) للسوفت سكيلز =====
// هنا كل منطق الشغل والتعامل مع الداتابيز.
// الكنترولر مابيعرفش حاجة عن Mongoose — بينادي الدوال دي بس.

// ===== عرض كل التاسكات =====
// متاحة للجميع (حتى من غير تسجيل دخول) عشان الطالب يشوف المطلوب منه.
async function listTasks() {
  // populate عشان نرجّع اسم اللي عمل التاسك مش الـid بتاعه بس
  // وبنرتّب بالأحدث الأول عشان الجديد يبان فوق
  const tasks = await SoftSkillTask.find()
    .populate('createdBy', 'name')
    .sort({ createdAt: -1 });

  return tasks;
}

// ===== إنشاء تاسك =====
// التحقّق من العنوان بيحصل في الـvalidator قبل ما نوصل هنا
async function createTask({ title, description, points }, userId) {
  const task = await SoftSkillTask.create({
    title,
    description,
    points: points || 10, // لو المعلم مابعتش نقاط، التاسك بـ10 بشكل افتراضي
    createdBy: userId,
  });

  return task;
}

// ===== الطالب يرفع بريزنتيشن لتاسك =====
// الـfileUrl بييجي جاهز من الكنترولر (بعد ما الميدلوير رفع الملف).
async function submitTask(taskId, studentId, fileUrl) {
  // من غير ملف مفيش تسليم — ده أساس التاسك
  if (!fileUrl) throw new ApiError(400, 'ارفع ملف البريزنتيشن');

  const submission = await Submission.create({
    task: taskId,
    student: studentId,
    fileUrl,
  });

  return submission;
}

// ===== عرض التسليمات =====
// الطالب يشوف تسليماته هو بس · المعلم/الأدمن يشوفوا كل التسليمات.
// بناخد الـuser كامل عشان نقرا الدور والـid ونبني الفلتر عليهم.
async function listSubmissions(user, query) {
  const filter = {};

  // الفلتر ده مهم: من غيره الطالب هيشوف تسليمات زمايله
  if (user.role === 'student') filter.student = user.id;

  // فلتر اختياري: تسليمات تاسك معيّن (?task=...)
  if (query.task) filter.task = query.task;

  const submissions = await Submission.find(filter)
    .populate('student', 'name')
    .populate('task', 'title points')
    .sort({ createdAt: -1 });

  return submissions;
}

// ===== المعلم يصحّح ويدّي درجة =====
async function gradeSubmission(submissionId, { grade, feedback }) {
  // new: true عشان يرجّع النسخة بعد التعديل مش قبله
  const submission = await Submission.findByIdAndUpdate(
    submissionId,
    { grade, feedback },
    { new: true }
  );

  if (!submission) throw new ApiError(404, 'التسليم غير موجود');

  return submission;
}

module.exports = { listTasks, createTask, submitTask, listSubmissions, gradeSubmission };
