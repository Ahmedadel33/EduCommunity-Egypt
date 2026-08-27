const User = require('../models/User');
const Post = require('../models/Post');
const Challenge = require('../models/Challenge');

// ===== طبقة الخدمات (Service) للوحة الأدمن =====
// هنا كل منطق الشغل والتعامل مع الداتابيز.
// الكنترولر مابيعرفش حاجة عن Mongoose — بينادي الدوال دي بس.

// ===== إحصائيات النظام =====
// عدد المستخدمين حسب الدور + إجمالي المنشورات + التحديات النشطة.
async function stats() {
  // aggregation: نجمّع المستخدمين حسب الدور ونعدّ كل مجموعة
  const usersByRoleAgg = await User.aggregate([
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 },
      },
    },
  ]);

  // الفرونت بيستنى count كنص، فبنحوّله String زي الكود القديم
  const usersByRole = usersByRoleAgg.map(u => ({
    role: u._id,
    count: String(u.count),
  }));

  const totalPosts = await Post.countDocuments();
  const activeChallenges = await Challenge.countDocuments({ active: true });

  return { usersByRole, totalPosts, activeChallenges };
}

// ===== قائمة المستخدمين =====
// الأحدث الأول، وأقصى 200 مستخدم.
async function listUsers() {
  const users = await User.find()
    .select('name email role grade points createdAt')
    .sort({ createdAt: -1 })
    .limit(200);

  return users.map(u => ({
    id: u._id,
    name: u.name,
    email: u.email,
    role: u.role,
    grade: u.grade,
    points: u.points,
    created_at: u.createdAt,
  }));
}

// ===== حذف مستخدم =====
async function deleteUser(userId) {
  await User.findByIdAndDelete(userId);
}

module.exports = { stats, listUsers, deleteUser };
