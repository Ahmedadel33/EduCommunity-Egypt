const express = require('express');
const softSkillController = require('../../controllers/softskill.controller');
const softSkillValidator = require('../../validators/softskill.validator');
const validate = require('../../middleware/validate.middleware');
const asyncHandler = require('../../utils/asyncHandler');
const { authenticate, authorize } = require('../../middleware/auth.middleware');
const upload = require('../../middleware/upload.middleware');

const router = express.Router();

// ===== طبقة المسارات (Routes) للسوفت سكيلز =====
// بتتقري زي فهرس: كل سطر بيقولك المسار بيعمل إيه ومين مسموح له.
// (الأب بيركّب الراوتر ده على /soft-skills)

// عرض كل التاسكات (متاح للجميع)
router.get('/tasks', asyncHandler(softSkillController.listTasks));

// إنشاء تاسك (للمعلم أو الأدمن فقط)
router.post(
  '/tasks',
  authenticate,
  authorize('teacher', 'admin'),
  validate(softSkillValidator.createTask),
  asyncHandler(softSkillController.createTask)
);

// الطالب يرفع بريزنتيشن لتاسك — upload.single بيستقبل الملف من الحقل 'file'
router.post(
  '/tasks/:id/submit',
  authenticate,
  authorize('student'),
  upload.single('file'),
  asyncHandler(softSkillController.submitTask)
);

// عرض التسليمات (لازم تسجيل دخول — الطالب يشوف تسليماته بس)
// مهم: /submissions لازم ييجي قبل أي مسار فيه :id عشان مايتلغبطش معاه
router.get('/submissions', authenticate, asyncHandler(softSkillController.listSubmissions));

// المعلم يصحّح ويدّي درجة
router.patch(
  '/submissions/:id/grade',
  authenticate,
  authorize('teacher', 'admin'),
  asyncHandler(softSkillController.gradeSubmission)
);

module.exports = router;
