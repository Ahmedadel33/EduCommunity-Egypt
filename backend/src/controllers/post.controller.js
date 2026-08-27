const postService = require('../services/post.service');
const upload = require('../middleware/upload.middleware');
const { sendSuccess, sendCreated } = require('../utils/apiResponse');

// ===== طبقة الكنترولر للمنشورات =====
// 3 خطوات بس: نقرا من الطلب → ننادي الـservice → نبعت الرد.
// مفيش منطق ولا داتابيز ولا try/catch هنا.

async function list(req, res) {
  const posts = await postService.list();
  return sendSuccess(res, { posts });
}

async function create(req, res) {
  // نحوّل الملف المرفوع لرابط — getFileUrl بيشتغل مع Cloudinary والتخزين المحلي
  const fileUrl = upload.getFileUrl(req.file);

  const post = await postService.create(req.user, req.body, fileUrl);
  return sendCreated(res, { post }, 'تم نشر المنشور');
}

async function toggleLike(req, res) {
  const result = await postService.toggleLike(req.params.id, req.user.id);
  return sendSuccess(res, result);
}

async function listComments(req, res) {
  const comments = await postService.listComments(req.params.id);
  return sendSuccess(res, { comments });
}

async function addComment(req, res) {
  const comment = await postService.addComment(req.params.id, req.user, req.body);
  return sendCreated(res, { comment }, 'تم إضافة التعليق');
}

module.exports = { list, create, toggleLike, listComments, addComment };
