const Message = require('../models/Message');

// هاندلر الشات — بيتنفّذ لكل مستخدم بيتّصل.
// الفكرة: كل صف دراسي = "غرفة" (room) اسمها كود الصف مثل sec-1.
// لما الطالب يدخل غرفة صفه، أي رسالة تتبعت فيها توصله فوراً من غير ما يسأل السيرفر.
//
// الأحداث:
//   الفرونت → السيرفر: join_room · send_message · typing
//   السيرفر → الفرونت: new_message · user_typing
function registerChatHandlers(io, socket) {
  // (1) المستخدم بيدخل غرفة صفه
  socket.on('join_room', (room) => {
    if (!room) return;
    socket.join(room); // Socket.IO بيحطّه في الغرفة دي
    console.log(`👤 ${socket.user.name} دخل غرفة ${room}`);
  });

  // (2) المستخدم بيبعت رسالة (نص و/أو مرفق: صوت/صورة/ملف)
  socket.on('send_message', async ({ room, text, kind, attachmentUrl, attachmentName, attachmentType }) => {
    try {
      // لازم يكون فيه نص أو مرفق على الأقل
      if (!room || (!text && !attachmentUrl)) return;

      // نحفظ الرسالة في الداتابيز (عشان تفضل موجودة زي واتساب لما يقفل ويفتح)
      let message = await Message.create({
        room,
        user: socket.user.id,
        text: text || '',
        kind: kind || 'text',
        attachmentUrl: attachmentUrl || '',
        attachmentName: attachmentName || '',
        attachmentType: attachmentType || '',
      });
      message = await message.populate('user', 'name role');

      // نبثّها لكل اللي في الغرفة (بما فيهم اللي باعتها)
      io.to(room).emit('new_message', message);
    } catch (e) {
      console.error('خطأ في إرسال الرسالة:', e.message);
      socket.emit('error_message', 'فشل إرسال الرسالة');
    }
  });

  // (3) مؤشّر "بيكتب دلوقتي"
  socket.on('typing', (room) => {
    if (!room) return;
    // socket.to = لكل اللي في الغرفة ما عدا اللي بيكتب نفسه
    socket.to(room).emit('user_typing', { name: socket.user.name });
  });
}

module.exports = registerChatHandlers;
