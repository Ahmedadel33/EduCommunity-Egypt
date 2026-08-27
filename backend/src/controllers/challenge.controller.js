const challengeService = require('../services/challenge.service');
const { sendSuccess, sendCreated } = require('../utils/apiResponse');

// ===== طبقة الكنترولر للتحديات =====
// 3 خطوات بس: نقرا من الطلب → ننادي الـservice → نبعت الرد.
// مفيش منطق ولا داتابيز ولا try/catch هنا.

async function listActive(req, res) {
  const challenges = await challengeService.listActive();
  return sendSuccess(res, { challenges });
}

async function listMySubmissions(req, res) {
  const submissions = await challengeService.listMySubmissions(req.user.id);
  return sendSuccess(res, { submissions });
}

async function submit(req, res) {
  const submission = await challengeService.submit(req.params.id, req.user, req.body);
  return sendCreated(res, { submission }, 'تم حل التحدي بنجاح');
}

module.exports = { listActive, listMySubmissions, submit };
