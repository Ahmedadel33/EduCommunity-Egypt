const rewardService = require('../services/reward.service');
const { sendSuccess, sendCreated } = require('../utils/apiResponse');

// ===== طبقة الكنترولر للمكافآت =====
// شغلها 3 خطوات بس ومفيش غيرهم:
//   1) تاخد البيانات من الطلب (req)
//   2) تنادي الـservice
//   3) تبعت الرد
// مفيش منطق ولا داتابيز هنا — ده شغل الـservice.
// ومفيش try/catch — ده شغل asyncHandler + error middleware.

async function list(req, res) {
  const rewards = await rewardService.list(req.user);
  return sendSuccess(res, { rewards });
}

async function create(req, res) {
  const reward = await rewardService.create(req.body, req.user.id);
  return sendCreated(res, { reward }, 'تم منح المكافأة');
}

module.exports = { list, create };
