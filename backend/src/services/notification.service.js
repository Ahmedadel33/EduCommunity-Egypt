const cron = require('node-cron');
const User = require('../models/User');
const Material = require('../models/Material');
const Lesson = require('../models/Lesson');
const Post = require('../models/Post');
const Reward = require('../models/Reward');
const mailer = require('./mailer.service');

const APP_URL = process.env.FRONTEND_URL || 'http://localhost:8080';
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function isEnglish(user) {
  return user.preferences?.language === 'en';
}

function emailText(user, title, detail) {
  const greeting = isEnglish(user) ? `Hello ${user.name},` : `مرحباً ${user.name}،`;
  const openApp = isEnglish(user) ? 'Open EduCommunity' : 'افتح منصة EduCommunity';
  return `${greeting}\n\n${title}\n${detail}\n\n${openApp}: ${APP_URL}`;
}

async function sendToUsers(users, { category, titleAr, titleEn, detailAr, detailEn, required = false }) {
  if (!mailer.isConfigured()) {
    console.warn(`[email] ${category} notification skipped: Gmail SMTP is not configured.`);
    return;
  }

  const recipients = [...new Map(users
    .filter((user) => user.email && (required || user.preferences?.notifications?.[category] !== false))
    .map((user) => [user.email.toLowerCase(), user])).values()];

  for (let index = 0; index < recipients.length; index += 10) {
    const batch = recipients.slice(index, index + 10);
    const results = await Promise.allSettled(batch.map((user) => {
      const english = isEnglish(user);
      return mailer.sendEmail({
        to: user.email,
        subject: `[EduCommunity] ${english ? titleEn : titleAr}`,
        text: emailText(user, english ? titleEn : titleAr, english ? detailEn : detailAr),
      });
    }));

    results.forEach((result, batchIndex) => {
      if (result.status === 'rejected') {
        console.error(`[email] Failed to send ${category} notification for user ${batch[batchIndex]._id}:`, result.reason.message);
      }
    });
  }
}

async function notifyNewMaterial(materialId, actorId) {
  try {
    const material = await Material.findById(materialId).populate('subject', 'name');
    if (!material || material.status !== 'approved') return;

    const subjectName = material.subject?.name || '';
    const roleMatches = [
      { role: 'student', grade: material.grade },
      { role: 'teacher', grades: material.grade, ...(subjectName ? { subject: subjectName } : {}) },
      { role: 'supervisor', grades: material.grade },
      { role: 'admin' },
    ];
    const users = await User.find({
      _id: { $ne: actorId },
      email: { $exists: true, $ne: '' },
      $or: roleMatches,
    }).select('name email role preferences');

    await sendToUsers(users, {
      category: 'newMaterial',
      required: true,
      titleAr: 'مادة دراسية جديدة',
      titleEn: 'New study material',
      detailAr: `تم اعتماد مادة "${material.title}" للصف ${material.grade}${subjectName ? ` في ${subjectName}` : ''}.`,
      detailEn: `"${material.title}" is now available for grade ${material.grade}${subjectName ? ` in ${subjectName}` : ''}.`,
    });
  } catch (error) {
    console.error('[email] Failed to process new-material notification:', error.message);
  }
}

async function notifyNewLesson(lesson, actorId) {
  try {
    const users = await User.find({
      _id: { $ne: actorId },
      email: { $exists: true, $ne: '' },
      $or: [
        { role: 'student', grade: lesson.grade },
        { role: 'teacher', grades: lesson.grade },
        { role: 'supervisor', grades: lesson.grade },
        { role: 'admin' },
      ],
    }).select('name email role preferences');

    await sendToUsers(users, {
      category: 'liveLesson',
      required: true,
      titleAr: 'درس جديد',
      titleEn: 'New lesson',
      detailAr: `تمت جدولة "${lesson.title}" للصف ${lesson.grade} في ${new Date(lesson.startsAt).toLocaleString('ar-EG')}.`,
      detailEn: `"${lesson.title}" has been scheduled for grade ${lesson.grade} at ${new Date(lesson.startsAt).toLocaleString('en-US')}.`,
    });
  } catch (error) {
    console.error('[email] Failed to process new-lesson notification:', error.message);
  }
}

async function notifyCommunityPost(post, actorId) {
  try {
    const users = await User.find({
      _id: { $ne: actorId },
      email: { $exists: true, $ne: '' },
      'preferences.notifications.community': { $ne: false },
    }).select('name email preferences');

    await sendToUsers(users, {
      category: 'community',
      titleAr: 'منشور جديد في المجتمع',
      titleEn: 'New community post',
      detailAr: `نشر ${post.author_name || 'أحد أعضاء المجتمع'} تحديثاً جديداً.`,
      detailEn: `${post.author_name || 'A community member'} shared a new post.`,
    });
  } catch (error) {
    console.error('[email] Failed to process community-post notification:', error.message);
  }
}

