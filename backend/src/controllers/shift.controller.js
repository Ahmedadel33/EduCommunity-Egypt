const shiftService = require('../services/shift.service');
const { sendSuccess, sendCreated } = require('../utils/apiResponse');

// ===== طبقة الكنترولر للشيفتات =====
// 3 خطوات بس: نقرا من الطلب → ننادي الـservice → نبعت الرد.
// مفيش منطق ولا داتابيز ولا try/catch هنا.

async function list(req, res) {
  const shifts = await shiftService.list(req.query);
  return sendSuccess(res, { shifts });
}

async function listNow(req, res) {
  const shifts = await shiftService.listNow(req.query);
  return sendSuccess(res, { shifts });
}

async function create(req, res) {
  const shift = await shiftService.create(req.body, req.user);
  return sendCreated(res, { shift }, 'تم إنشاء الشيفت');
}

async function remove(req, res) {
  await shiftService.remove(req.params.id);
  return sendSuccess(res, null, 'تم حذف الشيفت');
}

module.exports = { list, listNow, create, remove };
