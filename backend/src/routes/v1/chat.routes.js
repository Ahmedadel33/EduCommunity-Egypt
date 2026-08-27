const express = require('express');
const chatController = require('../../controllers/chat.controller');
const chatValidator = require('../../validators/chat.validator');
const validate = require('../../middleware/validate.middleware');
const asyncHandler = require('../../utils/asyncHandler');
const { authenticate } = require('../../middleware/auth.middleware');
const upload = require('../../middleware/upload.middleware');

const router = express.Router();

// ===== طبقة المسارات (Routes) =====
// شغلها إنها توصّل: المسار → التحقّق → الصلاحية → الكنترولر.
//
// الشات اللحظي نفسه شغّال بـSocket.IO (sockets/chat.handler.js) —
// المسارات دي لتحميل الرسائل القديمة بس.

// جلب رسائل غرفة (لازم تسجيل دخول) — مثال: /chat/messages?room=sec-1&page=1
router.get('/messages', authenticate, asyncHandler(chatController.getHistory));

// المدرسون المرتبطون بصف الطالب للمحادثات الخاصة
router.get('/contacts', authenticate, asyncHandler(chatController.getContacts));

// إرسال رسالة (لازم تسجيل دخول)
router.post(
  '/messages',
  authenticate,
  validate(chatValidator.sendMessage),
  asyncHandler(chatController.sendMessage)
);

// رفع مرفق للشات (صوت / صورة / ملف بأي نوع)
router.post('/upload', authenticate, upload.single('file'), asyncHandler(chatController.uploadAttachment));

module.exports = router;
