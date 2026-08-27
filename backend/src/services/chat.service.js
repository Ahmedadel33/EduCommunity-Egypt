const Message = require('../models/Message');
const ApiError = require('../utils/ApiError');
const { getPagination, buildMeta } = require('../utils/pagination');

// ===== طبقة الخدمات (Service) =====
// هنا كل منطق الشغل والتعامل مع الداتابيز.
//
// مهم: الشات الحقيقي (اللحظي) شغّال بـSocket.IO في sockets/chat.handler.js —
// هو اللي بيبعت ويستقبل الرسائل فوراً وقت ما الطالب مفتوح الصفحة.
// المسارات دي (REST) وظيفتها إنها تحمّل الرسائل القديمة أول ما الصفحة تفتح،
// وكمان بتنفع كـplan B لو الاتصال اللحظي وقع.

// ===== جلب رسائل غرفة معينة (مثال: ?room=sec-1) =====
async function getHistory(query) {
  const room = query.room;
  if (!room) throw new ApiError(400, 'اختر الغرفة'); // من غير غرفة مش هنعرف نجيب إيه

  // الكود القديم كان بيجيب 100 رسالة وخلاص. دلوقتي بنقسّمهم صفحات
  // عشان لو الغرفة فيها آلاف الرسائل ماننزّلهاش كلها مرة واحدة.
  const { page, limit, skip } = getPagination(query, 50);

  const messages = await Message.find({ room })
    .populate('user', 'name role') // نجيب اسم صاحب الرسالة ودوره
    .sort({ createdAt: 1 })        // الأقدم أولاً — زي ما الشات بيتقري
    .skip(skip)
    .limit(limit);

  // بنحسب العدد الكلي عشان الفرونت يعرف فيه كام صفحة
  const total = await Message.countDocuments({ room });

  return { messages, meta: buildMeta(total, page, limit) };
}

// ===== إرسال رسالة جديدة =====
async function sendMessage({ room, text }, userId) {
  let message = await Message.create({ room, text, user: userId });

  // بنعمل populate عشان الرد يرجّع اسم صاحب الرسالة على طول
  message = await message.populate('user', 'name role');

  return message;
}

module.exports = { getHistory, sendMessage };
