const Reward = require('../models/Reward');
const User = require('../models/User');

// ===== طبقة الخدمات (Service) للمكافآت =====
// هنا كل منطق الشغل والتعامل مع الداتابيز.
// الكنترولر مابيعرفش حاجة عن Mongoose — بينادي الدوال دي بس.

// ===== عرض المكافآت =====
// الأدمن يشوف كل المكافآت · باقي المستخدمين يشوفوا مكافآتهم هم بس.
// بناخد الـuser كامل عشان نقرا الدور والـid ونبني الفلتر عليهم.
async function list(user) {
  // الفلتر ده مهم: من غيره أي مستخدم عادي هيشوف مكافآت الناس كلها
  const filter = user.role === 'admin' ? {} : { user: user.id };

  const rewards = await Reward.find(filter)
    .populate('user', 'name role')
    .sort({ createdAt: -1 }); // الأحدث الأول

  return rewards;
}

// ===== الأدمن يمنح مكافأة لمستخدم =====
// التحقّق من المستخدم والعنوان بيحصل في الـvalidator قبل ما نوصل هنا.
async function create({ user, title, type, note }, givenById) {
  const reward = await Reward.create({ user, title, type, note, givenBy: givenById });

  // لو المكافأة شارة، نضيف عنوانها لمصفوفة badges بتاعة المستخدم كمان.
  // بنخزّنها في مكانين: هنا كسجل مكافأة كامل، وهناك في المستخدم عشان
  // نعرض شاراته بسرعة من غير ما نلفّ على كل المكافآت في كل مرة.
  // ($addToSet بيمنع تكرار نفس الشارة لو اتمنحت مرتين)
  if ((type || 'badge') === 'badge') {
    await User.findByIdAndUpdate(user, { $addToSet: { badges: title } });
  }

  return reward;
}

module.exports = { list, create };
