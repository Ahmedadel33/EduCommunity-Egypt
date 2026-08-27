const adminService = require('../services/admin.service');
const { sendSuccess } = require('../utils/apiResponse');

// ===== طبقة الكنترولر للوحة الأدمن =====
// 3 خطوات بس: نقرا من الطلب → ننادي الـservice → نبعت الرد.
// مفيش منطق ولا داتابيز ولا try/catch هنا.

async function stats(req, res) {
  const result = await adminService.stats();
  return sendSuccess(res, result);
}

async function listUsers(req, res) {
  const users = await adminService.listUsers();
  return sendSuccess(res, { users });
}

async function deleteUser(req, res) {
  await adminService.deleteUser(req.params.id);
  return sendSuccess(res, { ok: true }, 'تم حذف المستخدم');
}

module.exports = { stats, listUsers, deleteUser };
