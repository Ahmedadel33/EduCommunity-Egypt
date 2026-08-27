const challengeService = require('../services/challenge.service');
const { sendSuccess, sendCreated } = require('../utils/apiResponse');

// ===== طبقة الكنترولر للتحديات =====
// 3 خطوات بس: نقرا من الطلب → ننادي الـservice → نبعت الرد.
// مفيش منطق ولا داتابيز ولا try/catch هنا.

async function listActive(req, res) {
  const challenges = await challengeService.listActive();
  return sendSuccess(res, { challenges });
}

  async function createChallenge(req, res) {
    const challenge = await challengeService.createChallenge(req.body, req.user);
    return sendCreated(res, { challenge }, 'تم إرسال المسابقة للمراجعة');
  }

  async function listMine(req, res) {
    const challenges = await challengeService.listMine(req.user);
    return sendSuccess(res, { challenges });
  }

  async function listPending(req, res) {
    const challenges = await challengeService.listPending();
    return sendSuccess(res, { challenges });
  }

  async function approve(req, res) {
    const challenge = await challengeService.updateStatus(req.params.id, 'approved');
    return sendSuccess(res, { challenge }, 'تم اعتماد المسابقة');
  }

  async function reject(req, res) {
    const challenge = await challengeService.updateStatus(req.params.id, 'rejected');
    return sendSuccess(res, { challenge }, 'تم رفض المسابقة');
  }

async function listMySubmissions(req, res) {
  const submissions = await challengeService.listMySubmissions(req.user.id);
  return sendSuccess(res, { submissions });
}

async function listTeacherSubmissions(req, res) {
  const submissions = await challengeService.listTeacherSubmissions(req.user, req.query);
  return sendSuccess(res, { submissions });
}

async function gradeSubmission(req, res) {
  const submission = await challengeService.gradeSubmission(req.params.submissionId, req.user, Number(req.body.score));
  return sendSuccess(res, { submission }, 'تم حفظ التقييم');
}

async function submit(req, res) {
  const submission = await challengeService.submit(req.params.id, req.user, req.body);
  return sendCreated(res, { submission }, 'تم حل التحدي بنجاح');
}

module.exports = { listActive, listMySubmissions, listTeacherSubmissions, gradeSubmission, submit };
module.exports = { listActive, createChallenge, listMine, listPending, approve, reject, listMySubmissions, listTeacherSubmissions, gradeSubmission, submit };
