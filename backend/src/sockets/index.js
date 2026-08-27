const registerChatHandlers = require('./chat.handler');

// نقطة تجميع كل هاندلرز الـSocket.
// كل اتصال جديد بيعدّي من هنا، وبنسجّل له الهاندلرز اللي محتاجينها.
// لو زوّدنا ميزة لحظية جديدة بعدين (إشعارات مثلاً)، بنضيف سطر واحد هنا بس.
function registerSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log(`🔌 اتصال جديد: ${socket.user.name}`);

    // نسجّل هاندلرز الشات لليوزر ده
    registerChatHandlers(io, socket);

    socket.on('disconnect', () => {
      console.log(`❌ انقطع الاتصال: ${socket.user.name}`);
    });
  });
}

module.exports = registerSocketHandlers;
