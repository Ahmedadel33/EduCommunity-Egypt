const User = require('../models/User');

// ===== طبقة الخدمات (Service) للوحة المتصدّرين =====
// هنا كل منطق الشغل والتعامل مع الداتابيز.
// الكنترولر مابيعرفش حاجة عن Mongoose — بينادي الدوال دي بس.

// ===== أفضل الطلاب =====
// ترتيب بالنقاط تنازليًا، وأقصى 100 طالب، مع فلتر اختياري بالصف (grade).
async function topStudents(query) {
  const { grade } = query;

  const filter = { role: 'student' };
  if (grade) filter.grade = grade; // فلتر اختياري: طلاب صف معيّن بس

  const students = await User.find(filter)
    .select('name grade points badges')
    .sort({ points: -1 }) // الأعلى نقاطًا الأول
    .limit(100);

  return students.map(s => ({
    id: s._id,
    name: s.name,
    grade: s.grade,
    points: s.points,
    badges: s.badges,
  }));
}

// ===== أفضل المدارس =====
// aggregation: بنجمّع الطلاب حسب كود المدرسة ونجمع نقاطهم.
async function topSchools() {
  const schools = await User.aggregate([
    // (1) الطلاب اللي ليهم كود مدرسة صحيح بس
    {
      $match: {
        role: 'student',
        schoolCode: { $ne: null, $exists: true, $ne: '' },
      },
    },
    // (2) نجمّعهم حسب كود المدرسة: نعدّ الطلاب ونجمع نقاطهم
    {
      $group: {
        _id: '$schoolCode',
        students: { $sum: 1 },
        total_points: { $sum: '$points' },
      },
    },
    // (3) الأعلى مجموع نقاط الأول
    { $sort: { total_points: -1 } },
    // (4) أقصى 50 مدرسة
    { $limit: 50 },
  ]);

  return schools.map(s => ({
    school_code: s._id,
    students: s.students,
    total_points: s.total_points,
  }));
}

module.exports = { topStudents, topSchools };
