// التحقّق من بيانات المنشورات والتعليقات.
// كل دالة بتاخد body وترجّع رسالة خطأ (نص) أو null لو كله تمام.
// if بسيطة بس — نفس أسلوب باقي الـvalidators.

// إنشاء منشور جديد (المحتوى مطلوب لأنه required في الموديل)
function create(body) {
  const { content } = body;

  if (!content || !content.trim()) return 'المنشور فارغ';

  return null; // كله تمام
  // ملاحظة: الملف بيوصل في req.file مش في body، فالتحقّق منه مش هنا.
}

// إضافة تعليق على منشور
function addComment(body) {
  const { content } = body;

  if (!content || !content.trim()) return 'التعليق فارغ';

  return null;
}

module.exports = { create, addComment };
