const express = require('express');
const authController = require('../../controllers/auth.controller');
const authValidator = require('../../validators/auth.validator');
const validate = require('../../middleware/validate.middleware');
const asyncHandler = require('../../utils/asyncHandler');
const { authenticate } = require('../../middleware/auth.middleware');

const router = express.Router();

// ===== طبقة المسارات (Routes) =====
// شغلها إنها توصّل: المسار → التحقّق → الصلاحية → الكنترولر.
// بتتقري زي فهرس: كل سطر بيقولك المسار ده بيعمل إيه ومين مسموح له.

// تسجيل حساب جديد
router.post('/register', validate(authValidator.register), asyncHandler(authController.register));

// تسجيل الدخول (بيرجّع accessToken + refreshToken)
router.post('/login', validate(authValidator.login), asyncHandler(authController.login));

// تجديد الجلسة — الفرونت بينادي عليه لوحده لما الـaccessToken يخلص
router.post('/refresh', validate(authValidator.refresh), asyncHandler(authController.refresh));

// بياناتي (لازم تسجيل دخول)
router.get('/me', authenticate, asyncHandler(authController.getMe));

// تعديل بياناتي
router.patch('/me', authenticate, validate(authValidator.updateMe), asyncHandler(authController.updateMe));

module.exports = router;
