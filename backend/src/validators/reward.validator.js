// التحقّق من بيانات المكافآت.
// كل دالة بتاخد body وترجّع رسالة خطأ (نص) أو null لو كله تمام.
// بنستخدم if بسيطة بدل مكتبة (زي Zod) عشان الكود يفضل مقروء لأي حد.

// منح مكافأة لمستخدم
function create(body) {
  const { user, title } = body;

  if (!user || !title) return 'المستخدم والعنوان مطلوبين';

  return null; // كله تمام
}

module.exports = { create };
