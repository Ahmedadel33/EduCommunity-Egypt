const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const subjectService = require('./subject.service');
const ApiError = require('../utils/ApiError');

// ===== طبقة الخدمات (Service) =====
// هنا كل منطق الشغل والتعامل مع الداتابيز.
// الكنترولر مابيعرفش حاجة عن Mongoose — بينادي الدوال دي بس.
// الفايدة: نقدر نغيّر الداتابيز أو نعيد استخدام المنطق من غير ما نلمس الكنترولر.

// ===== التوكنات =====
// عندنا نوعين:
//   1) accessToken  — قصير (15 دقيقة)، بيتبعت مع كل طلب. لو اتسرق يبوظ بسرعة.
//   2) refreshToken — طويل (7 أيام)، وظيفته الوحيدة إنه يجيب accessToken جديد.
// كده لو حد سرق الـaccess عنده 15 دقيقة بس بدل 7 أيام،
// والمستخدم مايضطرش يسجّل دخول كل ربع ساعة.

function makeAccessToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
}

function makeRefreshToken(user) {
  return jwt.sign(
    { id: user._id, type: 'refresh' }, // مفيش دور ولا اسم — ده للتجديد بس
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
}

function makeTokens(user) {
  return { token: makeAccessToken(user), refreshToken: makeRefreshToken(user) };
}

// ===== تسجيل حساب جديد =====
async function register(data) {
  const { name, email, password, role, grade, grades, subject, schoolCode, nationalId } = data;
  const accountRole = role || 'student';
  if (!['student', 'teacher'].includes(accountRole)) {
    throw new ApiError(403, 'لا يمكن إنشاء هذا النوع من الحسابات من التسجيل العام');
  }
  const teacherGrades = accountRole === 'teacher' && Array.isArray(grades) ? grades : [];

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) throw new ApiError(409, 'البريد مسجّل من قبل');

  if (accountRole === 'teacher') {
    await subjectService.ensureTeacherSubjects(subject, teacherGrades);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    role: accountRole,
    grade: accountRole === 'teacher' ? teacherGrades[0] : grade,
    grades: teacherGrades,
    subject: accountRole === 'teacher' ? subject : undefined, // التخصّص للمدرس بس
    schoolCode,
    nationalId,
  });

  return { user, ...makeTokens(user) };
}

// ===== تسجيل الدخول =====
async function login({ email, password }) {
  const user = await User.findOne({ email: (email || '').toLowerCase() });
  if (!user) throw new ApiError(401, 'بيانات الدخول غير صحيحة');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new ApiError(401, 'بيانات الدخول غير صحيحة');

  // لو المستخدم مدرس: نفتح له سجل حضور تلقائي (الأدمن بيبني عليه التقييم)
  if (user.role === 'teacher') {
    await Attendance.create({ teacher: user._id, loginAt: new Date() });
  }

  return { user, ...makeTokens(user) };
}

// ===== تجديد التوكن =====
// الفرونت بيبعت الـrefreshToken لما الـaccess يخلص، وبناخد واحد جديد.
async function refresh(refreshToken) {
  let payload;
  try {
    payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch (e) {
    throw new ApiError(401, 'انتهت الجلسة — سجّل دخول من جديد');
  }

  // نتأكد إنه refresh token مش access token (حد ممكن يبعت النوع الغلط)
  if (payload.type !== 'refresh') {
    throw new ApiError(401, 'توكن غير صالح');
  }

  // نتأكد إن المستخدم لسه موجود (ممكن يكون اتحذف)
  const user = await User.findById(payload.id);
  if (!user) throw new ApiError(401, 'المستخدم غير موجود');

  return { user, ...makeTokens(user) };
}

// ===== بياناتي =====
async function getMe(userId) {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'المستخدم غير موجود');
  return user;
}

// ===== تعديل بياناتي =====
// بيقبل: الاسم · كلمة المرور · نبذة · الصف · كود المدرسة · التفضيلات (إشعارات/خصوصية/لغة/مظهر)
async function updateMe(userId, data, avatarUrl) {
  const { name, currentPassword, password, bio, grade, grades, schoolCode, preferences, avatarPosition } = data;

  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'المستخدم غير موجود');

  if (name) user.name = name;
  if (password) {
    if (!currentPassword || !(await bcrypt.compare(currentPassword, user.password))) {
      throw new ApiError(401, 'كلمة المرور الحالية غير صحيحة');
    }
    user.password = await bcrypt.hash(password, 10);
  }
  if (bio !== undefined) user.bio = bio;
  if (grade !== undefined) user.grade = grade;
  if (user.role === 'teacher' && grades !== undefined) {
    user.grades = typeof grades === 'string' ? JSON.parse(grades) : grades;
    user.grade = user.grades[0];
    await subjectService.ensureTeacherSubjects(user.subject, user.grades);
  }
  if (schoolCode !== undefined) user.schoolCode = schoolCode;
  if (avatarUrl) user.avatarUrl = avatarUrl;
  const parsedAvatarPosition = typeof avatarPosition === 'string'
    ? (() => { try { return JSON.parse(avatarPosition); } catch { return null; } })()
    : avatarPosition;
  if (parsedAvatarPosition && typeof parsedAvatarPosition === 'object') {
    const x = Number(parsedAvatarPosition.x);
    const y = Number(parsedAvatarPosition.y);
    if (Number.isFinite(x)) user.avatarPosition.x = Math.max(0, Math.min(100, x));
    if (Number.isFinite(y)) user.avatarPosition.y = Math.max(0, Math.min(100, y));
  }

  // التفضيلات: دمج جزئي (نحدّث اللي اتبعت بس ونسيب الباقي زي ما هو)
  if (preferences && typeof preferences === 'object') {
    if (preferences.notifications) {
      user.preferences.notifications = {
        ...(user.preferences.notifications.toObject?.() ?? user.preferences.notifications),
        ...preferences.notifications,
        newMaterial: true,
        liveLesson: true,
      };
    }
    if (preferences.privacy) {
      user.preferences.privacy = { ...user.preferences.privacy.toObject?.() ?? user.preferences.privacy, ...preferences.privacy };
    }
    if (preferences.language !== undefined) user.preferences.language = preferences.language;
    if (preferences.theme !== undefined) user.preferences.theme = preferences.theme;
    if (preferences.fontSize !== undefined) user.preferences.fontSize = preferences.fontSize;
    user.markModified('preferences');
  }

  await user.save();

  // نرجّع توكنات جديدة لأن الاسم جوّا الـaccess token
  return { user, ...makeTokens(user) };
}

module.exports = { register, login, refresh, getMe, updateMe };
