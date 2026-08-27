const User = require('../models/User');
const TeacherRating = require('../models/TeacherRating');
const ApiError = require('../utils/ApiError');

// ===== طبقة الخدمات (Service) للمدرسين والتقييمات =====
// هنا كل منطق الشغل والتعامل مع الداتابيز.
// الكنترولر مابيعرفش حاجة عن Mongoose — بينادي الدوال دي بس.

// ===== عرض المدرسين مع ملخّص تقييماتهم =====
// aggregation: بنجمع لكل مدرس متوسّط تقييمه وعدد تقييماته.
async function listWithRatings() {
  const teachers = await User.aggregate([
    // (1) المدرسين بس
    { $match: { role: 'teacher' } },
    // (2) نجيب تقييمات كل مدرس من مجموعة teacheratings
    {
      $lookup: {
        from: 'teacheratings',
        localField: '_id',
        foreignField: 'teacherId',
        as: 'ratings',
      },
    },
    // (3) نحسب المتوسّط والعدد — ولو مفيش تقييمات المتوسّط = 0
    {
      $project: {
        id: '$_id',
        name: '$name',
        email: '$email',
        subject: '$subject', // تخصّص المدرس (المادة اللي بيدرّسها)
        avg_rating: {
          $cond: {
            if: { $gt: [{ $size: '$ratings' }, 0] },
            then: { $avg: '$ratings.rating' },
            else: 0,
          },
        },
        ratings_count: { $size: '$ratings' },
      },
    },
    // (4) الأعلى تقييمًا الأول
    { $sort: { avg_rating: -1 } },
  ]);

  return teachers;
}

// ===== تقييم مدرس =====
// upsert: لو الطالب قيّم قبل كده بنعدّل تقييمه، لو لأ بننشئ تقييم جديد
// (مش بنكرّر) — والـindex في الموديل بيضمن ده كمان.
async function rate(teacherId, student, data) {
  const { rating, comment } = data;

  // نتأكد إن المدرس موجود فعلًا
  const teacher = await User.findOne({ _id: teacherId, role: 'teacher' });
  if (!teacher) throw new ApiError(404, 'المعلم غير موجود');

  const ratingDoc = await TeacherRating.findOneAndUpdate(
    { teacherId, studentId: student.id }, // نلاقي تقييم الطالب لو موجود
    { rating, comment: comment || null }, // نحدّثه بالقيم الجديدة
    { new: true, upsert: true }           // upsert = عدّل أو أنشئ، new = رجّع النسخة الجديدة
  );

  return {
    id: ratingDoc._id,
    teacher_id: ratingDoc.teacherId,
    student_id: ratingDoc.studentId,
    rating: ratingDoc.rating,
    comment: ratingDoc.comment,
  };
}

module.exports = { listWithRatings, rate };
