// التحقّق من بيانات الشيفتات (نوبتجية المدرسين).
// كل دالة بتاخد body وترجّع رسالة خطأ (نص) أو null لو كله تمام.
// if بسيطة بس — نفس أسلوب باقي الـvalidators.

// إنشاء شيفت جديد
function create(body) {
  const { subject, startsAt, endsAt } = body;

  // التلاتة دول required في الموديل، فبنمنعهم من هنا بدل ما الموديل يرمي خطأ وحش
  if (!subject || !startsAt || !endsAt) return 'المادة والموعد مطلوبين';

  return null; // كله تمام
}

module.exports = { create };
