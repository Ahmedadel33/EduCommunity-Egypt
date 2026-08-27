// التحقّق من بيانات المصادقة.
// كل دالة بتاخد body وترجّع رسالة خطأ (نص) أو null لو كله تمام.
// بنستخدم if بسيطة بدل مكتبة (زي Zod) عشان الكود يفضل مقروء لأي حد.

// بريد شكله صح؟ (تحقّق بسيط: فيه @ وفيه نقطة بعدها)
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// تسجيل حساب جديد
function register(body) {
  const { name, email, password, role, subject } = body;

  if (!name || !name.trim()) return 'الاسم مطلوب';
  if (!email) return 'البريد الإلكتروني مطلوب';
  if (!isValidEmail(email)) return 'صيغة البريد الإلكتروني غير صحيحة';
  if (!password) return 'كلمة المرور مطلوبة';
  if (password.length < 6) return 'كلمة المرور يجب ألا تقل عن 6 أحرف';

  // المدرس لازم يحدّد تخصّصه (مادته) وقت التسجيل
  if (role === 'teacher' && (!subject || !subject.trim())) {
    return 'اختر المادة التي تدرّسها';
  }

  return null; // كله تمام
}

// تسجيل الدخول
function login(body) {
  const { email, password } = body;

  if (!email) return 'البريد الإلكتروني مطلوب';
  if (!password) return 'كلمة المرور مطلوبة';

  return null;
}

// تجديد التوكن
function refresh(body) {
  if (!body.refreshToken) return 'الـ refresh token مطلوب';
  return null;
}

// تعديل بياناتي
function updateMe(body) {
  const { name, password } = body;

  if (name !== undefined && !name.trim()) return 'الاسم لا يمكن أن يكون فارغاً';
  if (password && password.length < 6) return 'كلمة المرور يجب ألا تقل عن 6 أحرف';

  return null;
}

module.exports = { register, login, refresh, updateMe };
