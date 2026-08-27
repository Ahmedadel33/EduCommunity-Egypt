const express = require('express');
const subjectController = require('../../controllers/subject.controller');
const subjectValidator = require('../../validators/subject.validator');
const validate = require('../../middleware/validate.middleware');
const asyncHandler = require('../../utils/asyncHandler');
const { authenticate, authorize } = require('../../middleware/auth.middleware');

const router = express.Router();

// ===== طبقة المسارات (Routes) للمواد الدراسية =====
// بتتقري زي فهرس: كل سطر بيقولك المسار بيعمل إيه ومين مسموح له.

// عرض المواد الدراسية (متاح للجميع، وممكن نفلتر بالصف ?grade=sec-1)
router.get('/', asyncHandler(subjectController.list));

// إضافة مادة دراسية (للمعلم أو الأدمن فقط)
// ملاحظة: authenticate/authorize قبل validate عشان اللي مش مسجّل دخول ياخد 401 مش 400
router.post(
  '/',
  authenticate,
  authorize('teacher', 'admin'),
  validate(subjectValidator.create),
  asyncHandler(subjectController.create)
);

module.exports = router;
