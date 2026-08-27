// التحقّق من بيانات التحديات.
// كل دالة بتاخد body وترجّع رسالة خطأ (نص) أو null لو كله تمام.
// if بسيطة بس — نفس أسلوب باقي الـvalidators.

// حلّ تحدي: لازم الطالب يبعت إجابة
function submit(body) {
  const { answer } = body;

  if (!answer || !answer.trim()) return 'الإجابة مطلوبة';

  return null; // كله تمام
}

module.exports = { submit };
