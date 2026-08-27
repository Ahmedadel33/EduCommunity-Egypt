// التحقّق من بيانات المواد التعليمية.
// كل دالة بتاخد body وترجّع رسالة خطأ (نص) أو null لو كله تمام.
// if بسيطة بس — نفس أسلوب باقي الـvalidators.

// إضافة مادة تعليمية جديدة
function create(body) {
  const { title, subject, grade, type } = body;

  // الأربعة دول required في الموديل
  if (!title || !subject || !grade || !type) {
    return 'العنوان والمادة والصف والنوع مطلوبين';
  }

  return null; // كله تمام
  // ملاحظة: التحقّق من الملف/الرابط مش هنا لأن الـvalidator بيشوف body بس،
  // والملف بيوصل في req.file — فالفحص ده بيتعمل في الـservice.
}

module.exports = { create };
