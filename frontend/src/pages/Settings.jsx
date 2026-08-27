import { useState } from "react";
import {
  User, Lock, Bell, Shield, Languages,
  Camera, Save, LogOut, ChevronLeft,
  Eye, EyeOff, Sun, Moon, Globe, Smartphone,
  Star, Award, CheckCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { GRADES } from "../lib/grades";

// ===== التبويبات =====
const TABS = [
  { id: "profile",       label: "الملف الشخصي",  icon: User     },
  { id: "account",       label: "الحساب",          icon: Lock     },
  { id: "notifications", label: "الإشعارات",       icon: Bell     },
  { id: "privacy",       label: "الخصوصية",        icon: Shield   },
  { id: "language",      label: "اللغة والمظهر",   icon: Languages},
];

// ===== الحسابات =====
const inputCls =
  "w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition bg-white";
const labelCls = "block text-xs font-bold text-slate-500 mb-1 text-right";

/* ─── تبويب الملف الشخصي ─── */
function ProfileTab({ user, refreshUser }) {
  const [name, setName]           = useState(user?.name || "");
  const [schoolCode, setSchoolCode] = useState(user?.schoolCode || "");
  const [grade, setGrade]         = useState(user?.grade || "");
  const [bio, setBio]             = useState(user?.bio || "");
  const [saving, setSaving]       = useState(false);

  async function handleSave(e) {
    e.preventDefault();
    if (!name.trim()) { toast.error("الاسم مطلوب"); return; }
    setSaving(true);
    try {
      const res = await api.updateMe({ name: name.trim(), bio, grade, schoolCode });
      if (res.token)        localStorage.setItem("token", res.token);
      if (res.refreshToken) localStorage.setItem("refreshToken", res.refreshToken);
      await refreshUser();
      toast.success("تم حفظ التغييرات ✅");
    } catch (err) {
      toast.error(err.message || "حدث خطأ");
    }
    setSaving(false);
  }

  const initials = (user?.name || "؟")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);

  return (
    <form onSubmit={handleSave} dir="rtl">
      {/* صورة الملف الشخصي */}
      <div className="flex flex-col items-start gap-3 mb-6">
        <h3 className="font-extrabold text-slate-800 text-base">تعديل الصورة الشخصية</h3>
        <p className="text-xs text-slate-400">توصى بصورة مربعة لا تقل عن 400×400 بكسل.</p>
        <div className="relative w-24 h-24 mt-1">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-3xl font-extrabold shadow-lg">
            {initials}
          </div>
          <button
            type="button"
            title="تغيير الصورة"
            className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md hover:bg-blue-700 transition"
          >
            <Camera className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* حقول البيانات */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className={labelCls}>الاسم الكامل</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputCls}
            placeholder="اسمك الكامل"
          />
        </div>
        <div>
          <label className={labelCls}>الصف الدراسي</label>
          <select
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            className={inputCls}
          >
            <option value="">اختر الصف...</option>
            {GRADES.map((g) => (
              <option key={g.value} value={g.value}>{g.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-4">
        <label className={labelCls}>المدرسة</label>
        <input
          value={schoolCode}
          onChange={(e) => setSchoolCode(e.target.value)}
          className={inputCls}
          placeholder="اسم أو كود مدرستك"
        />
      </div>

      <div className="mb-6">
        <label className={labelCls}>نبذة تعريفية</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          className={`${inputCls} resize-none`}
          placeholder="اكتب نبذة قصيرة عن نفسك..."
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl flex items-center gap-2 disabled:opacity-60 transition shadow-sm shadow-blue-200"
      >
        <Save className="w-4 h-4" />
        {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
      </button>
    </form>
  );
}

/* ─── تبويب الحساب ─── */
function AccountTab({ user, logout, navigate }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword]         = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew]                 = useState(false);
  const [saving, setSaving]                   = useState(false);

  async function handleChangePassword(e) {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error("كلمة المرور يجب ألا تقل عن 6 أحرف");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("كلمتا المرور غير متطابقتين");
      return;
    }
    setSaving(true);
    try {
      await api.updateMe({ password: newPassword });
      toast.success("تم تغيير كلمة المرور ✅");
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (err) {
      toast.error(err.message || "حدث خطأ");
    }
    setSaving(false);
  }

  return (
    <div dir="rtl" className="space-y-6">
      {/* معلومات الحساب */}
      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
        <h3 className="font-extrabold text-slate-800 mb-4 text-sm">معلومات الحساب</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-slate-100">
            <span className="text-slate-800 text-sm font-medium">{user?.name}</span>
            <span className="text-xs text-slate-400">الاسم</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-slate-100">
            <span className="text-slate-800 text-sm font-medium">{user?.email}</span>
            <span className="text-xs text-slate-400">البريد الإلكتروني</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              {user?.role === "teacher" ? "معلم" : user?.role === "admin" ? "مدير النظام" : "طالب"}
            </span>
            <span className="text-xs text-slate-400">الدور</span>
          </div>
        </div>
      </div>

      {/* تغيير كلمة المرور */}
      <form onSubmit={handleChangePassword}>
        <h3 className="font-extrabold text-slate-800 mb-4 text-sm">تغيير كلمة المرور</h3>
        <div className="space-y-3 mb-4">
          <div>
            <label className={labelCls}>كلمة المرور الحالية</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={inputCls}
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className={labelCls}>كلمة المرور الجديدة</label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={`${inputCls} pl-10`}
                placeholder="6 أحرف على الأقل"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className={labelCls}>تأكيد كلمة المرور</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputCls}
              placeholder="أعد كتابة كلمة المرور"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl flex items-center gap-2 disabled:opacity-60 transition"
        >
          <Lock className="w-4 h-4" />
          {saving ? "جاري الحفظ..." : "تحديث كلمة المرور"}
        </button>
      </form>

      {/* تسجيل الخروج */}
      <div className="pt-4 border-t border-slate-100">
        <h3 className="font-extrabold text-slate-800 mb-3 text-sm">منطقة الخطر</h3>
        <button
          onClick={() => { logout(); navigate("/"); }}
          className="flex items-center gap-2 text-rose-500 font-bold text-sm border border-rose-200 rounded-xl px-5 py-2.5 hover:bg-rose-50 transition"
        >
          <LogOut className="w-4 h-4" /> تسجيل الخروج
        </button>
      </div>
    </div>
  );
}

/* ─── تبويب الإشعارات ─── */
function NotificationsTab({ user, refreshUser }) {
  const DEFAULTS = {
    newMaterial: true, liveLesson: true, challenges: true,
    rewards: true, chat: false, weeklyDigest: true,
  };
  // نحمّل القيم المحفوظة من المستخدم (مع fallback للافتراضي)
  const [prefs, setPrefs] = useState({ ...DEFAULTS, ...(user?.preferences?.notifications || {}) });
  const [saving, setSaving] = useState(false);

  const toggle = (key) => setPrefs((p) => ({ ...p, [key]: !p[key] }));

  async function save() {
    setSaving(true);
    try {
      await api.updateMe({ preferences: { notifications: prefs } });
      await refreshUser();
      toast.success("تم حفظ تفضيلات الإشعارات ✅");
    } catch (err) {
      toast.error(err.message || "حدث خطأ");
    }
    setSaving(false);
  }

  const items = [
    { key: "newMaterial",  label: "مواد تعليمية جديدة",     desc: "عند رفع مواد في مادتك" },
    { key: "liveLesson",   label: "دروس مباشرة قادمة",      desc: "تذكير قبل بدء الدرس بـ 15 دقيقة" },
    { key: "challenges",   label: "تحديات جديدة",           desc: "عند فتح تحديات في صفّك" },
    { key: "rewards",      label: "المكافآت والشارات",       desc: "عند منحك جائزة أو وسام" },
    { key: "chat",         label: "رسائل الشات",            desc: "إشعارات رسائل المجموعة" },
    { key: "weeklyDigest", label: "ملخّص أسبوعي",           desc: "ملخص نشاطك كل أسبوع" },
  ];

  function Toggle({ on, onToggle }) {
    return (
      <button
        type="button"
        onClick={onToggle}
        className={`w-11 h-6 rounded-full transition-colors relative ${on ? "bg-blue-600" : "bg-slate-200"}`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all ${on ? "right-0.5" : "left-0.5"}`}
        />
      </button>
    );
  }

  return (
    <div dir="rtl">
      <h3 className="font-extrabold text-slate-800 mb-5 text-sm">تفضيلات الإشعارات</h3>
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100"
          >
            <div>
              <p className="font-bold text-slate-800 text-sm">{item.label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
            </div>
            <Toggle on={prefs[item.key]} onToggle={() => toggle(item.key)} />
          </div>
        ))}
      </div>
      <button
        onClick={save}
        disabled={saving}
        className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl flex items-center gap-2 transition disabled:opacity-60"
      >
        <Save className="w-4 h-4" /> {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
      </button>
    </div>
  );
}

/* ─── تبويب الخصوصية ─── */
function PrivacyTab({ user, refreshUser }) {
  const DEFAULTS = {
    showProfile: true, showPoints: true, showBadges: true,
    allowMessages: false, dataAnalytics: true,
  };
  const [settings, setSettings] = useState({ ...DEFAULTS, ...(user?.preferences?.privacy || {}) });
  const [saving, setSaving] = useState(false);

  const toggle = (key) => setSettings((s) => ({ ...s, [key]: !s[key] }));

  async function save() {
    setSaving(true);
    try {
      await api.updateMe({ preferences: { privacy: settings } });
      await refreshUser();
      toast.success("تم حفظ إعدادات الخصوصية ✅");
    } catch (err) {
      toast.error(err.message || "حدث خطأ");
    }
    setSaving(false);
  }

  const items = [
    { key: "showProfile",    label: "إظهار الملف الشخصي",     desc: "يستطيع الآخرون رؤية ملفك" },
    { key: "showPoints",     label: "إظهار نقاطي",            desc: "تظهر نقاطك في لوحة الصدارة" },
    { key: "showBadges",     label: "إظهار شاراتي وجوائزي",   desc: "تظهر إنجازاتك للمجتمع" },
    { key: "allowMessages",  label: "السماح برسائل مباشرة",  desc: "يمكن للمستخدمين مراسلتك" },
    { key: "dataAnalytics",  label: "تحسين تجربة التعليم",   desc: "نستخدم بياناتك لتحسين المنصة" },
  ];

  function Toggle({ on, onToggle }) {
    return (
      <button
        type="button"
        onClick={onToggle}
        className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${on ? "bg-blue-600" : "bg-slate-200"}`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all ${on ? "right-0.5" : "left-0.5"}`}
        />
      </button>
    );
  }

  return (
    <div dir="rtl">
      <h3 className="font-extrabold text-slate-800 mb-5 text-sm">إعدادات الخصوصية</h3>
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100"
          >
            <div>
              <p className="font-bold text-slate-800 text-sm">{item.label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
            </div>
            <Toggle on={settings[item.key]} onToggle={() => toggle(item.key)} />
          </div>
        ))}
      </div>
      <button
        onClick={save}
        disabled={saving}
        className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl flex items-center gap-2 transition disabled:opacity-60"
      >
        <Save className="w-4 h-4" /> {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
      </button>
    </div>
  );
}

/* ─── تبويب اللغة والمظهر ─── */
function LanguageTab({ user, refreshUser }) {
  const p = user?.preferences || {};
  const [theme, setTheme]       = useState(p.theme || "light");
  const [language, setLanguage] = useState(p.language || "ar");
  const [fontSize, setFontSize] = useState(p.fontSize || "medium");
  const [saving, setSaving]     = useState(false);

  async function save() {
    setSaving(true);
    try {
      await api.updateMe({ preferences: { theme, language, fontSize } });
      await refreshUser();
      // نطبّق حجم الخط فوراً على جذر الصفحة (Tailwind بيستخدم rem فبيتأثر كله)
      const px = fontSize === "small" ? "15px" : fontSize === "large" ? "18px" : "16px";
      document.documentElement.style.fontSize = px;
      toast.success("تم حفظ إعدادات المظهر ✅");
    } catch (err) {
      toast.error(err.message || "حدث خطأ");
    }
    setSaving(false);
  }

  return (
    <div dir="rtl" className="space-y-6">
      {/* المظهر */}
      <div>
        <h3 className="font-extrabold text-slate-800 mb-3 text-sm">المظهر</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: "light",  label: "فاتح",   icon: Sun  },
            { id: "dark",   label: "داكن",   icon: Moon },
            { id: "system", label: "تلقائي", icon: Smartphone },
          ].map(({ id, label, Icon = Sun }) => {
            const Ic = id === "light" ? Sun : id === "dark" ? Moon : Smartphone;
            return (
              <button
                key={id}
                onClick={() => setTheme(id)}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition ${
                  theme === id
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-white text-slate-500 hover:border-blue-300"
                }`}
              >
                <Ic className="w-5 h-5" />
                <span className="text-xs font-bold">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* اللغة */}
      <div>
        <h3 className="font-extrabold text-slate-800 mb-3 text-sm">اللغة</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { id: "ar", label: "العربية",   flag: "🇪🇬" },
            { id: "en", label: "English",   flag: "🇺🇸" },
          ].map(({ id, label, flag }) => (
            <button
              key={id}
              onClick={() => setLanguage(id)}
              className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition ${
                language === id
                  ? "border-blue-500 bg-blue-50"
                  : "border-slate-200 bg-white hover:border-blue-300"
              }`}
            >
              <span className="text-2xl">{flag}</span>
              <span className={`text-sm font-bold ${language === id ? "text-blue-700" : "text-slate-600"}`}>
                {label}
              </span>
              {language === id && (
                <CheckCircle className="w-4 h-4 text-blue-600 mr-auto" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* حجم الخط */}
      <div>
        <h3 className="font-extrabold text-slate-800 mb-3 text-sm">حجم الخط</h3>
        <div className="flex gap-2">
          {[
            { id: "small",  label: "صغير" },
            { id: "medium", label: "متوسط" },
            { id: "large",  label: "كبير"  },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setFontSize(id)}
              className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-bold transition ${
                fontSize === id
                  ? "border-blue-500 bg-blue-600 text-white"
                  : "border-slate-200 text-slate-500 hover:border-blue-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={save}
        disabled={saving}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl flex items-center gap-2 transition disabled:opacity-60"
      >
        <Save className="w-4 h-4" /> {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════
   الصفحة الرئيسية للإعدادات
   ═══════════════════════════════════════════ */
function Settings() {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");

  const initials = (user?.name || "؟")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);

  const gradeLabel =
    GRADES.find((g) => g.value === user?.grade)?.label || user?.grade || "—";

  return (
    <div dir="rtl" className="max-w-4xl mx-auto">
      {/* ─── رأس الصفحة ─── */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-blue-600">الإعدادات</h1>
          <p className="text-sm text-slate-400 mt-1">
            قم بتحديث ملفك الشخصي وتخصيص تجربتك التعليمية
          </p>
        </div>

        {/* بطاقة المستخدم */}
        <div className="hidden sm:flex items-center gap-3 bg-white rounded-2xl border border-slate-100 shadow-sm px-4 py-3">
          <div className="text-right">
            <p className="font-extrabold text-slate-800 text-sm">{user?.name || "—"}</p>
            <p className="text-[11px] text-slate-400">
              المستوى العاشر · XP {(user?.points || 0).toLocaleString("ar")}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-sm font-extrabold shadow">
            {initials}
          </div>
        </div>
      </div>

      {/* ─── المحتوى: تبويبات + محتوى ─── */}
      <div className="flex gap-5">
        {/* قائمة التبويبات (عمود يمين) */}
        <aside className="w-48 flex-shrink-0 hidden sm:flex flex-col gap-1 bg-white rounded-2xl border border-slate-100 shadow-sm p-3 self-start">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  active
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {tab.label}
              </button>
            );
          })}
        </aside>

        {/* تبويبات الموبايل (أفقية) */}
        <div className="sm:hidden flex gap-2 overflow-x-auto pb-2 mb-4 w-full">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                  active
                    ? "bg-blue-600 text-white"
                    : "bg-white text-slate-600 border border-slate-200"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* محتوى التبويب النشط */}
        <main className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          {/* عنوان التبويب */}
          <div className="mb-6 pb-4 border-b border-slate-100">
            <h2 className="font-extrabold text-slate-800 text-base">
              {TABS.find((t) => t.id === activeTab)?.label}
            </h2>
          </div>

          {/* محتوى */}
          {activeTab === "profile"       && <ProfileTab user={user} refreshUser={refreshUser} />}
          {activeTab === "account"       && <AccountTab user={user} logout={logout} navigate={navigate} />}
          {activeTab === "notifications" && <NotificationsTab user={user} refreshUser={refreshUser} />}
          {activeTab === "privacy"       && <PrivacyTab user={user} refreshUser={refreshUser} />}
          {activeTab === "language"      && <LanguageTab user={user} refreshUser={refreshUser} />}
        </main>
      </div>
    </div>
  );
}

export default Settings;
