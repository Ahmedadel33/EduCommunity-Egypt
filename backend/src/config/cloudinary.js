const { v2: cloudinary } = require('cloudinary');

// إعداد Cloudinary — خدمة تخزين ملفات على السحابة.
// ليه Cloudinary مش تخزين محلي؟
//   - الملفات المحلية بتضيع لما ننشر على Render/Railway (الملفات بتتمسح مع كل نشر)
//   - Cloudinary بيديك رابط ثابت + CDN سريع + ضغط تلقائي للصور
//
// المفاتيح بتتحطّ في ملف .env (متتحطّش في الكود أبداً):
//   CLOUDINARY_CLOUD_NAME · CLOUDINARY_API_KEY · CLOUDINARY_API_SECRET

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// بنتأكد إن المفاتيح متظبّطة.
// لو مش متظبّطة، بنرجع للتخزين المحلي عشان المشروع يفضل شغّال في التطوير
// (مفيد وقت الديمو لو لسه معملتش حساب على Cloudinary).
const isCloudinaryReady = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

module.exports = { cloudinary, isCloudinaryReady };
