const express = require('express');
const challengeController = require('../../controllers/challenge.controller');
const challengeValidator = require('../../validators/challenge.validator');
const validate = require('../../middleware/validate.middleware');
const asyncHandler = require('../../utils/asyncHandler');
const { authenticate, authorize } = require('../../middleware/auth.middleware');

const router = express.Router();

// ===== طبقة المسارات (Routes) للتحديات =====
// بتتقري زي فهرس: كل سطر بيقولك المسار بيعمل إيه ومين مسموح له.

// عرض التحديات الفعّالة (للجميع)
router.get('/', asyncHandler(challengeController.listActive));

router.post('/', authenticate, authorize('teacher', 'admin'), asyncHandler(challengeController.createChallenge));
router.get('/mine', authenticate, authorize('teacher'), asyncHandler(challengeController.listMine));
router.get('/pending', authenticate, authorize('admin'), asyncHandler(challengeController.listPending));
router.patch('/:id/approve', authenticate, authorize('admin'), asyncHandler(challengeController.approve));
router.patch('/:id/reject', authenticate, authorize('admin'), asyncHandler(challengeController.reject));

// ⚠️ /submissions لازم يبقى قبل أي مسار /:id
// لأن Express بيجرّب المسارات بالترتيب، ولو /:id جه الأول هيفتكر إن "submissions" هي الـid.
router.get('/submissions', authenticate, asyncHandler(challengeController.listMySubmissions));

// حلول الطلاب التي تخص صفوف المدرس فقط
router.get('/teacher/submissions', authenticate, authorize('teacher'), asyncHandler(challengeController.listTeacherSubmissions));
router.patch('/submissions/:submissionId/grade', authenticate, authorize('teacher'), asyncHandler(challengeController.gradeSubmission));

// حلّ تحدي (لازم تسجيل دخول)
router.post(
  '/:id/submit',
  authenticate,
  validate(challengeValidator.submit),
  asyncHandler(challengeController.submit)
);

module.exports = router;
