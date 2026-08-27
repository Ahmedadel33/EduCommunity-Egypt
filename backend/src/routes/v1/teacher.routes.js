const express = require('express');
const teacherController = require('../../controllers/teacher.controller');
const teacherValidator = require('../../validators/teacher.validator');
const validate = require('../../middleware/validate.middleware');
const asyncHandler = require('../../utils/asyncHandler');
const { authenticate, authorize } = require('../../middleware/auth.middleware');

const router = express.Router();

// ===== طبقة المسارات (Routes) للمدرسين والتقييمات =====
// بتتقري زي فهرس: كل سطر بيقولك المسار بيعمل إيه ومين مسموح له.

// عرض المدرسين مع متوسّط تقييماتهم (للجميع)
router.get('/', asyncHandler(teacherController.listWithRatings));

// تقييم مدرس (الطلاب بس)
router.post(
  '/:id/rate',
  authenticate,
  authorize('student'),
  validate(teacherValidator.rate),
  asyncHandler(teacherController.rate)
);

module.exports = router;
