const express = require('express');

const router = express.Router();

// ===== فهرس الإصدار الأول من الـAPI =====
// كل المسارات بتتجمّع هنا، وserver.js بيركّب الملف ده مرة واحدة على /api/v1
//
// ليه إصدار (v1)؟
//   لو بعدين احتجنا نغيّر شكل رد موجود (حاجة هتكسر الفرونت القديم)،
//   بنعمل v2 جنبه ونسيب v1 شغّال لحد ما الكل ينقل.
//   ده معناه إننا نقدر نطوّر من غير ما نكسر أي حد بيستخدم الـAPI.

// ===== المرحلة 1 و2: المصادقة والمواد =====
router.use('/auth', require('./auth.routes'));            // تسجيل / دخول / تجديد
router.use('/subjects', require('./subject.routes'));     // المواد الدراسية
router.use('/materials', require('./material.routes'));   // المواد التعليمية + الموافقة

// ===== المرحلة 3: التفاعل =====
router.use('/chat', require('./chat.routes'));            // سجل رسائل الشات (اللحظي في Socket)
router.use('/lessons', require('./lesson.routes'));       // الدروس أونلاين (Jitsi)
router.use('/teachers', require('./teacher.routes'));     // المدرسون + التقييم + الترشيح

// ===== المرحلة 4: المهارات والمكافآت =====
router.use('/soft-skills', require('./softskill.routes')); // تاسكات السوفت سكيلز
router.use('/rewards', require('./reward.routes'));        // المكافآت

// ===== المزايا الجديدة =====
router.use('/shifts', require('./shift.routes'));          // شيفتات المناوبة
router.use('/attendance', require('./attendance.routes')); // حضور المدرسين وحساب الوقت

// ===== المجتمع والتحفيز =====
router.use('/posts', require('./post.routes'));           // المنشورات + الإعجاب + التعليقات
router.use('/challenges', require('./challenge.routes')); // التحديات
router.use('/leaderboard', require('./leaderboard.routes')); // المتصدّرون
router.use('/admin', require('./admin.routes'));          // إحصائيات وإدارة المستخدمين

// فحص إن السيرفر شغّال
router.get('/health', (req, res) => {
  res.json({ success: true, message: 'السيرفر شغّال', data: { status: 'ok' } });
});

module.exports = router;
