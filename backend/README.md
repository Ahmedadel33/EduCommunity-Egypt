# EduCommunity Egypt — Backend API

باك اند منصّة **EduCommunity Egypt** التعليمية للطلاب المصريين.
مبني بـ **Node.js + Express + MongoDB (Mongoose)** بأسلوب بسيط (المنطق جوّا الراوتس مباشرة — بدون services/v1/Zod)، توكن JWT واحد، ورفع ملفات محلي بـ multer.

---

## 🧱 الستاك

| الطبقة | التقنية |
|---|---|
| السيرفر | Node.js + Express |
| قاعدة البيانات | MongoDB + Mongoose |
| المصادقة | JWT (توكن واحد صالح 7 أيام) + bcryptjs |
| رفع الملفات | multer (تخزين محلي في `uploads/`) |
| الشات | REST + polling كل ثانيتين (مش Socket.IO) |
| الدروس أونلاين | روابط Jitsi تلقائية (مجانية بدون تسجيل) |

---

## 📂 هيكل المشروع

```
educommunity-backend/
├── .env.example            # نموذج المتغيّرات البيئية
├── package.json            # الأوامر والحزم
└── src/
    ├── server.js           # نقطة البداية + تركيب كل المسارات
    ├── config/
    │   ├── db.js           # الاتصال بـ MongoDB
    │   └── seed.js         # زرع بيانات تجريبية
    ├── middleware/
    │   ├── auth.middleware.js    # authenticate + authorize(roles)
    │   └── upload.middleware.js  # multer لرفع الملفات
    ├── models/             # 15 موديل (User, Material, Shift, Attendance ...)
    └── routes/             # 14 ملف مسارات (auth, materials, shifts ...)
```

---

## ▶️ التشغيل

```bash
# 1) تثبيت الحزم
npm install

# 2) إعداد المتغيّرات البيئية
cp .env.example .env        # ثم عدّل القيم لو حبيت

# 3) زرع البيانات التجريبية (يمسح القديم ويحطّ بيانات جاهزة)
npm run seed

# 4) تشغيل السيرفر
npm run dev                 # مع إعادة التحميل التلقائي (nodemon)
# أو
npm start                   # تشغيل عادي
```

السيرفر يشتغل على: **http://localhost:5000**

> **شرط:** لازم يكون **MongoDB** شغّال محلياً على `mongodb://127.0.0.1:27017`.

### 👤 حسابات تجريبية (كلمة المرور للجميع: `password123`)
| الدور | البريد |
|---|---|
| أدمن | `admin@edu.eg` |
| مدرس | `ahmed.ali@edu.eg` · `sara.mahmoud@edu.eg` · `mohamed.hasan@edu.eg` |
| طالب | `omar@edu.eg` · `fatma@edu.eg` · `ali@edu.eg` · `nour@edu.eg` |

---

## 🔌 مسارات الـ API

كل المسارات تحت البادئة `/api`. الرمز 🔒 = يتطلب توكن، (أدمن)/(مدرس)/(طالب) = الدور المسموح.

### المرحلة 1 — المصادقة والأدوار
| Method | Endpoint | الوصف |
|---|---|---|
| POST | `/auth/register` | تسجيل حساب جديد (طالب/مدرس/أدمن) |
| POST | `/auth/login` | تسجيل الدخول (يسجّل حضور المدرس تلقائياً) |
| GET | `/auth/me` 🔒 | بيانات المستخدم الحالي |
| PATCH | `/auth/me` 🔒 | تعديل الاسم و/أو كلمة المرور (يرجّع توكن جديد) |

### المرحلة 2 — المواد الدراسية والتعليمية والدروس
| Method | Endpoint | الوصف |
|---|---|---|
| GET | `/subjects` | المواد الدراسية (فلترة `?grade=`) |
| POST | `/subjects` 🔒 (مدرس/أدمن) | إضافة مادة دراسية |
| GET | `/materials` | المواد **المعتمدة** فقط (فلترة grade/subject/type/search + ترقيم + `?source=`) |
| GET | `/materials/mine` 🔒 (مدرس/أدمن) | مواد المدرس نفسه بكل الحالات |
| GET | `/materials/pending` 🔒 (أدمن) | المواد بانتظار الموافقة |
| GET | `/materials/:id` | مادة واحدة |
| POST | `/materials` 🔒 (مدرس/أدمن) | رفع مادة (أدمن=معتمدة فوراً · مدرس=pending) |
| PATCH | `/materials/:id/approve` 🔒 (أدمن) | الموافقة على مادة مدرس |
| DELETE | `/materials/:id` 🔒 | حذف/رفض مادة |
| GET | `/lessons` | الدروس أونلاين (فلترة `?grade=`) |
| POST | `/lessons` 🔒 (مدرس/أدمن) | إنشاء درس → رابط Jitsi تلقائي |
| DELETE | `/lessons/:id` 🔒 | حذف درس |