async function notifyPostComment(postId, commenterId, commenterName) {
  try {
    const post = await Post.findById(postId).select('userId');
    if (!post || String(post.userId) === String(commenterId)) return;

    const owner = await User.findById(post.userId).select('name email preferences');
    if (!owner) return;
    await sendToUsers([owner], {
      category: 'community',
      titleAr: 'تعليق جديد على منشورك',
      titleEn: 'New comment on your post',
      detailAr: `أضاف ${commenterName} تعليقاً على منشورك.`,
      detailEn: `${commenterName} commented on your post.`,
    });
  } catch (error) {
    console.error('[email] Failed to process post-comment notification:', error.message);
  }
}

async function notifyReward(reward, actorId) {
  try {
    const recipientId = reward.user?._id || reward.user;
    if (!recipientId || String(recipientId) === String(actorId)) return;
    const recipient = await User.findById(recipientId).select('name email preferences');
    if (!recipient) return;

    await sendToUsers([recipient], {
      category: 'rewards',
      titleAr: 'مكافأة جديدة',
      titleEn: 'New reward',
      detailAr: `تم منحك "${reward.title}".`,
      detailEn: `You have received "${reward.title}".`,
    });
  } catch (error) {
    console.error('[email] Failed to process reward notification:', error.message);
  }
}

async function notifyChatMessage(room, senderId, senderName) {
  try {
    let filter;
    if (room.startsWith('private:')) {
      const participantIds = room.slice('private:'.length).split(':');
      if (participantIds.length !== 2 || !participantIds.includes(String(senderId))) return;
      const recipientId = participantIds.find((id) => id !== String(senderId));
      filter = { _id: recipientId };
    } else {
      filter = {
        _id: { $ne: senderId },
        $or: [
          { role: 'student', grade: room },
          { role: 'teacher', grades: room },
          { role: 'supervisor', grades: room },
        ],
      };
    }

    const users = await User.find({
      ...filter,
      email: { $exists: true, $ne: '' },
      'preferences.notifications.chat': { $ne: false },
    }).select('name email preferences');

    await sendToUsers(users, {
      category: 'chat',
      titleAr: 'رسالة جديدة',
      titleEn: 'New message',
      detailAr: `لديك رسالة جديدة من ${senderName}.`,
      detailEn: `You have a new message from ${senderName}.`,
    });
  } catch (error) {
    console.error('[email] Failed to process chat notification:', error.message);
  }
}

async function sendWeeklyDigest() {
  if (!mailer.isConfigured()) {
    console.warn('[email] Weekly digest skipped: Gmail SMTP is not configured.');
    return;
  }

  const now = new Date();
  const periodStart = new Date(now.getTime() - WEEK_MS);
  const [materials, lessons, posts, rewards, recipients] = await Promise.all([
    Material.countDocuments({ status: 'approved', createdAt: { $gte: periodStart } }),
    Lesson.countDocuments({ createdAt: { $gte: periodStart } }),
    Post.countDocuments({ createdAt: { $gte: periodStart } }),
    Reward.countDocuments({ createdAt: { $gte: periodStart } }),
    User.find({
      email: { $exists: true, $ne: '' },
      'preferences.notifications.weeklyDigest': { $ne: false },
      $or: [
        { weeklyDigestSentAt: { $exists: false } },
        { weeklyDigestSentAt: { $lte: periodStart } },
      ],
    }).select('name email preferences'),
  ]);

  for (const recipient of recipients) {
    const claimed = await User.findOneAndUpdate({
      _id: recipient._id,
      'preferences.notifications.weeklyDigest': { $ne: false },
      $or: [
        { weeklyDigestSentAt: { $exists: false } },
        { weeklyDigestSentAt: { $lte: periodStart } },
      ],
    }, { $set: { weeklyDigestSentAt: now } }, { new: true });

    if (!claimed) continue;

    const english = isEnglish(recipient);
    const subject = english ? 'Your weekly EduCommunity summary' : 'ملخص EduCommunity الأسبوعي';
    const details = english
      ? `New this week:\nStudy materials: ${materials}\nLessons: ${lessons}\nCommunity posts: ${posts}\nRewards: ${rewards}`
      : `الجديد هذا الأسبوع:\nالمواد الدراسية: ${materials}\nالدروس: ${lessons}\nمنشورات المجتمع: ${posts}\nالمكافآت: ${rewards}`;

    try {
      await mailer.sendEmail({
        to: recipient.email,
        subject: `[EduCommunity] ${subject}`,
        text: emailText(recipient, subject, details),
      });
    } catch (error) {
      await User.updateOne({ _id: recipient._id, weeklyDigestSentAt: now }, { $unset: { weeklyDigestSentAt: 1 } });
      console.error(`[email] Failed to send weekly digest for user ${recipient._id}:`, error.message);
    }
  }
}

function startWeeklyDigest() {
  return cron.schedule('0 9 * * 0', () => {
    sendWeeklyDigest().catch((error) => {
      console.error('[email] Weekly digest job failed:', error.message);
    });
  }, { timezone: 'Africa/Cairo' });
}

module.exports = {
  notifyNewMaterial,
  notifyNewLesson,
  notifyCommunityPost,
  notifyPostComment,
  notifyReward,
  notifyChatMessage,
  startWeeklyDigest,
};
