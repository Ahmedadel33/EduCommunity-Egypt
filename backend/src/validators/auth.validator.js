// التحقّق من بيانات المصادقة.
// كل دالة بتاخد body وترجّع رسالة خطأ (نص) أو null لو كله تمام.
// بنستخدم if بسيطة بدل مكتبة (زي Zod) عشان الكود يفضل مقروء لأي حد.

// بريد شكله صح؟ (تحقّق بسيط: فيه @ وفيه نقطة بعدها)
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const supportedGrades = new Set([
  'primary-1', 'primary-2', 'primary-3', 'primary-4', 'primary-5', 'primary-6',
  'prep-1', 'prep-2', 'prep-3',
  'sec-1', 'sec-2', 'sec-3',
]);

// تسجيل حساب جديد
function register(body) {
  const { name, email, password, role, subject, grades } = body;

  if (role !== undefined && !['student', 'teacher'].includes(role)) {
    return 'لا يمكن إنشاء هذا النوع من الحسابات من التسجيل العام';
  }
  if (!name || !name.trim()) return 'الاسم مطلوب';
  if (!email) return 'البريد الإلكتروني مطلوب';
  if (!isValidEmail(email)) return 'صيغة البريد الإلكتروني غير صحيحة';
  if (!password) return 'كلمة المرور مطلوبة';
  if (password.length < 6) return 'كلمة المرور يجب ألا تقل عن 6 أحرف';

  // المدرس لازم يحدّد تخصّصه (مادته) وقت التسجيل
  if (role === 'teacher' && (!subject || !subject.trim())) {
    return 'اختر المادة التي تدرّسها';
  }
  if (role === 'teacher' && (!Array.isArray(grades) || grades.length === 0)) {
    return 'اختر صفًا دراسيًا واحدًا على الأقل';
  }
  if (role === 'teacher' && grades.some((grade) => !supportedGrades.has(grade))) {
    return 'يوجد صف دراسي غير صالح';
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
  const { name, password, grades } = body;

  if (name !== undefined && !name.trim()) return 'الاسم لا يمكن أن يكون فارغاً';
  if (password && password.length < 6) return 'كلمة المرور يجب ألا تقل عن 6 أحرف';
  if (grades !== undefined) {
    let parsedGrades = grades;
    if (typeof grades === 'string') {
      try {
        parsedGrades = JSON.parse(grades);
      } catch {
        return 'قائمة الصفوف غير صالحة';
      }
    }
    if (!Array.isArray(parsedGrades) || parsedGrades.length === 0) {
      return 'اختر صفًا دراسيًا واحدًا على الأقل';
    }
    if (parsedGrades.some((grade) => !supportedGrades.has(grade))) {
      return 'يوجد صف دراسي غير صالح';
    }
  }

  return null;
}

module.exports = { register, login, refresh, updateMe };
