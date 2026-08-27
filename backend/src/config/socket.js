const { Server } = require('socket.io');
const socketAuth = require('../middleware/socketAuth.middleware');
const registerSocketHandlers = require('../sockets');

// إعداد Socket.IO وتركيبه على سيرفر HTTP.
//
// ليه Socket.IO مش polling؟
//   - polling = الفرونت بيسأل السيرفر كل ثانيتين "فيه جديد؟" حتى لو مفيش
//   - Socket = اتصال دائم مفتوح، السيرفر هو اللي بيبعت أول ما يحصل جديد
//   → أسرع (فوري) وضغط أقل على السيرفر
function initSocket(httpServer) {
  const corsOrigins = (process.env.CORS_ORIGIN || '*').split(',').map((origin) => origin.trim());
  const io = new Server(httpServer, {
    cors: { origin: corsOrigins.includes('*') ? '*' : corsOrigins },
  });

  // أي اتصال لازم يعدّي على المصادقة الأول
  io.use(socketAuth);

  // نسجّل كل الهاندلرز (الشات وغيره)
  registerSocketHandlers(io);

  console.log('⚡ Socket.IO شغّال');
  return io;
}

module.exports = initSocket;
