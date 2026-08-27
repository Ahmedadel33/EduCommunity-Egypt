const express = require('express');
const postController = require('../../controllers/post.controller');
const postValidator = require('../../validators/post.validator');
const validate = require('../../middleware/validate.middleware');
const asyncHandler = require('../../utils/asyncHandler');
const { authenticate } = require('../../middleware/auth.middleware');
const upload = require('../../middleware/upload.middleware');

const router = express.Router();

// ===== طبقة المسارات (Routes) للمنشورات (الـFeed) =====
// بتتقري زي فهرس: كل سطر بيقولك المسار بيعمل إيه ومين مسموح له.

// عرض كل المنشورات (للجميع)
router.get('/', asyncHandler(postController.list));

// إنشاء منشور (لازم تسجيل دخول)
// الترتيب مهم: upload لازم يشتغل قبل validate عشان يملا req.body من الـform-data
router.post(
  '/',
  authenticate,
  upload.single('file'),
  validate(postValidator.create),
  asyncHandler(postController.create)
);

// لايك / إلغاء لايك (Toggle) — لازم تسجيل دخول
router.post('/:id/like', authenticate, asyncHandler(postController.toggleLike));

// تعليقات منشور (للجميع)
router.get('/:id/comments', asyncHandler(postController.listComments));

// إضافة تعليق (لازم تسجيل دخول)
router.post(
  '/:id/comments',
  authenticate,
  validate(postValidator.addComment),
  asyncHandler(postController.addComment)
);

module.exports = router;
