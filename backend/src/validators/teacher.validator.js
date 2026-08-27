// التحقّق من بيانات تقييم المدرسين.
// كل دالة بتاخد body وترجّع رسالة خطأ (نص) أو null لو كله تمام.
// if بسيطة بس — نفس أسلوب باقي الـvalidators.

// تقييم مدرس: لازم يكون رقم من 1 لـ 5
function rate(body) {
  const { rating } = body;

  // نفس رسالة الكود القديم بالظبط عشان الفرونت مايتأثرش
  if (rating === undefined || rating === null) return 'تقييم غير صحيح';
  if (rating < 1 || rating > 5) return 'تقييم غير صحيح';

  return null; // كله تمام
}

module.exports = { rate };
