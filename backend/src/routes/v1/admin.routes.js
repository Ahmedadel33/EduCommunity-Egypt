const express = require('express');
const adminController = require('../../controllers/admin.controller');
const asyncHandler = require('../../utils/asyncHandler');
const { authenticate, authorize } = require('../../middleware/auth.middleware');

const router = express.Router();

// ===== طبقة المسارات (Routes) للوحة الأدمن =====
// بتتقري زي فهرس: كل سطر بيقولك المسار بيعمل إيه.

// كل مسارات الأدمن محميّة في سطر واحد: لازم تسجيل دخول + دور admin.
router.use(authenticate, authorize('admin'));

// إحصائيات النظام (للوحة الأدمن)
router.get('/stats', asyncHandler(adminController.stats));

// قائمة المستخدمين
router.get('/users', asyncHandler(adminController.listUsers));

// حذف مستخدم
router.delete('/users/:id', asyncHandler(adminController.deleteUser));

module.exports = router;
