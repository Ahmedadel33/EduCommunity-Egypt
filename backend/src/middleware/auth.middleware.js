const jwt = require('jsonwebtoken');

// (1) نتأكد إن المستخدم مسجّل دخول: لازم يبعت توكن صحيح في الهيدر
function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'يجب تسجيل الدخول أولاً' });
  }
  try {
    const token = header.split(' ')[1];           // ناخد التوكن بعد كلمة Bearer
    req.user = jwt.verify(token, process.env.JWT_SECRET); // نفكّه ونحط بياناته في req.user
    next();                                        // كمّل للخطوة اللي بعده
  } catch (e) {
    res.status(401).json({ error: 'توكن غير صالح أو منتهي' });
  }
}

// (2) نتأكد إن دور المستخدم مسموح له (مثال: authorize('teacher','admin'))
function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'لا تملك صلاحية لهذا الإجراء' });
    }
    next();
  };
}

module.exports = { authenticate, authorize };
