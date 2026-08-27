const attendanceService = require('../services/attendance.service');
const { sendSuccess } = require('../utils/apiResponse');

// ===== طبقة الكنترولر للحضور =====
// 3 خطوات بس: نقرا من الطلب → ننادي الـservice → نبعت الرد.
// مفيش منطق ولا داتابيز ولا try/catch هنا.

async function checkout(req, res) {
  // الرسالة جاية من الـservice لأنها بتفرق: قفلنا جلسة، ولا مالقيناش جلسة مفتوحة
  const { session, message } = await attendanceService.checkout(req.user.id);
  return sendSuccess(res, { session }, message);
}

async function getMe(req, res) {
  const result = await attendanceService.getMe(req.user.id);
  return sendSuccess(res, result);
}

async function listAll(req, res) {
  const result = await attendanceService.listAll();
  return sendSuccess(res, result);
}

module.exports = { checkout, getMe, listAll };
