const Lesson = require('../models/Lesson');
const ApiError = require('../utils/ApiError');

// ===== طبقة الخدمات (Service) =====
// هنا كل منطق الشغل والتعامل مع الداتابيز.
// الكنترولر مابيعرفش حاجة عن Mongoose — بينادي الدوال دي بس.

// ===== عرض الدروس (ممكن نفلتر بالصف) =====
async function list(query) {
  const filter = {};
  if (query.grade) filter.grade = query.grade; // الفلتر اختياري — من غيره بنجيب كل الدروس

  const lessons = await Lesson.find(filter)
    .populate('teacher', 'name') // نجيب اسم المدرّس بس مش بياناته كلها
    .sort({ startsAt: 1 });      // الأقرب موعداً أولاً

  return lessons;
}

// ===== إنشاء درس (للمعلم أو الأدمن) =====
async function create(data, teacherId) {
  const { title, grade, subject, startsAt, description } = data;

  // نعمل رابط غرفة Jitsi فريد (Jitsi مجاني ومفيش تسجيل)
  // بنستخدم الوقت الحالي عشان كل درس ياخد رابط لوحده
  const meetingUrl = 'https://meet.jit.si/edu-' + Date.now();

  const lesson = await Lesson.create({
    title,
    grade,
    subject,
    startsAt,
    description,
    meetingUrl,
    teacher: teacherId, // صاحب الدرس = اللي عمله
  });

  return lesson;
}

// ===== حذف درس (صاحبه أو الأدمن) =====
// بناخد المستخدم كله مش الـid بس، عشان محتاجين نعرف دوره كمان.
async function remove(lessonId, user) {
  const lesson = await Lesson.findById(lessonId);
  if (!lesson) throw new ApiError(404, 'الدرس غير موجود');

  // الأدمن بيحذف أي درس، والمدرّس بيحذف دروسه هو بس
  if (user.role !== 'admin' && String(lesson.teacher) !== user.id) {
    throw new ApiError(403, 'لا يمكنك حذف درس غيرك');
  }

  await lesson.deleteOne();
}

module.exports = { list, create, remove };
