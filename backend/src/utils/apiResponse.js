// كل ردود الـAPI بتطلع بنفس الشكل:
//   { success, message, data, meta? }
// كده الفرونت بيتعامل مع شكل واحد ثابت في كل الطلبات.

// رد ناجح عادي (200)
function sendSuccess(res, data = null, message = '', meta = undefined) {
  const body = { success: true, message, data };
  if (meta) body.meta = meta; // meta بتيجي بس مع القوائم المقسّمة لصفحات
  return res.status(200).json(body);
}

// رد إنشاء حاجة جديدة (201)
function sendCreated(res, data = null, message = 'تم الإنشاء بنجاح') {
  return res.status(201).json({ success: true, message, data });
}

// رد خطأ — بيستخدمه الـ error middleware بس
function sendError(res, statusCode = 500, message = 'حصل خطأ في السيرفر') {
  return res.status(statusCode).json({ success: false, message, data: null });
}

module.exports = { sendSuccess, sendCreated, sendError };
