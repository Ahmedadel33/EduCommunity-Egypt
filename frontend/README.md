# EduCommunity Egypt — تطبيق الطالب والمدرس (Frontend)

واجهة منصّة **EduCommunity Egypt** للطلاب والمدرسين.
مبنية بـ **React 18 + Vite + JSX** (مش TypeScript) + **react-router** + **@tanstack/react-query** + **Tailwind CSS**، وواجهة **عربية RTL** ملتزمة بنظام تصميم الفيجما.

> 🔐 **لوحة الأدمن منفصلة** في تطبيق تاني: `../educommunity-admin` (بورت 5200).

---

## 🎨 نظام التصميم (من فيجما Stitch)

| العنصر | القيمة |
|---|---|
| اللون الأساسي | `#2563EB` (أزرق) |
| اللون الثانوي | `#14B8A6` (تيل — التفاعل بين الطلاب) |
| لون التميّز | `#F59E0B` (أمبر — النقاط والشارات فقط) |
| خلفية الصفحة | `#F5F7FF` (لافندر فاتح) |
| الكروت | أبيض · حواف `16px` · بوردر `1px #E2E8F0` |
| الأزرار والمدخلات | حواف `12px` |
| التوب-بار | Glassmorphic (شفافية 70% + blur) |
| الخط | Inter |

المرجع الكامل: `stitch_educommunity_egypt_platform_ui_ux/educommunity_egypt/DESIGN.md`

---

## 📂 هيكل المشروع

```
educommunity-frontend/
├── index.html
├── vite.config.js
├── tailwind.config.js
└── src/
    ├── main.jsx              # نقطة البداية
    ├── App.jsx               # كل المسارات (routes)
    ├── lib/
    │   ├── api.js            # كل نداءات الباك اند في مكان واحد
    │   └── grades.js         # أسماء الصفوف
    ├── context/AuthContext.jsx   # المستخدم + التوكن
    ├── components/
    │   ├── AppLayout.jsx     # القائمة الجانبية (حسب الدور) + التوب-بار
    │   ├── ProtectedRoute.jsx # حماية المسارات بالدور
    │   └── RoleHome.jsx      # توجيه تلقائي حسب الدور
    ├── features/             # كل ميزة في مجلد
    │   ├── dashboard/        # StudentDashboard · TeacherDashboard
    │   ├── materials/        # المواد التعليمية + رفعها
    │   ├── lessons/          # الدروس أونلاين
    │   ├── chat/             # شات الصف (polling كل ثانيتين)
    │   ├── softskills/       # التاسكات والتسليمات
    │   ├── rewards/          # المكافآت
    │   └── shifts/           # 🆕 ودجت المدرس المناوب الآن
    └── pages/                # Landing · Auth · Feed · Challenges · Leaderboard ...
```

---

## ▶️ التشغيل

```bash
npm install
npm run dev      # http://localhost:5199
```

> **مهم:** لازم الباك اند شغّال الأول على **http://localhost:5000**
> (`cd ../educommunity-backend && npm run seed && npm run dev`)

### 👤 حسابات تجريبية (كلمة المرور: `password123`)
| الدور | البريد | يوصل لـ |
|---|---|---|
| طالب | `omar@edu.eg` | `/student` |
| مدرس | `ahmed.ali@edu.eg` | `/teacher` |

> الأدمن (`admin@edu.eg`) بيدخل من **تطبيق الأدمن المنفصل** على بورت 5200.

---

## 🗺️ المسارات (Routes)

| المسار | الصفحة | الصلاحية |
|---|---|---|
| `/` | الصفحة التعريفية (Landing) | الجميع |
| `/auth` | تسجيل دخول / حساب جديد | الجميع |
| `/dashboard` | توجيه تلقائي حسب الدور | 🔒 |
| `/student` | داشبورد الطالب | 🔒 طالب |
| `/teacher` | داشبورد المدرس | 🔒 مدرس |
| `/materials` | المواد التعليمية (تصفّح + رفع) | 🔒 |
| `/lessons` | الدروس أونلاين (Jitsi) | 🔒 |
| `/chat` | شات الصف | 🔒 |
| `/soft-skills` | تاسكات المهارات | 🔒 |
| `/rewards` | المكافآت | 🔒 |
| `/feed` · `/challenges` · `/leaderboard` · `/teachers` | المجتمع والتحديات والمتصدّرون والمدرسون | الجميع |
| `/profile` · `/settings` · `/help` | الملف الشخصي والإعدادات والمساعدة | 🔒 |

---

## 🔌 الربط بالباك اند

كل النداءات في **[src/lib/api.js](src/lib/api.js)** — ملف واحد فيه دالة `request()` بتضيف التوكن تلقائياً من `localStorage` وبترمي رسالة الخطأ العربية لو السيرفر رجّع خطأ.

```js
// مثال
import { api } from "@/lib/api";
const { materials } = await api.getMaterials({ grade: "sec-1" });
```

القراءة بـ `useQuery` والكتابة بـ `useMutation` (react-query). الشات بيستخدم `refetchInterval: 2000` بدل Socket.IO (أبسط).

---

## 🆕 المزايا الجديدة في هذا التطبيق

- **ودجت «المدرس المناوب الآن»** (`features/shifts/OnDutyWidget.jsx`) في داشبورد الطالب — بيقرأ `GET /shifts/now` ويعمل refetch كل دقيقة، فالطالب يعرف مين متاح يسأله دلوقتي وزرار «اسأل» يوديه للشات.
- **رفع المدرس للمواد بيروح «بانتظار موافقة الأدمن»** — المدرس بيشوف حالة موادّه، والطالب مايشوفش المادة غير بعد ما الأدمن يوافق من تطبيق الأدمن.

---

## 🧪 ملاحظات
- المشروع **JSX** مش TypeScript (كل الملفات `.jsx`).
- الصفحات المتنسّقة على الفيجما مبنية بـ **Tailwind خام + lucide-react** (بدون shadcn/recharts) — الرسوم عبارة عن `div`/SVG بسيطة.
- بعض الصفحات (Feed · Challenges · TeacherRating · Landing · Profile) لسه بتستخدم **shadcn/ui** ومحتاجة تنسيق على الفيجما.
