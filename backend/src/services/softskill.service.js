const SoftSkillTask = require('../models/SoftSkillTask');
const Submission = require('../models/Submission');
const ApiError = require('../utils/ApiError');

// ===== طبقة الخدمات (Service) للسوفت سكيلز =====
// هنا كل منطق الشغل والتعامل مع الداتابيز.
// الكنترولر مابيعرفش حاجة عن Mongoose — بينادي الدوال دي بس.

// ===== عرض كل التاسكات =====
// متاحة للجميع (حتى من غير تسجيل دخول) عشان الطالب يشوف المطلوب منه.
async function listTasks(user) {
  // populate عشان نرجّع اسم اللي عمل التاسك مش الـid بتاعه بس
  // وبنرتّب بالأحدث الأول عشان الجديد يبان فوق
  const filter = {};
  if (user?.role === 'teacher') {
    const teacher = await require('../models/User').findById(user.id).select('subject');
    filter.subject = teacher?.subject;
  }
  const tasks = await SoftSkillTask.find(filter)
    .populate('createdBy', 'name')
    .sort({ createdAt: -1 });

  return tasks;
}

// ===== إنشاء تاسك =====
// التحقّق من العنوان بيحصل في الـvalidator قبل ما نوصل هنا
async function createTask({ title, description, points, subject }, userId) {
  const creator = await require('../models/User').findById(userId).select('role subject');
  if (!creator) throw new ApiError(404, 'المستخدم غير موجود');
  if (creator.role === 'teacher' && creator.subject !== subject) {
    throw new ApiError(403, 'يمكنك إنشاء مهام في تخصصك فقط');
  }
  if (!subject) throw new ApiError(400, 'المادة مطلوبة');
  const task = await SoftSkillTask.create({
    title,
    description,
    points: points || 10, // لو المعلم مابعتش نقاط، التاسك بـ10 بشكل افتراضي
    subject,
    createdBy: userId,
  });

  return task;
}

// ===== الطالب يرفع بريزنتيشن لتاسك =====
// الـfileUrl بييجي جاهز من الكنترولر (بعد ما الميدلوير رفع الملف).
async function submitTask(taskId, studentId, fileUrl) {
  // من غير ملف مفيش تسليم — ده أساس التاسك
  if (!fileUrl) throw new ApiError(400, 'ارفع ملف البريزنتيشن');
  const task = await SoftSkillTask.findById(taskId).select('_id');
  if (!task) throw new ApiError(404, 'التاسك غير موجود');

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
  if (user.role === 'teacher') {
    const teacher = await require('../models/User').findById(user.id).select('subject');
    const teacherTasks = await SoftSkillTask.find({
      $or: [{ subject: teacher?.subject }, { createdBy: user.id, subject: { $exists: false } }],
    }).select('_id');
    filter.task = { $in: teacherTasks.map((task) => task._id) };
  }

  // فلتر اختياري: تسليمات تاسك معيّن (?task=...)
  if (query.task) {
    if (filter.task?.$in && !filter.task.$in.some((taskId) => String(taskId) === String(query.task))) return [];
    filter.task = query.task;
  }

  const submissions = await Submission.find(filter)
    .populate('student', 'name')
    .populate('task', 'title points')
    .sort({ createdAt: -1 });

  return submissions;
}

// ===== المعلم يصحّح ويدّي درجة =====
async function gradeSubmission(submissionId, { grade, feedback }, user) {
  // new: true عشان يرجّع النسخة بعد التعديل مش قبله
  const submission = await Submission.findById(submissionId).populate('task', 'subject createdBy points');

  if (!submission) throw new ApiError(404, 'التسليم غير موجود');
  const teacher = await require('../models/User').findById(user.id).select('role subject');
  if (teacher?.role === 'teacher' && submission.task?.subject !== teacher.subject && String(submission.task?.createdBy) !== String(user.id)) {
    throw new ApiError(403, 'لا يمكنك تقييم مهمة خارج تخصصك');
  }
  submission.grade = grade;
  submission.feedback = feedback;
  await submission.save();

  return submission;
}

module.exports = { listTasks, createTask, submitTask, listSubmissions, gradeSubmission };
