const express = require('express');
const materialController = require('../../controllers/material.controller');
const materialValidator = require('../../validators/material.validator');
const validate = require('../../middleware/validate.middleware');
const asyncHandler = require('../../utils/asyncHandler');
const { authenticate, authorize } = require('../../middleware/auth.middleware');
const upload = require('../../middleware/upload.middleware');

const router = express.Router();

// ===== طبقة المسارات (Routes) للمواد التعليمية =====
// بتتقري زي فهرس: كل سطر بيقولك المسار بيعمل إيه ومين مسموح له.

// عرض المواد المعتمدة (للجميع) — مع فلاتر وبحث وترقيم صفحات
router.get('/', asyncHandler(materialController.list));

// ⚠️ /mine و /pending لازم يبقوا قبل /:id
// لأن Express بيجرّب المسارات بالترتيب، ولو /:id جه الأول هيفتكر إن "mine" هي الـid.

// مواد المدرس نفسه (بكل الحالات — معتمدة و pending)
router.get('/mine', authenticate, authorize('teacher', 'admin'), asyncHandler(materialController.listMine));

// كل المواد (للأدمن) — معتمدة + قيد الموافقة، بفلترة وبحث (مادة/مدرس/حالة)
router.get('/all', authenticate, authorize('admin'), asyncHandler(materialController.listAll));

// المواد قيد الموافقة (للأدمن)
router.get('/pending', authenticate, authorize('admin'), asyncHandler(materialController.listPending));

// مادة واحدة (للجميع)
router.get('/:id', asyncHandler(materialController.getById));

// إضافة مادة (للمعلم أو الأدمن) — الأدمن: مادة وزارة معتمدة · المدرس: قيد الموافقة
// الترتيب مهم: upload لازم يشتغل قبل validate عشان يملا req.body من الـform-data
router.post(
  '/',
  authenticate,
  authorize('teacher', 'admin'),
  upload.single('file'),
  validate(materialValidator.create),
  asyncHandler(materialController.create)
);

// الأدمن يوافق على مادة المدرس
router.patch('/:id/approve', authenticate, authorize('admin'), asyncHandler(materialController.approve));

// حذف / رفض مادة (صاحبها أو الأدمن — الفحص جوّا الـservice)
router.delete('/:id', authenticate, authorize('teacher', 'admin'), asyncHandler(materialController.remove));

module.exports = router;
