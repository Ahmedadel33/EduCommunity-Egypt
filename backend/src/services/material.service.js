const Material = require('../models/Material');
const User = require('../models/User');
const Subject = require('../models/Subject');
const ApiError = require('../utils/ApiError');
const { getPagination, buildMeta } = require('../utils/pagination');

// ===== طبقة الخدمات (Service) للمواد التعليمية =====
// هنا كل منطق الشغل والتعامل مع الداتابيز.
// الكنترولر مابيعرفش حاجة عن Mongoose — بينادي الدوال دي بس.

// ===== عرض المواد المعتمدة (للطلاب/الجميع) =====
async function list(query, user) {
  const { grade, subject, type, search, isNextGrade, source } = query;

  const filter = { status: 'approved' }; // الطلاب يشوفوا المعتمد فقط
  if (user?.role === 'teacher') {
    const teacher = await User.findById(user.id).select('grades grade');
    const allowedGrades = teacher?.grades?.length
      ? teacher.grades
      : teacher?.grade && teacher.grade !== 'كل المراحل' ? [teacher.grade] : [];
    filter.grade = { $in: allowedGrades };
  } else if (grade) {
    filter.grade = grade;
  }
  if (subject) filter.subject = subject;
  if (type) filter.type = type;
  if (source) filter.source = source; // ministry أو teacher
  if (isNextGrade === 'true') filter.isNextGrade = true;
  // بحث بالعنوان: regex عشان يلاقي أي جزء من الكلمة، و i يعني مش فارقة كبيرة/صغيرة
  if (search) filter.title = { $regex: search, $options: 'i' };

  const { page, limit, skip } = getPagination(query);

  const materials = await Material.find(filter)
    .populate('subject', 'name grade')   // نجيب اسم المادة بدل الـid بس
    .populate('uploadedBy', 'name role') // ونجيب اسم اللي رفعها
    .sort({ createdAt: -1 })             // الأحدث الأول
    .skip(skip)
    .limit(limit);

  const total = await Material.countDocuments(filter);

  // الـmeta بيروح للفرونت عشان يرسم أزرار الصفحات
  return { materials, meta: buildMeta(total, page, limit) };
}

// ===== مواد المدرس نفسه =====
// هنا بيشوف كل مواده — المعتمدة واللي لسه pending — عشان يتابع حالتها
async function listMine(userId) {
  const materials = await Material.find({ uploadedBy: userId })
    .populate('subject', 'name grade')
    .sort({ createdAt: -1 });
  return materials;
}

// ===== كل المواد (للأدمن) — معتمدة + قيد الموافقة، مع فلترة وبحث =====
// الأدمن يقدر يشوف كل المحتوى المرفوع (قبل وبعد الموافقة)
// ويفلتر بالمادة أو المدرس أو الحالة، ويبحث بالعنوان.
async function listAll(query) {
  const { status, subject, teacher, grade, type, source, search } = query;

  const filter = {};
  if (status && status !== 'all') filter.status = status; // approved / pending
  if (subject) filter.subject = subject;                  // id المادة الدراسية
  if (teacher) filter.uploadedBy = teacher;               // id المدرس
  if (grade) filter.grade = grade;
  if (type) filter.type = type;
  if (source) filter.source = source;                     // ministry / teacher
  if (search) filter.title = { $regex: search, $options: 'i' };

  const { page, limit, skip } = getPagination(query);

  const materials = await Material.find(filter)
    .populate('subject', 'name grade')
    .populate('uploadedBy', 'name role subject') // اسم المدرس + تخصّصه
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Material.countDocuments(filter);
  return { materials, meta: buildMeta(total, page, limit) };
}

// ===== المواد قيد الموافقة (للأدمن) =====
async function listPending() {
  const materials = await Material.find({ status: 'pending' })
    .populate('subject', 'name grade')
    .populate('uploadedBy', 'name')
    .sort({ createdAt: -1 });
  return materials;
}

// ===== مادة واحدة =====
async function getById(id) {
  const material = await Material.findById(id)
    .populate('subject', 'name grade')
    .populate('uploadedBy', 'name role');
  if (!material) throw new ApiError(404, 'المادة غير موجودة');
  return material;
}

// ===== إضافة مادة =====
// الأدمن → مادة وزارة معتمدة فورًا · المدرس → مادة توضيحية قيد الموافقة
// uploadedFileUrl بييجي من الكنترولر (رابط الملف اللي اترفع، لو فيه ملف)
async function create(user, data, uploadedFileUrl) {
  const { title, description, subject, grade, type, isNextGrade, fileUrl } = data;

  // المستخدم إمّا يرفع ملف وإمّا يكتب رابط جاهز (يوتيوب مثلاً) — الملف له الأولوية
  const finalUrl = uploadedFileUrl || fileUrl;
  if (!finalUrl) throw new ApiError(400, 'ارفع ملفاً أو أدخل رابطاً');

  const isAdmin = user.role === 'admin';

  // المدرس يرفع في تخصّصه بس — نتأكد إن مادة الملف نفس مادة المدرس.
  // (الأدمن بيرفع مواد الوزارة في أي مادة، فمعفي من الشرط ده)
  if (user.role === 'teacher') {
    const teacher = await User.findById(user.id);
    const subjectDoc = await Subject.findById(subject); // subject هنا id للمادة الدراسية
    if (!subjectDoc) throw new ApiError(400, 'المادة غير موجودة');
    if (!teacher.subject || subjectDoc.name !== teacher.subject) {
      throw new ApiError(403, `يمكنك رفع مواد في تخصّصك فقط (${teacher.subject || 'غير محدّد'})`);
    }
    const allowedGrades = teacher.grades?.length
      ? teacher.grades
      : teacher.grade && teacher.grade !== 'كل المراحل' ? [teacher.grade] : [];
    if (!allowedGrades.includes(grade)) {
      throw new ApiError(403, 'يمكنك رفع مواد للصفوف المسندة إليك فقط');
    }
  }

  const material = await Material.create({
    title,
    description,
    subject,
    grade,
    type,
    fileUrl: finalUrl,
    // بييجي نص 'true' لما الطلب يبقى form-data، وboolean لما يبقى JSON
    isNextGrade: isNextGrade === 'true' || isNextGrade === true,
    uploadedBy: user.id,
    source: isAdmin ? 'ministry' : 'teacher',
    status: isAdmin ? 'approved' : 'pending', // مواد المدرس تحتاج موافقة الأدمن
  });

  // الرسالة بتختلف حسب الدور عشان المدرس يعرف إن مادته لسه مستنية موافقة
  const message = isAdmin ? 'تم رفع مادة الوزارة' : 'تم الرفع — بانتظار موافقة الأدمن';

  return { material, message };
}

// ===== الأدمن يوافق على مادة المدرس =====
async function approve(id) {
  const material = await Material.findByIdAndUpdate(
    id,
    { status: 'approved' },
    { new: true } // نرجّع النسخة بعد التعديل مش قبله
  );
  if (!material) throw new ApiError(404, 'المادة غير موجودة');
  return material;
}

// ===== حذف / رفض مادة =====
async function remove(id, user) {
  const material = await Material.findById(id);
  if (!material) throw new ApiError(404, 'المادة غير موجودة');

  // الأدمن يحذف أي حاجة، والمدرس يحذف مواده هو بس
  if (user.role !== 'admin' && String(material.uploadedBy) !== user.id) {
    throw new ApiError(403, 'لا يمكنك حذف مادة لم ترفعها');
  }

  await material.deleteOne();
}

module.exports = { list, listAll, listMine, listPending, getById, create, approve, remove };
