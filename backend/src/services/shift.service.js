const Shift = require('../models/Shift');

// ===== طبقة الخدمات (Service) للشيفتات =====
// هنا كل منطق الشغل والتعامل مع الداتابيز.
// الكنترولر مابيعرفش حاجة عن Mongoose — بينادي الدوال دي بس.
//
// الشيفت ده جدول نوبتجية: كل مادة ليها مدرس مناوب في فترة زمنية محددة،
// عشان الطالب في أي وقت يلاقي حد يسأله بدل ما يستنى.

// ===== عرض كل الشيفتات (ممكن نفلتر بالمادة) =====
async function list(query) {
  const filter = {};
  if (query.subject) filter.subject = query.subject; // الفلتر اختياري — من غيره بنجيب كل الشيفتات

  const shifts = await Shift.find(filter)
    .populate('teacher', 'name') // نجيب اسم المدرّس بس مش بياناته كلها
    .sort({ startsAt: 1 });      // الأقرب موعداً أولاً

  return shifts;
}

// ===== المدرسون المناوبون دلوقتي =====
// يعني الشيفتات اللي الوقت الحالي واقع جوّاها: startsAt <= الآن <= endsAt
async function listNow(query) {
  const now = new Date();
  const filter = { startsAt: { $lte: now }, endsAt: { $gte: now } };
  if (query.subject) filter.subject = query.subject; // لو الطالب عايز مادة معينة

  const shifts = await Shift.find(filter).populate('teacher', 'name');
  return shifts; // المدرسون المتاحون الآن
}

// ===== إنشاء شيفت =====
// بناخد المستخدم كله مش الـid بس، عشان محتاجين نعرف دوره كمان.
async function create({ subject, startsAt, endsAt, teacher }, user) {
  // الأدمن ممكن يعيّن أي مدرس، والمدرس يسجّل لنفسه هو بس
  const teacherId = user.role === 'admin' && teacher ? teacher : user.id;

  const shift = await Shift.create({ subject, startsAt, endsAt, teacher: teacherId });
  return shift;
}

// ===== حذف شيفت =====
async function remove(shiftId) {
  await Shift.findByIdAndDelete(shiftId);
}

module.exports = { list, listNow, create, remove };
