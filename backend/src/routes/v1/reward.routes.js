const express = require('express');
const rewardController = require('../../controllers/reward.controller');
const rewardValidator = require('../../validators/reward.validator');
const validate = require('../../middleware/validate.middleware');
const asyncHandler = require('../../utils/asyncHandler');
const { authenticate, authorize } = require('../../middleware/auth.middleware');

const router = express.Router();

// ===== طبقة المسارات (Routes) للمكافآت =====
// بتتقري زي فهرس: كل سطر بيقولك المسار بيعمل إيه ومين مسموح له.
// (الأب بيركّب الراوتر ده على /rewards)

// عرض المكافآت (لازم تسجيل دخول — الأدمن يشوف الكل والباقي يشوف بتاعه بس)
router.get('/', authenticate, asyncHandler(rewardController.list));

// منح مكافأة (للأدمن فقط)
// ملاحظة: authenticate/authorize قبل validate عشان اللي مش مسجّل دخول ياخد 401 مش 400
router.post(
  '/',
  authenticate,
  authorize('admin'),
  validate(rewardValidator.create),
  asyncHandler(rewardController.create)
);

module.exports = router;
