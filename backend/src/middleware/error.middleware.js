const ApiError = require('../utils/ApiError');
const { sendError } = require('../utils/apiResponse');

// معالج الأخطاء المركزي — آخر middleware في السيرفر.
// أي throw في أي كنترولر بيوصل هنا (عن طريق asyncHandler → next(err)).
// فايدته: كل الأخطاء بتطلع بنفس الشكل، ومفيش try/catch مكرّر في كل ملف.
function errorMiddleware(err, req, res, next) {
  // 1) أخطاء إحنا رميناها بنفسنا — نرجّعها زي ما هي
  if (err instanceof ApiError) {
    return sendError(res, err.statusCode, err.message);
  }

  // 2) خطأ من Mongoose: id شكله غلط (مش ObjectId صالح)
  if (err.name === 'CastError') {
    return sendError(res, 400, 'المعرّف (id) غير صحيح');
  }

  // 3) خطأ من Mongoose: البيانات مش مطابقة للـ schema
  if (err.name === 'ValidationError') {
    const first = Object.values(err.errors)[0];
    return sendError(res, 400, first?.message || 'بيانات غير صحيحة');
  }

  // 4) قيمة مكرّرة في حقل unique (مثلاً بريد مسجّل قبل كده)
  if (err.code === 11000) {
    return sendError(res, 409, 'هذه القيمة مسجّلة من قبل');
  }

  // 5) أي حاجة تانية = باج مش متوقّع → نطبعه في الكونسول ونرجّع 500
  console.error('❌ خطأ غير متوقّع:', err);
  return sendError(res, 500, 'حصل خطأ في السيرفر');
}

module.exports = errorMiddleware;
