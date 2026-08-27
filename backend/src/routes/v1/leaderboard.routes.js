const express = require('express');
const leaderboardController = require('../../controllers/leaderboard.controller');
const asyncHandler = require('../../utils/asyncHandler');

const router = express.Router();

// ===== طبقة المسارات (Routes) للوحة المتصدّرين =====
// بتتقري زي فهرس: كل سطر بيقولك المسار بيعمل إيه.
// كلها عامة (مفيش تسجيل دخول) — أي حد يشوف الترتيب.

// أفضل الطلاب (فلتر اختياري ?grade=)
router.get('/', asyncHandler(leaderboardController.topStudents));

// أفضل المدارس
router.get('/schools', asyncHandler(leaderboardController.topSchools));

module.exports = router;
