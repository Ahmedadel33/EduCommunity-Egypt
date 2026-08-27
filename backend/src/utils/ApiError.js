// كلاس بسيط للأخطاء بتاعتنا
// بدل ما نكتب res.status(404).json({...}) في كل مكان،
// بنعمل: throw new ApiError(404, 'المادة غير موجودة')
// والـ error middleware هو اللي بيحوّلها لرد HTTP.
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode; // كود HTTP (400 / 401 / 403 / 404 ...)
    this.isOperational = true;    // خطأ متوقّع إحنا رميناه، مش باج في السيرفر
  }
}

module.exports = ApiError;
