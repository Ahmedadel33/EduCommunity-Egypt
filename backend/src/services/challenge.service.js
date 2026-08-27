const Challenge = require('../models/Challenge');
const ChallengeSubmission = require('../models/ChallengeSubmission');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

// ===== طبقة الخدمات (Service) للتحديات =====
// هنا كل منطق الشغل والتعامل مع الداتابيز.
// الكنترولر مابيعرفش حاجة عن Mongoose — بينادي الدوال دي بس.

// ===== عرض التحديات الفعّالة =====
// النشطة فقط، مرتّبة حسب تاريخ الانتهاء (اللي قرب يخلص الأول).
async function listActive() {
  const challenges = await Challenge.find({ active: true }).sort({ endDate: 1 });

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
  }));
}

// ===== حلول المستخدم نفسه =====
// كل مستخدم بيشوف حلوله هو بس.
async function listMySubmissions(userId) {
  return ChallengeSubmission.find({ userId });
}

// ===== حلّ تحدي =====
async function submit(challengeId, user, data) {
  const challenge = await Challenge.findById(challengeId);
  if (!challenge) throw new ApiError(404, 'التحدي غير موجود');

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

module.exports = { listActive, listMySubmissions, submit };
