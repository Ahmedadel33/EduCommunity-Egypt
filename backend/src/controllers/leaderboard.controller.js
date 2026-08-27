const leaderboardService = require('../services/leaderboard.service');
const { sendSuccess } = require('../utils/apiResponse');

// ===== طبقة الكنترولر للوحة المتصدّرين =====
// 3 خطوات بس: نقرا من الطلب → ننادي الـservice → نبعت الرد.
// مفيش منطق ولا داتابيز ولا try/catch هنا.

async function topStudents(req, res) {
  const leaderboard = await leaderboardService.topStudents(req.query);
  return sendSuccess(res, { leaderboard });
}

async function topSchools(req, res) {
  const schools = await leaderboardService.topSchools();
  return sendSuccess(res, { schools });
}

module.exports = { topStudents, topSchools };
