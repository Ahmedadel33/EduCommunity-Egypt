const Subject = require('../models/Subject');

// ===== طبقة الخدمات (Service) للمواد الدراسية =====
// هنا كل منطق الشغل والتعامل مع الداتابيز.
// الكنترولر مابيعرفش حاجة عن Mongoose — بينادي الدوال دي بس.

// ===== عرض المواد الدراسية =====
// متاحة للجميع، وممكن نفلتر بالصف (?grade=sec-1)
async function list(query) {
  const filter = {};
  if (query.grade) filter.grade = query.grade;

  // بنرتّب بالاسم عشان القايمة تطلع مرتّبة أبجديًا قدّام الطالب
  const subjects = await Subject.find(filter).sort({ name: 1 });
  return subjects;
}

// ===== إضافة مادة دراسية =====
// التحقّق من الاسم والصف بيحصل في الـvalidator قبل ما نوصل هنا
async function create({ name, grade, description }) {
  const subject = await Subject.create({ name, grade, description });
  return subject;
}

module.exports = { list, create };
