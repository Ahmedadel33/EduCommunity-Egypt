const jwt = require('jsonwebtoken');

// مصادقة اتصال الـSocket.
// الفرق عن REST: في REST التوكن بييجي في هيدر Authorization مع كل طلب،
// أما في Socket فالاتصال بيتعمل مرة واحدة — فبنتحقّق من التوكن وقت الـhandshake بس.
//
// الفرونت بيبعته كده:
//   io(url, { auth: { token: accessToken } })
//
// ليه ده مهم؟ من غيره أي حد يقدر يفتح اتصال ويسمع رسائل الشات.
function socketAuth(socket, next) {
  const token = socket.handshake.auth?.token;

  if (!token) {
    return next(new Error('مطلوب تسجيل الدخول'));
  }

  try {
    // نفكّ التوكن ونحطّ بيانات المستخدم على الـsocket نفسه
    // عشان أي handler بعد كده يعرف مين اللي بيكلّمه (socket.user)
    socket.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (e) {
    next(new Error('توكن غير صالح أو منتهي'));
  }
}

module.exports = socketAuth;
