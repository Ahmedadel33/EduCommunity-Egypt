const Post = require('../models/Post');
const Comment = require('../models/Comment');
const ApiError = require('../utils/ApiError');

// ===== طبقة الخدمات (Service) للمنشورات (الـFeed) =====
// هنا كل منطق الشغل والتعامل مع الداتابيز.
// الكنترولر مابيعرفش حاجة عن Mongoose — بينادي الدوال دي بس.

// ===== عرض المنشورات =====
// الأحدث الأول، وأقصى 50 منشور، وكل منشور بيجيب معاه عدد اللايكات والتعليقات.
async function list() {
  const posts = await Post.find()
    .populate('userId', 'name role') // نجيب اسم وصاحب المنشور بدل الـid بس
    .sort({ createdAt: -1 })         // الأحدث الأول
    .limit(50);

  // لكل منشور بنعدّ تعليقاته لحظيًا عشان الرقم يبقى دايمًا صح
  const formattedPosts = await Promise.all(posts.map(async (p) => {
    const commentsCount = await Comment.countDocuments({ postId: p._id });
    return {
      id: p._id,
      user_id: p.userId ? p.userId._id : null,
      author_name: p.userId ? p.userId.name : 'مستخدم مجهول',
      author_role: p.userId ? p.userId.role : 'student',
      content: p.content,
      subject: p.subject,
      file_url: p.fileUrl,
      likes: p.likes.length,   // عدد اللايكات
      liked_by: p.likes,       // مين عمل لايك — الفرونت بيعرف منها لو المستخدم لايك ولا لأ
      comments: commentsCount, // عدد التعليقات
      created_at: p.createdAt,
    };
  }));

  return formattedPosts;
}

// ===== إنشاء منشور =====
// fileUrl بييجي جاهز من الكنترولر (رابط الملف المرفوع، أو null لو مفيش ملف)
async function create(user, data, fileUrl) {
  const { content, subject } = data;

  const postDoc = await Post.create({
    userId: user.id,
    content,
    subject: subject || null,
    fileUrl,
  });

  const populated = await postDoc.populate('userId', 'name role');

  // منشور جديد يبقى من غير لايكات ولا تعليقات
  return {
    id: populated._id,
    user_id: populated.userId ? populated.userId._id : null,
    author_name: populated.userId ? populated.userId.name : user.name,
    author_role: populated.userId ? populated.userId.role : user.role,
    content: populated.content,
    subject: populated.subject,
    file_url: populated.fileUrl,
    likes: 0,
    liked_by: [],
    comments: 0,
    created_at: populated.createdAt,
  };
}

// ===== لايك / إلغاء لايك (Toggle) =====
// لو المستخدم عامل لايك قبل كده نشيله، لو لأ نضيفه — نفس الزرار بيعمل الاتنين.
async function toggleLike(postId, userId) {
  const post = await Post.findById(postId);
  if (!post) throw new ApiError(404, 'المنشور غير موجود');

  const index = post.likes.indexOf(userId);
  if (index > -1) {
    post.likes.splice(index, 1); // كان عامل لايك → نشيله
  } else {
    post.likes.push(userId);     // مكانش → نضيف لايك
  }
  await post.save();

  // liked = true لو الحركة دي كانت "إضافة لايك"
  return { ok: true, likes: post.likes.length, liked: index === -1 };
}

// ===== تعليقات منشور =====
// الأقدم الأول عشان المحادثة تتقري بالترتيب الطبيعي.
async function listComments(postId) {
  const comments = await Comment.find({ postId })
    .populate('userId', 'name role')
    .sort({ createdAt: 1 });

  return comments.map(c => ({
    id: c._id,
    post_id: c.postId,
    user_id: c.userId ? c.userId._id : null,
    author_name: c.userId ? c.userId.name : 'مستخدم مجهول',
    author_role: c.userId ? c.userId.role : 'student',
    content: c.content,
    created_at: c.createdAt,
  }));
}

// ===== إضافة تعليق =====
async function addComment(postId, user, data) {
  const commentDoc = await Comment.create({
    postId,
    userId: user.id,
    content: data.content,
  });

  return {
    id: commentDoc._id,
    post_id: commentDoc.postId,
    user_id: commentDoc.userId,
    author_name: user.name,
    content: commentDoc.content,
    created_at: commentDoc.createdAt,
  };
}

module.exports = { list, create, toggleLike, listComments, addComment };
