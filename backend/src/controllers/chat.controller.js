const chatService = require('../services/chat.service');
const upload = require('../middleware/upload.middleware');
const { sendSuccess, sendCreated } = require('../utils/apiResponse');
const ApiError = require('../utils/ApiError');

// ===== طبقة الكنترولر =====
// شغلها 3 خطوات بس ومفيش غيرهم:
//   1) تاخد البيانات من الطلب (req)
//   2) تنادي الـservice
//   3) تبعت الرد
// مفيش منطق ولا داتابيز هنا — ده شغل الـservice.
// ومفيش try/catch — ده شغل asyncHandler + error middleware.

async function getHistory(req, res) {
  const { messages, meta } = await chatService.getHistory(req.query, req.user);
  return sendSuccess(res, { messages }, '', meta); // الـmeta فيها بيانات الصفحات
}

async function sendMessage(req, res) {
  const message = await chatService.sendMessage(req.body, req.user);
  return sendCreated(res, { message }, 'تم إرسال الرسالة');
}

async function getContacts(req, res) {
  const contacts = await chatService.listContacts(req.user, req.query);
  return sendSuccess(res, contacts);
}

// رفع مرفق للشات (صوت / صورة / ملف بأي نوع) — بيرجّع رابط المرفق
// الفرونت بيرفع الملف الأول، وبعدين يبعت الرسالة عبر السوكت ومعاها الرابط.
async function uploadAttachment(req, res) {
  if (!req.file) throw new ApiError(400, 'لم يتم رفع أي ملف');
  return sendSuccess(res, {
    url: upload.getFileUrl(req.file),
    name: req.file.originalname,
    type: req.file.mimetype,
  }, 'تم رفع المرفق');
}

module.exports = { getHistory, sendMessage, getContacts, uploadAttachment };
