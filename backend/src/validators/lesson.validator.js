// التحقّق من بيانات الدروس.
// كل دالة بتاخد body وترجّع رسالة خطأ (نص) أو null لو كله تمام.
// بنستخدم if بسيطة بدل مكتبة (زي Zod) عشان الكود يفضل مقروء لأي حد.

// إنشاء درس جديد
function create(body) {
  const { title, grade, startsAt } = body;

  // الثلاثة دول بيتشيّكوا مع بعض ورسالة واحدة — زي ما كان الكود القديم بالظبط
  if (!title || !grade || !startsAt) return 'العنوان والصف والموعد مطلوبين';

  return null; // كله تمام
}

module.exports = { create };
