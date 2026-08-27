const Message = require('../models/Message');
const User = require('../models/User');
const Shift = require('../models/Shift');
const ApiError = require('../utils/ApiError');
const { getPagination, buildMeta } = require('../utils/pagination');

function privateRoomId(firstId, secondId) {
  return `private:${[String(firstId), String(secondId)].sort().join(':')}`;
}

async function getRoomAccess(room, user) {
  if (!room) return false;
  if (user.role === 'admin') return true;
  const requester = await User.findById(user.id).select('role grade grades');
  if (!requester) return false;

  if (room.startsWith('private:')) {
    const ids = room.slice('private:'.length).split(':');
    if (ids.length !== 2 || !ids.includes(String(user.id))) return false;

    const otherId = ids.find((id) => id !== String(user.id));
    const other = await User.findById(otherId).select('role grade grades');
    if (!other) return false;

    const student = requester.role === 'student' ? requester : other.role === 'student' ? other : null;
    const teacher = requester.role === 'teacher' ? requester : other.role === 'teacher' ? other : null;
    if (!student || !teacher) return false;
    return Boolean(student.grade && teacher.grades?.includes(student.grade));
  }

  if (requester.role === 'student') return room === requester.grade;
  if (requester.role === 'teacher') return requester.grades?.includes(room);
  return false;
}

async function assertRoomAccess(room, user) {
  if (!(await getRoomAccess(room, user))) throw new ApiError(403, 'لا تملك صلاحية لهذه الغرفة');
}

async function listContacts(user, query = {}) {
  const requester = await User.findById(user.id).select('role grade grades');
  if (!requester) return { teachers: [], students: [], meta: null };

  if (requester.role === 'teacher') {
    const { page, limit, skip } = getPagination(query, 20);
    const search = String(query.search || '').trim();
    const filter = { role: 'student', grade: { $in: requester.grades || [] } };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    const [students, total] = await Promise.all([
      User.find(filter).select('name email grade').sort({ name: 1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);
    return {
      teachers: [],
      students: students.map((student) => ({
        id: student._id,
        name: student.name,
        email: student.email,
        grade: student.grade,
        room: privateRoomId(requester._id, student._id),
      })),
      meta: buildMeta(total, page, limit),
    };
  }

  if (requester.role !== 'student' || !requester.grade) return { teachers: [], students: [], meta: null };

  const teachers = await User.find({ role: 'teacher', grades: requester.grade })
    .select('name subject grades')
    .sort({ name: 1 });
  const now = new Date();
  const shifts = await Shift.find({ teacher: { $in: teachers.map((teacher) => teacher._id) } })
    .select('teacher startsAt endsAt')
    .sort({ startsAt: 1 });

  return {
    teachers: teachers.map((teacher) => {
    const teacherShifts = shifts.filter((shift) => String(shift.teacher) === String(teacher._id));
    const currentShift = teacherShifts.find((shift) => shift.startsAt <= now && shift.endsAt >= now);
    const nextShift = teacherShifts.find((shift) => shift.startsAt > now);
    return {
      id: teacher._id,
      name: teacher.name,
      subject: teacher.subject,
      room: privateRoomId(requester._id, teacher._id),
      onDuty: Boolean(currentShift),
      nextShiftAt: nextShift?.startsAt || null,
    };
    }),
    students: [],
    meta: null,
  };
}

// ===== طبقة الخدمات (Service) =====
// هنا كل منطق الشغل والتعامل مع الداتابيز.
//
// مهم: الشات الحقيقي (اللحظي) شغّال بـSocket.IO في sockets/chat.handler.js —
// هو اللي بيبعت ويستقبل الرسائل فوراً وقت ما الطالب مفتوح الصفحة.
// المسارات دي (REST) وظيفتها إنها تحمّل الرسائل القديمة أول ما الصفحة تفتح،
// وكمان بتنفع كـplan B لو الاتصال اللحظي وقع.

// ===== جلب رسائل غرفة معينة (مثال: ?room=sec-1) =====
async function getHistory(query, user) {
  const room = query.room;
  if (!room) throw new ApiError(400, 'اختر الغرفة'); // من غير غرفة مش هنعرف نجيب إيه
  await assertRoomAccess(room, user);

  // الكود القديم كان بيجيب 100 رسالة وخلاص. دلوقتي بنقسّمهم صفحات
  // عشان لو الغرفة فيها آلاف الرسائل ماننزّلهاش كلها مرة واحدة.
  const { page, limit, skip } = getPagination(query, 50);

  const messages = await Message.find({ room })
    .populate('user', 'name role') // نجيب اسم صاحب الرسالة ودوره
    .sort({ createdAt: 1 })        // الأقدم أولاً — زي ما الشات بيتقري
    .skip(skip)
    .limit(limit);

  // بنحسب العدد الكلي عشان الفرونت يعرف فيه كام صفحة
  const total = await Message.countDocuments({ room });

  return { messages, meta: buildMeta(total, page, limit) };
}

// ===== إرسال رسالة جديدة =====
async function sendMessage({ room, text }, user) {
  await assertRoomAccess(room, user);
  let message = await Message.create({ room, text, user: user.id });

  // بنعمل populate عشان الرد يرجّع اسم صاحب الرسالة على طول
  message = await message.populate('user', 'name role');

  return message;
}

module.exports = { getHistory, sendMessage, listContacts, assertRoomAccess, privateRoomId };
