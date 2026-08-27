const subjectService = require('../services/subject.service');
const { sendSuccess, sendCreated } = require('../utils/apiResponse');

// ===== طبقة الكنترولر للمواد الدراسية =====
// 3 خطوات بس: نقرا من الطلب → ننادي الـservice → نبعت الرد.
// مفيش منطق ولا داتابيز ولا try/catch هنا.

async function list(req, res) {
  const subjects = await subjectService.list(req.query);
  return sendSuccess(res, { subjects });
}

async function create(req, res) {
  const subject = await subjectService.create(req.body);
  return sendCreated(res, { subject }, 'تم إضافة المادة الدراسية');
}

module.exports = { list, create };
