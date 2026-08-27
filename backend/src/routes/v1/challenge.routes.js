const express = require('express');
const challengeController = require('../../controllers/challenge.controller');
const challengeValidator = require('../../validators/challenge.validator');
const validate = require('../../middleware/validate.middleware');
const asyncHandler = require('../../utils/asyncHandler');
const { authenticate } = require('../../middleware/auth.middleware');

const router = express.Router();

// ===== طبقة المسارات (Routes) للتحديات =====
// بتتقري زي فهرس: كل سطر بيقولك المسار بيعمل إيه ومين مسموح له.

// عرض التحديات الفعّالة (للجميع)
router.get('/', asyncHandler(challengeController.listActive));

// ⚠️ /submissions لازم يبقى قبل أي مسار /:id
// لأن Express بيجرّب المسارات بالترتيب، ولو /:id جه الأول هيفتكر إن "submissions" هي الـid.
router.get('/submissions', authenticate, asyncHandler(challengeController.listMySubmissions));

// حلّ تحدي (لازم تسجيل دخول)
router.post(
  '/:id/submit',
  authenticate,
  validate(challengeValidator.submit),
  asyncHandler(challengeController.submit)
);

module.exports = router;
