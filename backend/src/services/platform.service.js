const User = require('../models/User');
const Challenge = require('../models/Challenge');
const TeacherRating = require('../models/TeacherRating');

async function stats() {
  const [registeredUsers, badgeCount, activeChallenges, ratingSummary] = await Promise.all([
    User.countDocuments(),
    User.aggregate([
      { $unwind: '$badges' },
      { $count: 'total' },
    ]),
    Challenge.countDocuments({
      active: true,
      $or: [{ status: 'approved' }, { status: { $exists: false } }],
    }),
    TeacherRating.aggregate([
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          ratingsCount: { $sum: 1 },
        },
      },
    ]),
  ]);

  const averageRating = ratingSummary[0]?.averageRating ?? null;
  const ratingsCount = ratingSummary[0]?.ratingsCount ?? 0;

  return {
    registeredUsers,
    badges: badgeCount[0]?.total ?? 0,
    activeChallenges,
    averageRating,
    ratingsCount,
    satisfactionPercent: averageRating === null ? null : Math.round((averageRating / 5) * 100),
  };
}

module.exports = { stats };
