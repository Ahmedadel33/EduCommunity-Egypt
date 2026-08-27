const Attendance = require('../models/Attendance');

// ===== طبقة الخدمات (Service) للحضور =====
// هنا كل منطق الشغل والتعامل مع الداتابيز.
// الكنترولر مابيعرفش حاجة عن Mongoose — بينادي الدوال دي بس.
//
// الحضور ده تتبّع وقت شغل المدرس:
//   الجلسة بتتفتح لوحدها لما المدرس يسجّل دخول (شوف auth.service.js — بيعمل Attendance.create)،
//   وبتتقفل هنا لما يعمل checkout، ووقتها بنحسب المدة بالدقايق.
//   الأدمن بيجمّع الدقايق دي ويبني عليها تقييم المدرس.

// ===== تسجيل الخروج (نقفل الجلسة المفتوحة ونحسب المدة) =====
async function checkout(teacherId) {
  // بندوّر على آخر جلسة لسه مفتوحة (logoutAt لسه فاضي) — الأحدث الأول
  const session = await Attendance.findOne({ teacher: teacherId, logoutAt: null }).sort({ loginAt: -1 });

  // مفيش جلسة مفتوحة؟ ده مش خطأ — يمكن يكون عمل checkout قبل كده،
  // فبنرجّع رد عادي ناجح بالرسالة دي بدل ما نرمي ApiError.
  if (!session) return { session: null, message: 'لا توجد جلسة مفتوحة' };

  session.logoutAt = new Date();
  // الفرق بين الوقتين بالمللي ثانية ÷ 60000 = دقايق
  session.durationMinutes = Math.round((session.logoutAt - session.loginAt) / 60000);
  await session.save();

  return { session, message: 'تم تسجيل الخروج' };
}

// ===== جلساتي أنا + إجمالي وقتي =====
async function getMe(teacherId) {
  const sessions = await Attendance.find({ teacher: teacherId }).sort({ loginAt: -1 }); // الأحدث الأول

  // بنجمع دقايق كل الجلسات — الجلسة اللي لسه مفتوحة مدتها 0 فمابتأثّرش
  const totalMinutes = sessions.reduce((s, x) => s + (x.durationMinutes || 0), 0);

  return { sessions, totalMinutes };
}

// ===== كل الحضور (للأدمن) — جلسات كل المدرسين =====
async function listAll() {
  const sessions = await Attendance.find()
    .populate('teacher', 'name') // نجيب اسم المدرّس بس مش بياناته كلها
    .sort({ loginAt: -1 })       // الأحدث الأول
    .limit(200);                 // بنحدّد العدد عشان الرد مايبقاش تقيل

  // نجمّع إجمالي الوقت لكل مدرس عشان الأدمن يقارن بسهولة
  const totalsMap = {};
  sessions.forEach((s) => {
    const name = s.teacher?.name || 'غير معروف'; // ممكن المدرس يكون اتحذف
    totalsMap[name] = (totalsMap[name] || 0) + (s.durationMinutes || 0);
  });

  // نحوّل الأوبجكت لمصفوفة [{ name, minutes }] عشان الفرونت يعرضها في جدول
  const totals = Object.entries(totalsMap).map(([name, minutes]) => ({ name, minutes }));

  return { sessions, totals };
}

module.exports = { checkout, getMe, listAll };
