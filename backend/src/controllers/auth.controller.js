const authService = require('../services/auth.service');
const { sendSuccess, sendCreated } = require('../utils/apiResponse');

// ===== طبقة الكنترولر =====
// شغلها 3 خطوات بس ومفيش غيرهم:
//   1) تاخد البيانات من الطلب (req)
//   2) تنادي الـservice
//   3) تبعت الرد
// مفيش منطق ولا داتابيز هنا — ده شغل الـservice.
// ومفيش try/catch — ده شغل asyncHandler + error middleware.

async function register(req, res) {
  const result = await authService.register(req.body);
  return sendCreated(res, result, 'تم إنشاء الحساب بنجاح');
}

async function login(req, res) {
  const result = await authService.login(req.body);
  return sendSuccess(res, result, 'تم تسجيل الدخول');
}

async function refresh(req, res) {
  const result = await authService.refresh(req.body.refreshToken);
  return sendSuccess(res, result, 'تم تجديد الجلسة');
}

async function getMe(req, res) {
  const user = await authService.getMe(req.user.id);
  return sendSuccess(res, { user });
}

async function updateMe(req, res) {
  const result = await authService.updateMe(req.user.id, req.body);
  return sendSuccess(res, result, 'تم حفظ التعديلات');
}

module.exports = { register, login, refresh, getMe, updateMe };
