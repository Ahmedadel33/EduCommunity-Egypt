import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  GraduationCap,
  ArrowLeft,
  BookOpen,
  Trophy,
  Users,
  Star,
  BarChart3,
  MessageSquare,
  ChevronLeft,
  Sparkles,
  Target,
  Award,
  Zap,
  User,
  Video,
  X,
} from "lucide-react";
import AuthForm from "../features/auth/AuthForm";
import { api } from "../lib/api";
import { useI18n } from "../lib/i18n";
import LanguageSwitcher from "../components/LanguageSwitcher";

// مميزات سريعة تظهر تحت الهيرو
const features = [
  { icon: BookOpen, title: "شارك المعرفة", desc: "انشر الملخصات والملفات والموارد" },
  { icon: Trophy, title: "اكسب الشارات", desc: "أكمل التحديات وتصدّر الترتيب" },
  { icon: Users, title: "مجتمع تعليمي", desc: "انضم لمجتمع صفك الدراسي" },
  { icon: Star, title: "قيّم المعلمين", desc: "شارك رأيك لتحسين التعليم" },
];

// أقسام المنصة — كل قسم بيروح لصفحة حقيقية موجودة في التطبيق
const sections = [
  {
    icon: MessageSquare,
    title: "المجتمع التعليمي",
    desc: "انشر وشارك المحتوى التعليمي مع طلاب صفك وجميع أنحاء مصر.",
    path: "/feed",
    iconClass: "bg-blue-100 text-blue-600",
  },
  {
    icon: Trophy,
    title: "التحديات الأسبوعية",
    desc: "تنافس مع زملائك في تحديات علمية واجتماعية متجددة.",
    path: "/challenges",
    iconClass: "bg-amber-100 text-amber-500",
  },
  {
    icon: BarChart3,
    title: "المتصدرون",
    desc: "شاهد الترتيب العام للطلاب والمدارس الأكثر نشاطاً.",
    path: "/leaderboard",
    iconClass: "bg-teal-100 text-teal-600",
  },
  {
    icon: Star,
    title: "تقييم المعلمين",
    desc: "قيّم معلميك وشارك التجارب لبناء بيئة تعليمية أفضل.",
    path: "/teachers",
    iconClass: "bg-blue-100 text-blue-600",
  },
  {
    icon: BookOpen,
    title: "المواد الدراسية",
    desc: "تصفح مواد صفك وملخصاتها وتابع تقدمك في كل مادة.",
    path: "/materials",
    iconClass: "bg-teal-100 text-teal-600",
  },
  {
    icon: Video,
    title: "الدروس أونلاين",
    desc: "احضر الدروس المباشرة مع معلميك في مواعيدها.",
    path: "/lessons",
    iconClass: "bg-blue-100 text-blue-600",
  },
];

// خطوات الاستخدام
const steps = [
  { icon: User, step: "٠١", title: "أنشئ حسابك", desc: "سجّل كطالب أو معلم أو مدير مدرسة باستخدام كود المدرسة." },
  { icon: Zap, step: "٠٢", title: "انضم لمجتمعك", desc: "اختر صفك الدراسي وتفاعل مع زملائك في نفس المرحلة." },
  { icon: Award, step: "٠٣", title: "اكسب وابدع", desc: "شارك محتواك، أكمل التحديات، وارتقِ في لوحة المتصدرين." },
];

