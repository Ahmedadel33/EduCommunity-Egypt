const express = require('express');
const attendanceController = require('../../controllers/attendance.controller');
const asyncHandler = require('../../utils/asyncHandler');
const { authenticate, authorize } = require('../../middleware/auth.middleware');

const router = express.Router();

// ===== طبقة المسارات (Routes) للحضور =====
// بتتقري زي فهرس: كل سطر بيقولك المسار بيعمل إيه ومين مسموح له.
// مفيش validate هنا لأن مفيش مسار بياخد body (شوف attendance.validator.js).

// المدرس يسجّل خروج — بيقفل جلسته المفتوحة وبنحسب مدتها
// (الجلسة نفسها بتتفتح لوحدها وقت تسجيل الدخول في auth.service.js)
router.post('/checkout', authenticate, asyncHandler(attendanceController.checkout));

// جلساتي أنا + إجمالي وقتي (لازم تسجيل دخول)
router.get('/me', authenticate, asyncHandler(attendanceController.getMe));

// كل الحضور — الأدمن بس، عشان يبني عليه تقييم المدرسين
router.get('/', authenticate, authorize('admin'), asyncHandler(attendanceController.listAll));

module.exports = router;
