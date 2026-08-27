const Challenge = require('../models/Challenge');
const ChallengeSubmission = require('../models/ChallengeSubmission');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

const GRADE_LABELS = {
  'primary-1': 'الأول الابتدائي', 'primary-2': 'الثاني الابتدائي', 'primary-3': 'الثالث الابتدائي',
  'primary-4': 'الرابع الابتدائي', 'primary-5': 'الخامس الابتدائي', 'primary-6': 'السادس الابتدائي',
  'prep-1': 'الأول الإعدادي', 'prep-2': 'الثاني الإعدادي', 'prep-3': 'الثالث الإعدادي',
  'sec-1': 'الأول الثانوي', 'sec-2': 'الثاني الثانوي', 'sec-3': 'الثالث الثانوي',
};

function gradeMatches(challengeGrade, grade) {
  return challengeGrade === grade || challengeGrade === `الصف ${GRADE_LABELS[grade]}`;
}

// ===== طبقة الخدمات (Service) للتحديات =====
// هنا كل منطق الشغل والتعامل مع الداتابيز.
// الكنترولر مابيعرفش حاجة عن Mongoose — بينادي الدوال دي بس.

// ===== عرض التحديات الفعّالة =====
// النشطة فقط، مرتّبة حسب تاريخ الانتهاء (اللي قرب يخلص الأول).
async function listActive() {
  const challenges = await Challenge.find({ active: true, $or: [{ status: 'approved' }, { status: { $exists: false } }] }).sort({ endDate: 1 });

  return challenges.map(ch => ({
    id: ch._id,
    title: ch.title,
    description: ch.description,
    subject: ch.subject,
    grade: ch.grade,
    points: ch.points,
    start_date: ch.startDate,
    end_date: ch.endDate,
    active: ch.active,
    status: ch.status,
  }));
}

async function createChallenge(data, user) {
  const creator = await User.findById(user.id).select('role subject grades');
  if (!creator) throw new ApiError(404, 'المستخدم غير موجود');
  if (!data.title || !data.description || !data.subject || !data.grade || !data.startDate || !data.endDate) {
    throw new ApiError(400, 'كل بيانات المسابقة مطلوبة');
  }
  if (new Date(data.endDate) <= new Date(data.startDate)) throw new ApiError(400, 'تاريخ النهاية يجب أن يكون بعد البداية');
  if (Number(data.points) <= 0) throw new ApiError(400, 'النقاط يجب أن تكون أكبر من صفر');
  if (creator.role === 'teacher' && (creator.subject !== data.subject || !creator.grades?.includes(data.grade))) {
    throw new ApiError(403, 'يمكنك إنشاء مسابقات لمادتك وصفوفك فقط');
  }
  return Challenge.create({
    title: data.title, description: data.description, subject: data.subject, grade: data.grade,
    points: Number(data.points), startDate: data.startDate, endDate: data.endDate,
    active: creator.role === 'admin', status: creator.role === 'admin' ? 'approved' : 'pending', createdBy: creator._id,
  });
}

async function listMine(user) {
  return Challenge.find({ createdBy: user.id }).sort({ createdAt: -1 });
}

async function listPending() {
  return Challenge.find({ status: 'pending' }).populate('createdBy', 'name email subject').sort({ createdAt: -1 });
}

async function updateStatus(id, status) {
  const challenge = await Challenge.findByIdAndUpdate(id, { status, active: status === 'approved' }, { new: true });
  if (!challenge) throw new ApiError(404, 'المسابقة غير موجودة');
  return challenge;
}

// ===== حلول المستخدم نفسه =====
// كل مستخدم بيشوف حلوله هو بس.
async function listMySubmissions(userId) {
  return ChallengeSubmission.find({ userId });
}

async function listTeacherSubmissions(user, query = {}) {
  const teacher = await User.findById(user.id).select('role grades subject');
  if (!teacher || teacher.role !== 'teacher') throw new ApiError(403, 'هذه الصفحة للمدرسين فقط');

  const assignedGrades = teacher.grades || [];
  const challengeGrades = assignedGrades.flatMap((grade) => [grade, `الصف ${GRADE_LABELS[grade]}`]);
  const challenges = await Challenge.find({ grade: { $in: challengeGrades } }).select('_id title subject grade points');
  const challengeIds = challenges.map((challenge) => challenge._id);
  const filter = { challengeId: { $in: challengeIds } };
  if (query.status === 'graded') filter.score = { $exists: true };
  if (query.status === 'pending') filter.score = { $exists: false };

  const submissions = await ChallengeSubmission.find(filter)
    .populate('challengeId', 'title subject grade points')
    .populate('userId', 'name email grade')
    .sort({ submittedAt: -1 });
  return submissions;
}

async function gradeSubmission(submissionId, user, score) {
  const teacher = await User.findById(user.id).select('role grades');
  if (!teacher || teacher.role !== 'teacher') throw new ApiError(403, 'التقييم متاح للمدرسين فقط');

  const submission = await ChallengeSubmission.findById(submissionId).populate('challengeId', 'points grade');
  if (!submission) throw new ApiError(404, 'الحل غير موجود');
  if (!teacher.grades?.some((grade) => gradeMatches(submission.challengeId.grade, grade))) throw new ApiError(403, 'لا يمكنك تقييم هذا التحدي');
  if (!Number.isFinite(score) || score < 0 || score > submission.challengeId.points) {
    throw new ApiError(400, `الدرجة يجب أن تكون بين 0 و${submission.challengeId.points}`);
  }

  const previousScore = submission.score || 0;
  submission.score = score;
  await submission.save();
  if (score !== previousScore) {
    await User.findByIdAndUpdate(submission.userId, { $inc: { points: score - previousScore } });
  }
  return submission;
}

// ===== حلّ تحدي =====
async function submit(challengeId, user, data) {
  if (user.role !== 'student') throw new ApiError(403, 'حل المسابقات متاح للطلاب فقط');
  const challenge = await Challenge.findById(challengeId);
  if (!challenge) throw new ApiError(404, 'التحدي غير موجود');
  const student = await User.findById(user.id).select('grade');
  if (!student?.grade || !gradeMatches(challenge.grade, student.grade)) throw new ApiError(403, 'هذا التحدي ليس مخصصًا لصفك');

  // ممنوع يحلّ نفس التحدي مرتين
  const duplicate = await ChallengeSubmission.findOne({
    challengeId: challenge._id,
    userId: user.id,
  });
  if (duplicate) throw new ApiError(400, 'لقد قمت بحل هذا التحدي مسبقاً');

  const submissionDoc = await ChallengeSubmission.create({
    challengeId: challenge._id,
    userId: user.id,
    answer: data.answer,
  });

  // نزوّد نقاط المستخدم بنقاط التحدي — $inc بتزوّد على القيمة الحالية
  await User.findByIdAndUpdate(user.id, {
    $inc: { points: challenge.points },
  });

  return {
    id: submissionDoc._id,
    challenge_id: submissionDoc.challengeId,
    user_id: submissionDoc.userId,
    answer: submissionDoc.answer,
    submitted_at: submissionDoc.submittedAt,
  };
}

module.exports = { listActive, createChallenge, listMine, listPending, updateStatus, listMySubmissions, listTeacherSubmissions, gradeSubmission, submit };
