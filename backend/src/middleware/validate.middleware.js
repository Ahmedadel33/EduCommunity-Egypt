const ApiError = require('../utils/ApiError');

// ميدلوير التحقّق من البيانات.
// بياخد دالة تحقّق بسيطة (من مجلد validators) وبينفّذها على req.body.
// الدالة بترجّع رسالة خطأ (نص) لو فيه غلط، أو null لو كله تمام.
//
// الاستخدام:  router.post('/', validate(authValidator.register), controller.register)
//
// ليه ميدلوير منفصل؟ عشان الكنترولر يبقى نضيف ومركّز على المنطق بس،
// والتحقّق يبقى في مكان واحد نقدر نعيد استخدامه ونقراه بسهولة.
function validate(validatorFn) {
  return (req, res, next) => {
    const errorMessage = validatorFn(req.body);
    if (errorMessage) {
      throw new ApiError(400, errorMessage); // الـ error middleware هيحوّلها لرد 400
    }
    next(); // البيانات سليمة — كمّل للكنترولر
  };
}

module.exports = validate;
