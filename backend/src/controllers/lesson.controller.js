const lessonService = require('../services/lesson.service');
const { sendSuccess, sendCreated } = require('../utils/apiResponse');

// ===== طبقة الكنترولر =====
// شغلها 3 خطوات بس ومفيش غيرهم:
//   1) تاخد البيانات من الطلب (req)
//   2) تنادي الـservice
//   3) تبعت الرد
// مفيش منطق ولا داتابيز هنا — ده شغل الـservice.
// ومفيش try/catch — ده شغل asyncHandler + error middleware.

async function list(req, res) {
  const lessons = await lessonService.list(req.query);
  return sendSuccess(res, { lessons });
}

async function create(req, res) {
  const lesson = await lessonService.create(req.body, req.user.id);
  return sendCreated(res, { lesson }, 'تم إنشاء الدرس بنجاح');
}

async function remove(req, res) {
  await lessonService.remove(req.params.id, req.user);
  return sendSuccess(res, null, 'تم حذف الدرس');
}

module.exports = { list, create, remove };
