const materialService = require('../services/material.service');
const upload = require('../middleware/upload.middleware');
const { sendSuccess, sendCreated } = require('../utils/apiResponse');

// ===== طبقة الكنترولر للمواد التعليمية =====
// 3 خطوات بس: نقرا من الطلب → ننادي الـservice → نبعت الرد.
// مفيش منطق ولا داتابيز ولا try/catch هنا.

async function list(req, res) {
  const { materials, meta } = await materialService.list(req.query);
  return sendSuccess(res, { materials }, '', meta);
}

async function listMine(req, res) {
  const materials = await materialService.listMine(req.user.id);
  return sendSuccess(res, { materials });
}

async function listAll(req, res) {
  const { materials, meta } = await materialService.listAll(req.query);
  return sendSuccess(res, { materials }, '', meta);
}

async function listPending(req, res) {
  const materials = await materialService.listPending();
  return sendSuccess(res, { materials });
}

async function getById(req, res) {
  const material = await materialService.getById(req.params.id);
  return sendSuccess(res, { material });
}

async function create(req, res) {
  // قراءة من الطلب: نحوّل الملف المرفوع لرابط.
  // getFileUrl بيشتغل مع Cloudinary والتخزين المحلي، والـservice مايهمّوش الفرق.
  const uploadedFileUrl = upload.getFileUrl(req.file);

  const { material, message } = await materialService.create(req.user, req.body, uploadedFileUrl);
  return sendCreated(res, { material }, message);
}

async function approve(req, res) {
  const material = await materialService.approve(req.params.id);
  return sendSuccess(res, { material }, 'تمت الموافقة على المادة');
}

async function remove(req, res) {
  await materialService.remove(req.params.id, req.user);
  return sendSuccess(res, null, 'تم حذف المادة');
}

module.exports = { list, listAll, listMine, listPending, getById, create, approve, remove };