// الصفحة الرئيسية العامة (قبل تسجيل الدخول)
function Landing() {
  const navigate = useNavigate();
  const { language, t } = useI18n();
  const formatNumber = (value) => new Intl.NumberFormat(language === "ar" ? "ar-EG" : "en-US").format(value);
  const [showAuth, setShowAuth] = useState(false); // بنظهر فورم الدخول لما المستخدم يضغط
  const [platformStats, setPlatformStats] = useState(null);
  const [statsError, setStatsError] = useState(false);

  useEffect(() => {
    let active = true;

    api.getPlatformStats()
      .then((data) => {
        if (active) setPlatformStats(data.stats);
      })
      .catch(() => {
        if (active) setStatsError(true);
      });

    return () => {
      active = false;
    };
  }, []);

  // كلاس الكارت المتكرر
  const card = "bg-white rounded-2xl border border-slate-100 shadow-sm";

  return (
    <div dir={language === "ar" ? "rtl" : "ltr"} className="min-h-screen flex flex-col bg-[#F5F7FF]">
      {/* الشريط العلوي */}
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-slate-800">{t("مجتمع مصر التعليمي")}</span>
          </div>

          {/* روابط الأقسام */}
          <div className="hidden md:flex items-center gap-6 text-sm font-bold text-slate-500">
            <button onClick={() => navigate("/feed")} className="hover:text-blue-600">{t("المجتمع")}</button>
            <button onClick={() => navigate("/materials")} className="hover:text-blue-600">{t("المواد")}</button>
            <button onClick={() => navigate("/challenges")} className="hover:text-blue-600">{t("التحديات")}</button>
            <button onClick={() => navigate("/teachers")} className="hover:text-blue-600">{t("المعلمون")}</button>
          </div>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <button
              onClick={() => setShowAuth(true)}
              className="hidden sm:block text-sm font-bold text-blue-600 px-3 py-2"
            >
              {t("تسجيل الدخول")}
            </button>
            <button
              onClick={() => setShowAuth(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-4 py-2 rounded-xl"
            >
              {t("انضم مجاناً")}
            </button>
          </div>
        </div>
      </nav>

      {/* الهيرو */}
      <div className="max-w-6xl mx-auto px-4 py-12 lg:py-20 w-full">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            {/* بادج صغير فوق العنوان */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-xs font-bold text-blue-600 mb-5">
              <Sparkles className="w-3.5 h-3.5" />
              {t("المنصة التعليمية الوطنية الأولى في مصر")}
            </div>

            <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-800 leading-tight mb-4">
              {t("مستقبل")} <span className="text-blue-600">{t("التعلّم التعاوني")}</span> {t("في مصر")} 🇪🇬
            </h1>

            <p className="text-slate-400 text-base leading-relaxed mb-8 max-w-md">
              {t("تواصل مع طلاب من جميع أنحاء مصر. شارك المعرفة، تنافس في التحديات، وابنِ ملفك الأكاديمي.")}
            </p>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowAuth(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-3 rounded-xl flex items-center gap-2"
              >
                {t("ابدأ رحلتك")} <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate("/feed")}
                className="bg-white border border-slate-200 text-blue-600 font-bold text-sm px-6 py-3 rounded-xl flex items-center gap-2 hover:border-blue-300"
              >
                {t("تصفح المجتمع")} <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            {/* مميزات سريعة */}
            <div className="grid grid-cols-2 gap-3 mt-10">
              {features.map((f) => (
                <div key={f.title} className={`${card} flex items-start gap-3 p-3`}>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <f.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{t(f.title)}</p>
                    <p className="text-[11px] text-slate-400">{t(f.desc)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* لوحة جانبية توضيحية */}
          <div className="hidden lg:block">
            <div className="relative">
              <div className={`${card} p-8 flex flex-col items-center text-center`}>
                <div className="w-20 h-20 rounded-2xl bg-blue-600 flex items-center justify-center mb-5">
                  <GraduationCap className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-extrabold text-slate-800 mb-2">{t("انضم الآن مجاناً")}</h3>
                <p className="text-sm text-slate-400 mb-6">
                  {t("فتح حساب يستغرق أقل من دقيقة واحدة.")}
                  {platformStats
                    ? language === "en"
                      ? ` ${formatNumber(platformStats.registeredUsers)} users have joined.`
                      : ` انضم إلى ${formatNumber(platformStats.registeredUsers)} مستخدم مسجل.`
                    : ` ${t("انضم إلى مجتمع الطلاب والمعلمين.")}`}
                </p>
                <div className="flex">
                  {(language === "ar" ? ["أ", "م", "ع", "ف"] : ["E", "C", "S", "A"]).map((l, i) => (
                    <div
                      key={l}
                      className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold border-2 border-white"
                      style={{ marginRight: i > 0 ? "-0.75rem" : 0 }}
                    >
                      {l}
                    </div>
                  ))}
                </div>
              </div>

              {/* كارت عائم صغير للشارات */}
              <div className={`${card} absolute -top-4 -left-4 p-3 flex items-center gap-2`}>
                <div className="w-9 h-9 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center">
                  <Trophy className="w-4 h-4" />
                </div>
                <div className="text-right">
                    <p className="text-xs font-bold text-slate-800">{t("المستوى ١٢")}</p>
                    <p className="text-[10px] text-amber-500 font-bold">{t("٤٥٠ نقطة اليوم")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* شريط الأرقام */}
      <div className="bg-white border-y border-slate-100 py-8">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          {[
            {
              icon: Users,
              label: t("مستخدم مسجل"),
              value: platformStats ? formatNumber(platformStats.registeredUsers) : "—",
            },
            {
              icon: Award,
              label: t("شارة ممنوحة"),
              value: platformStats ? formatNumber(platformStats.badges) : "—",
            },
            {
              icon: Target,
              label: t("تحدٍ نشط"),
              value: platformStats ? formatNumber(platformStats.activeChallenges) : "—",
            },
            {
              icon: Sparkles,
              label: t("رضا المستخدمين"),
              value: platformStats?.satisfactionPercent == null
                ? "—"
                : language === "en"
                  ? `${formatNumber(platformStats.satisfactionPercent)}%`
                  : `${formatNumber(platformStats.satisfactionPercent)}٪`,
              hint: platformStats?.ratingsCount
                ? language === "en"
                  ? `Average ${platformStats.averageRating.toFixed(1)} / 5 (${formatNumber(platformStats.ratingsCount)} ratings)`
                  : `متوسط ${formatNumber(platformStats.averageRating.toFixed(1))} من ٥ (${formatNumber(platformStats.ratingsCount)} تقييم)`
                : t("حسب تقييمات المعلمين"),
            },
          ].map((stat) => (
            <div key={stat.label}>
              <stat.icon className="w-6 h-6 mx-auto mb-2 text-blue-600" />
              <p className="text-2xl font-extrabold text-slate-800 tabular-nums">{stat.value}</p>
              <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
              {stat.hint && <p className="text-[10px] text-slate-400 mt-1">{stat.hint}</p>}
            </div>
          ))}
        </div>
        {statsError && <p className="text-center text-xs text-amber-700 mt-4">{t("تعذر تحميل الإحصائيات الحالية.")}</p>}
      </div>

      {/* أقسام المنصة */}
      <div className="max-w-6xl mx-auto px-4 py-16 w-full">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-slate-800 mb-2">{t("كل ما تحتاجه للتفوق")}</h2>
          <p className="text-sm text-slate-400 max-w-lg mx-auto">
            {t("كل قسم مصمم لخدمة جانب من جوانب حياتك الأكاديمية والتفاعلية مع زملائك.")}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sections.map((s) => (
            <button
              key={s.path}
              onClick={() => navigate(s.path)}
              className={`${card} p-6 text-right hover:border-blue-200 hover:shadow-md transition-all`}
            >
              <div className={`w-12 h-12 rounded-xl ${s.iconClass} flex items-center justify-center mb-4`}>
                <s.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-800 mb-1.5">{t(s.title)}</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">{t(s.desc)}</p>
              <span className="flex items-center gap-1.5 text-sm font-bold text-blue-600">
                {t("استكشف القسم")} <ChevronLeft className="w-4 h-4" />
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* كيف تعمل المنصة */}
      <div className="bg-white border-y border-slate-100 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-slate-800 mb-2">{t("كيف تعمل المنصة؟")}</h2>
            <p className="text-sm text-slate-400 max-w-lg mx-auto">
              {t("ثلاث خطوات بسيطة تفصلك عن الانضمام لمجتمعنا التعليمي.")}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((item) => (
              <div key={item.title} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-7 h-7 text-white" />
                </div>
                <span className="block text-3xl font-extrabold text-blue-100 mb-1">{item.step}</span>
                <h3 className="text-lg font-extrabold text-slate-800 mb-1.5">{t(item.title)}</h3>
                <p className="text-sm text-slate-400 max-w-xs mx-auto">{t(item.desc)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* دعوة أخيرة للتسجيل */}
      <div className="max-w-6xl mx-auto px-4 py-16 w-full">
        <div className="rounded-2xl bg-blue-600 p-8 lg:p-12 text-center text-white relative overflow-hidden">
          <Sparkles className="absolute left-8 top-8 w-24 h-24 text-white/10" />
          <h2 className="text-3xl font-extrabold mb-3">{t("جاهز للانضمام لمجتمعنا؟")}</h2>
          <p className="text-sm text-blue-100 max-w-lg mx-auto mb-7">
            {platformStats
              ? language === "en"
                ? `Join ${formatNumber(platformStats.registeredUsers)} registered users. Share knowledge, take on challenges, and build your future.`
                : `انضم إلى ${formatNumber(platformStats.registeredUsers)} مستخدم مسجل. شارك المعرفة، تنافس، وابنِ مستقبلك.`
              : language === "en"
                ? "Join a community of students and teachers. Share knowledge, take on challenges, and build your future."
                : "انضم إلى مجتمع الطلاب والمعلمين. شارك المعرفة، تنافس، وابنِ مستقبلك."}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setShowAuth(true)}
              className="bg-white text-blue-700 font-bold text-sm px-6 py-3 rounded-xl flex items-center gap-2"
            >
              {t("سجّل الآن مجاناً")} <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate("/feed")}
              className="border border-white/40 text-white font-bold text-sm px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-white/10"
            >
              {t("تصفح بدون تسجيل")} <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* الفوتر */}
      <footer className="bg-white border-t border-slate-100 py-10 mt-auto">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 text-white" />
                </div>
                <span className="font-extrabold text-slate-800">{t("مجتمع مصر التعليمي")}</span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                {t("المنصة التعليمية الوطنية التي تربط طلاب مصر ببعضهم البعض وبالمعلمين.")}
              </p>
            </div>

            <div>
              <h4 className="font-extrabold text-slate-800 mb-3 text-sm">{t("الأقسام")}</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><button onClick={() => navigate("/feed")} className="hover:text-blue-600">{t("المجتمع")}</button></li>
                <li><button onClick={() => navigate("/challenges")} className="hover:text-blue-600">{t("التحديات")}</button></li>
                <li><button onClick={() => navigate("/leaderboard")} className="hover:text-blue-600">{t("المتصدرون")}</button></li>
                <li><button onClick={() => navigate("/teachers")} className="hover:text-blue-600">{t("تقييم المعلمين")}</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-extrabold text-slate-800 mb-3 text-sm">{t("الحساب")}</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><button onClick={() => setShowAuth(true)} className="hover:text-blue-600">{t("تسجيل الدخول")}</button></li>
                <li><button onClick={() => navigate("/profile")} className="hover:text-blue-600">{t("الملف الشخصي")}</button></li>
                <li><button onClick={() => navigate("/materials")} className="hover:text-blue-600">{t("المواد الدراسية")}</button></li>
                <li><button onClick={() => navigate("/lessons")} className="hover:text-blue-600">{t("الدروس أونلاين")}</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-extrabold text-slate-800 mb-3 text-sm">{t("تواصل معنا")}</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>support@educommunity.eg</li>
                <li>{t("القاهرة، جمهورية مصر العربية")}</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6 text-center text-xs text-slate-400">
            © ٢٠٢٦ {t("مجتمع مصر التعليمي")} — {t("مبادرة وزارة التربية والتعليم")}
          </div>
        </div>
      </footer>

      {/* نافذة تسجيل الدخول / إنشاء الحساب */}
      {showAuth && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setShowAuth(false)}
        >
          <div className="relative w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowAuth(false)}
              className="absolute -top-3 -left-3 z-10 w-8 h-8 rounded-full bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-400 hover:text-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
            <AuthForm />
          </div>
        </div>
      )}
    </div>
  );
}

export default Landing;