### المرحلة 3 — الشات والمدرسين
| Method | Endpoint | الوصف |
|---|---|---|
| GET | `/messages?room=sec-1` 🔒 | رسائل غرفة الصف |
| POST | `/messages` 🔒 | إرسال رسالة |
| GET | `/teachers` | المدرسون مرتّبون حسب متوسط التقييم |
| POST | `/teachers/:id/rate` 🔒 (طالب) | تقييم مدرس (1–5) |

### المرحلة 4 — السوفت سكيلز والمكافآت
| Method | Endpoint | الوصف |
|---|---|---|
| GET | `/soft-skills/tasks` | كل التاسكات |
| POST | `/soft-skills/tasks` 🔒 (مدرس/أدمن) | إنشاء تاسك |
| POST | `/soft-skills/tasks/:id/submit` 🔒 (طالب) | رفع بريزنتيشن |
| GET | `/soft-skills/submissions` 🔒 | التسليمات (طالب=بتاعته · مدرس/أدمن=الكل) |
| PATCH | `/soft-skills/submissions/:id/grade` 🔒 (مدرس/أدمن) | تصحيح ودرجة |
| GET | `/rewards` 🔒 | المكافآت (أدمن=الكل · غيره=بتاعته) |
| POST | `/rewards` 🔒 (أدمن) | منح شارة/جائزة/تكريم |

### المجتمع والتحديات والمتصدّرون
| Method | Endpoint | الوصف |
|---|---|---|
| GET / POST | `/posts` | المنشورات (POST 🔒) |
| POST | `/posts/:id/like` 🔒 | إعجاب / إلغاء |
| GET / POST | `/posts/:id/comments` | التعليقات (POST 🔒) |
| GET | `/challenges` | التحديات النشطة |
| GET | `/challenges/submissions` 🔒 | تسليماتي |
| POST | `/challenges/:id/submit` 🔒 | تسليم تحدي (+نقاط) |
| GET | `/leaderboard` | المتصدّرون (`?grade=`) |
| GET | `/leaderboard/schools` | أفضل المدارس |

### الأدمن
| Method | Endpoint | الوصف |
|---|---|---|
| GET | `/admin/stats` 🔒 (أدمن) | إحصائيات المنصّة |
| GET | `/admin/users` 🔒 (أدمن) | كل المستخدمين |
| DELETE | `/admin/users/:id` 🔒 (أدمن) | حذف مستخدم |

### 🆕 المزايا الجديدة — الشيفتات وحضور المدرسين
| Method | Endpoint | الوصف |
|---|---|---|
| GET | `/shifts` | كل الشيفتات (`?subject=`) |
| GET | `/shifts/now` | المدرس المناوب **الآن** (`?subject=`) |
| POST | `/shifts` 🔒 (مدرس/أدمن) | إنشاء شيفت (الأدمن يعيّن مدرس) |
| DELETE | `/shifts/:id` 🔒 (مدرس/أدمن) | حذف شيفت |
| POST | `/attendance/checkout` 🔒 (مدرس) | تسجيل خروج + حساب المدة |
| GET | `/attendance/me` 🔒 (مدرس) | جلساتي + إجمالي وقتي |
| GET | `/attendance` 🔒 (أدمن) | كل الجلسات + إجمالي وقت كل مدرس (للتقييم) |
| GET | `/api/health` | فحص أن السيرفر شغّال |

---

## 🆕 المزايا الجديدة بالتفصيل

1. **نظام صلاحيات المواد:** الأدمن يرفع مواد **الوزارة** (`source=ministry`) وتظهر للطلاب فوراً. المدرس يرفع شرح/فيديو ويروح `status=pending` لحد ما الأدمن يوافق (`PATCH /materials/:id/approve`). الطلاب يشوفوا المعتمد فقط.
2. **شيفتات المناوبة:** لكل مادة مدرس مناوب في وقت محدّد، والطالب يعرف مين متاح دلوقتي من `GET /shifts/now`.
3. **حضور المدرسين وحساب الوقت:** أول ما المدرس يعمل login بيتفتح له سجل حضور تلقائياً؛ الأدمن يشوف إجمالي ساعات كل مدرس — وده أساس تقييمه.
4. **لوحة أدمن منفصلة:** تطبيق فرونت مستقل (`../educommunity-admin`, بورت 5200) يستهلك نفس هذا الباك اند، للموافقة على المواد وإدارة الشيفتات ومتابعة الحضور.

---

## 🧪 ملاحظات
- كل رفع ملف بيتخزّن في `uploads/` ويتقدّم على `/uploads/<filename>`.
- الأخطاء بترجع JSON بالشكل `{ "error": "..." }` مع كود HTTP مناسب (400/401/403/404/500).
- تطبيق الطالب/المدرس (فرونت) بيشتغل على بورت **5199** ويكلّم هذا الباك اند على **5000**.
