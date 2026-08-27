const teacherService = require('../services/teacher.service');
const { sendSuccess, sendCreated } = require('../utils/apiResponse');

// ===== طبقة الكنترولر للمدرسين والتقييمات =====
// 3 خطوات بس: نقرا من الطلب → ننادي الـservice → نبعت الرد.
// مفيش منطق ولا داتابيز ولا try/catch هنا.

async function listWithRatings(req, res) {
  const teachers = await teacherService.listWithRatings();
  return sendSuccess(res, { teachers });
}

async function rate(req, res) {
  const rating = await teacherService.rate(req.params.id, req.user, req.body);
  return sendCreated(res, { rating }, 'تم حفظ التقييم');
}

module.exports = { listWithRatings, rate };
