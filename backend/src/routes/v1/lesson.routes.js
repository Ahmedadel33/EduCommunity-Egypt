const express = require('express');
const lessonController = require('../../controllers/lesson.controller');
const lessonValidator = require('../../validators/lesson.validator');
const validate = require('../../middleware/validate.middleware');
const asyncHandler = require('../../utils/asyncHandler');
const { authenticate, authorize } = require('../../middleware/auth.middleware');

const router = express.Router();

// ===== طبقة المسارات (Routes) =====
// شغلها إنها توصّل: المسار → التحقّق → الصلاحية → الكنترولر.
// بتتقري زي فهرس: كل سطر بيقولك المسار ده بيعمل إيه ومين مسموح له.

// عرض الدروس — مفتوح للكل، وممكن نفلتر بالصف (?grade=sec-1)
router.get('/', asyncHandler(lessonController.list));

// إنشاء درس — المعلم أو الأدمن بس
router.post(
  '/',
  authenticate,
  authorize('teacher', 'admin'),
  validate(lessonValidator.create),
  asyncHandler(lessonController.create)
);

// حذف درس — المعلم صاحب الدرس أو الأدمن
// (الـauthorize بيسمح لأي مدرّس يدخل، والـservice هو اللي بيتأكد إنه صاحب الدرس)
router.delete(
  '/:id',
  authenticate,
  authorize('teacher', 'admin'),
  asyncHandler(lessonController.remove)
);

module.exports = router;
