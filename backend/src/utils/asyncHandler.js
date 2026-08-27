// كل الكنترولرز بتاعتنا async، ولو حصل خطأ جوّاها Express مش بيمسكه لوحده.
// بدل ما نكتب try/catch في كل كنترولر، بنلفّها بالدالة دي
// وهي بتمسك أي خطأ وتوديه للـ error middleware عن طريق next(err).
//
// الاستخدام:  router.get('/', asyncHandler(controller.list))
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
