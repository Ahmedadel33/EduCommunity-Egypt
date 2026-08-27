// التحقّق من بيانات المواد الدراسية.
// كل دالة بتاخد body وترجّع رسالة خطأ (نص) أو null لو كله تمام.
// if بسيطة بس — نفس أسلوب باقي الـvalidators.

// إضافة مادة دراسية جديدة
function create(body) {
  const { name, grade } = body;

  // الاتنين دول required في الموديل، فبنمنعهم من هنا بدل ما الموديل يرمي خطأ وحش
  if (!name || !grade) return 'اسم المادة والصف مطلوبين';

  return null; // كله تمام
}

module.exports = { create };
