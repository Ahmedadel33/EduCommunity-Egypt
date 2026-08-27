const softSkillService = require('../services/softskill.service');
const upload = require('../middleware/upload.middleware');
const { sendSuccess, sendCreated } = require('../utils/apiResponse');

// ===== طبقة الكنترولر للسوفت سكيلز =====
// شغلها 3 خطوات بس ومفيش غيرهم:
//   1) تاخد البيانات من الطلب (req)
//   2) تنادي الـservice
//   3) تبعت الرد
// مفيش منطق ولا داتابيز هنا — ده شغل الـservice.
// ومفيش try/catch — ده شغل asyncHandler + error middleware.

async function listTasks(req, res) {
  const tasks = await softSkillService.listTasks();
  return sendSuccess(res, { tasks });
}

async function createTask(req, res) {
  const task = await softSkillService.createTask(req.body, req.user.id);
  return sendCreated(res, { task }, 'تم إنشاء التاسك');
}

async function submitTask(req, res) {
  // بنحوّل الملف المرفوع لرابط قبل ما نبعته للـservice
  const fileUrl = upload.getFileUrl(req.file);
  const submission = await softSkillService.submitTask(req.params.id, req.user.id, fileUrl);
  return sendCreated(res, { submission }, 'تم رفع البريزنتيشن');
}

async function listSubmissions(req, res) {
  const submissions = await softSkillService.listSubmissions(req.user, req.query);
  return sendSuccess(res, { submissions });
}

async function gradeSubmission(req, res) {
  const submission = await softSkillService.gradeSubmission(req.params.id, req.body);
  return sendSuccess(res, { submission }, 'تم حفظ الدرجة');
}

module.exports = { listTasks, createTask, submitTask, listSubmissions, gradeSubmission };
