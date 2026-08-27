const express = require('express');
const shiftController = require('../../controllers/shift.controller');
const shiftValidator = require('../../validators/shift.validator');
const validate = require('../../middleware/validate.middleware');
const asyncHandler = require('../../utils/asyncHandler');
const { authenticate, authorize } = require('../../middleware/auth.middleware');

const router = express.Router();

// ===== طبقة المسارات (Routes) للشيفتات =====
// بتتقري زي فهرس: كل سطر بيقولك المسار بيعمل إيه ومين مسموح له.

// عرض كل الشيفتات — مفتوح للكل، وممكن نفلتر بالمادة (?subject=فيزياء)
router.get('/', asyncHandler(shiftController.list));

// المدرسون المناوبون دلوقتي — مفتوح للكل، وممكن نفلتر بالمادة
// مهم: /now لازم يتكتب قبل أي مسار /:id عشان Express بيقرا من فوق لتحت،
// ولو /:id اتكتب الأول هيفتكر إن "now" ده id ويدخل عليه بالغلط.
router.get('/now', asyncHandler(shiftController.listNow));

// إنشاء شيفت — المدرس أو الأدمن بس
// (الأدمن بيعيّن أي مدرس، والمدرس بيسجّل لنفسه — الـservice هو اللي بينفّذ القاعدة دي)
// ملاحظة: authenticate/authorize قبل validate عشان اللي مش مسجّل دخول ياخد 401 مش 400
router.post(
  '/',
  authenticate,
  authorize('teacher', 'admin'),
  validate(shiftValidator.create),
  asyncHandler(shiftController.create)
);

// حذف شيفت — المدرس أو الأدمن
router.delete(
  '/:id',
  authenticate,
  authorize('teacher', 'admin'),
  asyncHandler(shiftController.remove)
);

module.exports = router;
