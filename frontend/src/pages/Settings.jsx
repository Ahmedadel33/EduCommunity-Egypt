import { useRef, useState } from "react";
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
import { resolveMediaUrl } from "../lib/media";
import { useI18n } from "../lib/i18n";

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
const labelCls = "block text-xs font-bold text-slate-500 mb-1 text-start";

/* ─── تبويب الملف الشخصي ─── */
function ProfileTab({ user, refreshUser }) {
  const { language, t } = useI18n();
  const [name, setName]           = useState(user?.name || "");
  const [schoolCode, setSchoolCode] = useState(user?.schoolCode || "");
  const [grade, setGrade]         = useState(user?.grade || "");
  const [teacherGrades, setTeacherGrades] = useState(() => {
    const savedGrades = user?.grades?.length ? user.grades : user?.grade ? [user.grade] : [];
    return savedGrades.filter((savedGrade) => GRADES.some((option) => option.value === savedGrade));
  });
  const [bio, setBio]             = useState(user?.bio || "");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(resolveMediaUrl(user?.avatarUrl));
  const [avatarPosition, setAvatarPosition] = useState(user?.avatarPosition || { x: 50, y: 50 });
  const fileInputRef = useRef(null);
  const [saving, setSaving]       = useState(false);

  async function handleSave(e) {
    e.preventDefault();
    if (!name.trim()) { toast.error(t("الاسم مطلوب")); return; }
    if (user?.role === "teacher" && teacherGrades.length === 0) {
      toast.error(t("اختر صفًا دراسيًا واحدًا على الأقل"));
      return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("bio", bio);
      formData.append("schoolCode", schoolCode);
      if (user?.role !== "teacher") formData.append("grade", grade);
      else formData.append("grades", JSON.stringify(teacherGrades));
      formData.append("avatarPosition", JSON.stringify(avatarPosition));
      if (avatarFile) formData.append("avatar", avatarFile);
      const res = await api.updateMe(formData);
      if (res.token)        localStorage.setItem("token", res.token);
      if (res.refreshToken) localStorage.setItem("refreshToken", res.refreshToken);
      await refreshUser();
      toast.success(t("تم حفظ التغييرات ✅"));
    } catch (err) {
      toast.error(err.message || t("حدث خطأ"));
    }
    setSaving(false);
  }

  const initials = (user?.name || "؟")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);

  return (
    <form onSubmit={handleSave} dir={language === "ar" ? "rtl" : "ltr"}>
      {/* صورة الملف الشخصي */}
      <div className="flex flex-col items-start gap-3 mb-6">
        <h3 className="font-extrabold text-slate-800 text-base">{t("تعديل الصورة الشخصية")}</h3>
        <p className="text-xs text-slate-400">{t("توصى بصورة مربعة لا تقل عن 400×400 بكسل.")}</p>
        <div className="relative w-24 h-24 mt-1">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-3xl font-extrabold shadow-lg">
            {avatarPreview ? <img src={avatarPreview} alt="" className="w-full h-full object-cover" style={{ objectPosition: `${avatarPosition.x}% ${avatarPosition.y}%` }} /> : initials}
          </div>
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) { setAvatarFile(file); setAvatarPreview(URL.createObjectURL(file)); } }} />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title={t("تغيير الصورة")}
            className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md hover:bg-blue-700 transition"
          >
            <Camera className="w-4 h-4" />
          </button>
        </div>
        {avatarPreview && (
          <div className="w-full max-w-xs space-y-2" dir={language === "ar" ? "rtl" : "ltr"}>
            <label className={labelCls}>{t("موضع الصورة أفقيًا")}</label>
            <input type="range" min="0" max="100" value={avatarPosition.x} onChange={(e) => setAvatarPosition((p) => ({ ...p, x: Number(e.target.value) }))} className="w-full accent-blue-600" />
            <label className={labelCls}>{t("موضع الصورة رأسيًا")}</label>
            <input type="range" min="0" max="100" value={avatarPosition.y} onChange={(e) => setAvatarPosition((p) => ({ ...p, y: Number(e.target.value) }))} className="w-full accent-blue-600" />
          </div>
        )}
      </div>

      {/* حقول البيانات */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className={labelCls}>{t("الاسم الكامل")}</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputCls}
            placeholder={t("اسمك الكامل")}
          />
        </div>
        <div>
          {user?.role !== "teacher" && <label className={labelCls}>{t("الصف الدراسي")}</label>}
          {user?.role !== "teacher" && (
          <select
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            className={inputCls}
          >
            <option value="">{t("اختر الصف...")}</option>
            {GRADES.map((g) => (
              <option key={g.value} value={g.value}>{t(g.label)}</option>
            ))}
          </select>
          )}
          {user?.role === "teacher" && (
            <fieldset className="mt-4">
              <legend className={labelCls}>{t("الصفوف التي تدرّسها")}</legend>
              <p className="text-xs text-slate-400 mb-2">{t("اختر صفًا واحدًا أو أكثر لتظهر لك مواده ودروسه.")}</p>
              <div className="grid grid-cols-2 gap-2">
                {GRADES.map((g) => (
                  <label key={g.value} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={teacherGrades.includes(g.value)}
                      onChange={() => setTeacherGrades((current) => current.includes(g.value)
                        ? current.filter((value) => value !== g.value)
                        : [...current, g.value])}
                      className="accent-blue-600"
                    />
                    <span>{t(g.label)}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}
        </div>
      </div>

      <div className="mb-4">
        <label className={labelCls}>{t("المدرسة")}</label>
        <input
          value={schoolCode}
          onChange={(e) => setSchoolCode(e.target.value)}
          className={inputCls}
          placeholder={t("اسم أو كود مدرستك")}
        />
      </div>

      <div className="mb-6">
        <label className={labelCls}>{t("نبذة تعريفية")}</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          className={`${inputCls} resize-none`}
          placeholder={t("اكتب نبذة قصيرة عن نفسك...")}
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl flex items-center gap-2 disabled:opacity-60 transition shadow-sm shadow-blue-200"
      >
        <Save className="w-4 h-4" />
        {saving ? t("جاري الحفظ...") : t("حفظ التغييرات")}
      </button>
    </form>
  );
}

/* ─── تبويب الحساب ─── */
function AccountTab({ user, logout, navigate }) {
  const { language, t } = useI18n();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword]         = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew]                 = useState(false);
  const [saving, setSaving]                   = useState(false);

  async function handleChangePassword(e) {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error(t("كلمة المرور يجب ألا تقل عن 6 أحرف"));
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error(t("كلمتا المرور غير متطابقتين"));
      return;
    }
    setSaving(true);
    try {
      await api.updateMe({ currentPassword, password: newPassword });
      toast.success(t("تم تغيير كلمة المرور ✅"));
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (err) {
      toast.error(err.message || t("حدث خطأ"));
    }
    setSaving(false);
  }

  return (
    <div dir={language === "ar" ? "rtl" : "ltr"} className="space-y-6">
      {/* معلومات الحساب */}
      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
        <h3 className="font-extrabold text-slate-800 mb-4 text-sm">{t("معلومات الحساب")}</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-slate-100">
            <span className="text-slate-800 text-sm font-medium">{user?.name}</span>
            <span className="text-xs text-slate-400">{t("الاسم")}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-slate-100">
            <span className="text-slate-800 text-sm font-medium">{user?.email}</span>
            <span className="text-xs text-slate-400">{t("البريد الإلكتروني")}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              {t(user?.role === "teacher" ? "معلم" : user?.role === "admin" ? "مدير النظام" : "طالب")}
            </span>
            <span className="text-xs text-slate-400">{t("الدور")}</span>
          </div>
        </div>
      </div>

      {/* تغيير كلمة المرور */}
      <form onSubmit={handleChangePassword}>
        <h3 className="font-extrabold text-slate-800 mb-4 text-sm">{t("تغيير كلمة المرور")}</h3>
        <div className="space-y-3 mb-4">
          <div>
            <label className={labelCls}>{t("كلمة المرور الحالية")}</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={inputCls}
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className={labelCls}>{t("كلمة المرور الجديدة")}</label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={`${inputCls} pl-10`}
                placeholder={t("6 أحرف على الأقل")}
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
            <label className={labelCls}>{t("تأكيد كلمة المرور")}</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputCls}
              placeholder={t("أعد كتابة كلمة المرور")}
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl flex items-center gap-2 disabled:opacity-60 transition"
        >
          <Lock className="w-4 h-4" />
          {saving ? t("جاري الحفظ...") : t("تحديث كلمة المرور")}
        </button>
      </form>

      {/* تسجيل الخروج */}
      <div className="pt-4 border-t border-slate-100">
        <h3 className="font-extrabold text-slate-800 mb-3 text-sm">{t("منطقة الخطر")}</h3>
        <button
          onClick={() => { logout(); navigate("/"); }}
          className="flex items-center gap-2 text-rose-500 font-bold text-sm border border-rose-200 rounded-xl px-5 py-2.5 hover:bg-rose-50 transition"
        >
          <LogOut className="w-4 h-4" /> {t("تسجيل الخروج")}
        </button>
      </div>
    </div>
  );
}

/* ─── تبويب الإشعارات ─── */
function NotificationsTab({ user, refreshUser }) {
  const { language, t } = useI18n();
  const DEFAULTS = {
    newMaterial: true, liveLesson: true, community: true,
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
      toast.success(t("تم حفظ تفضيلات الإشعارات ✅"));
    } catch (err) {
      toast.error(err.message || t("حدث خطأ"));
    }
    setSaving(false);
  }

  const items = [
    { key: "newMaterial", label: "مواد تعليمية جديدة", desc: "عند اعتماد مادة دراسية لصفك أو تخصصك", required: true },
    { key: "liveLesson", label: "دروس مباشرة قادمة", desc: "عند إنشاء درس جديد للصفوف المعنية", required: true },
    { key: "community", label: "منشورات المجتمع والتعليقات", desc: "رسائل عن المنشورات والتعليقات الجديدة" },
    { key: "rewards", label: "المكافآت والشارات", desc: "عند منحك جائزة أو وسام" },
    { key: "chat", label: "رسائل الشات", desc: "رسائل عند وصول رسالة جديدة" },
    { key: "weeklyDigest", label: "ملخّص أسبوعي", desc: "ملخص نشاط المنصة كل أسبوع" },
  ];

  function Toggle({ on, onToggle, disabled = false, label }) {
    return (
      <button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        aria-pressed={on}
        aria-label={label}
        className={`w-11 h-6 rounded-full transition-colors relative ${on ? "bg-blue-600" : "bg-slate-200"} ${disabled ? "cursor-not-allowed opacity-80" : ""}`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all ${on ? "right-0.5" : "left-0.5"}`}
        />
      </button>
    );
  }

  return (
    <div dir={language === "ar" ? "rtl" : "ltr"}>
      <h3 className="font-extrabold text-slate-800 mb-5 text-sm">{t("تفضيلات الإشعارات")}</h3>
      <p className="text-xs text-slate-500 mb-4">{t("الإشعارات الدراسية المهمة مفعلة دائمًا، ويمكنك إيقاف الإشعارات الاجتماعية والترفيهية فقط.")}</p>
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100"
          >
            <div>
              <p className="font-bold text-slate-800 text-sm">{t(item.label)}</p>
              <p className="text-xs text-slate-400 mt-0.5">{t(item.desc)}</p>
            </div>
            <Toggle on={item.required || prefs[item.key]} onToggle={() => toggle(item.key)} disabled={item.required} label={t(item.label)} />
          </div>
        ))}
      </div>
      <button
        onClick={save}
        disabled={saving}
        className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl flex items-center gap-2 transition disabled:opacity-60"
      >
        <Save className="w-4 h-4" /> {saving ? t("جاري الحفظ...") : t("حفظ التغييرات")}
      </button>
    </div>
  );
}

/* ─── تبويب الخصوصية ─── */
function PrivacyTab({ user, refreshUser }) {
  const { language, t } = useI18n();
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
      toast.success(t("تم حفظ إعدادات الخصوصية ✅"));
    } catch (err) {
      toast.error(err.message || t("حدث خطأ"));
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
    <div dir={language === "ar" ? "rtl" : "ltr"}>
      <h3 className="font-extrabold text-slate-800 mb-5 text-sm">{t("إعدادات الخصوصية")}</h3>
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100"
          >
            <div>
              <p className="font-bold text-slate-800 text-sm">{t(item.label)}</p>
              <p className="text-xs text-slate-400 mt-0.5">{t(item.desc)}</p>
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
        <Save className="w-4 h-4" /> {saving ? t("جاري الحفظ...") : t("حفظ التغييرات")}
      </button>
    </div>
  );
}

/* ─── تبويب اللغة والمظهر ─── */
function LanguageTab({ user, refreshUser }) {
  const { language: activeLanguage, changeLanguage, t } = useI18n();
  const p = user?.preferences || {};
  const [theme, setTheme]       = useState(p.theme || "light");
  const [language, setLanguage] = useState(p.language || activeLanguage);
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
      toast.success(t("تم حفظ إعدادات المظهر ✅"));
    } catch (err) {
      toast.error(err.message || t("حدث خطأ"));
    }
    setSaving(false);
  }

  return (
    <div dir={activeLanguage === "ar" ? "rtl" : "ltr"} className="space-y-6">
      {/* المظهر */}
      <div>
        <h3 className="font-extrabold text-slate-800 mb-3 text-sm">{t("المظهر")}</h3>
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
                <span className="text-xs font-bold">{t(label)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* اللغة */}
      <div>
        <h3 className="font-extrabold text-slate-800 mb-3 text-sm">{t("اللغة")}</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { id: "ar", label: "العربية",   flag: "🇪🇬" },
            { id: "en", label: "English",   flag: "🇺🇸" },
          ].map(({ id, label, flag }) => (
            <button
              key={id}
              onClick={() => { setLanguage(id); changeLanguage(id); }}
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
        <h3 className="font-extrabold text-slate-800 mb-3 text-sm">{t("حجم الخط")}</h3>
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
              {t(label)}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={save}
        disabled={saving}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl flex items-center gap-2 transition disabled:opacity-60"
      >
        <Save className="w-4 h-4" /> {saving ? t("جاري الحفظ...") : t("حفظ التغييرات")}
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════
   الصفحة الرئيسية للإعدادات
   ═══════════════════════════════════════════ */
function Settings() {
  const { user, logout, refreshUser } = useAuth();
  const { language, t } = useI18n();
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
    <div dir={language === "ar" ? "rtl" : "ltr"} className="max-w-4xl mx-auto">
      {/* ─── رأس الصفحة ─── */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-blue-600">{t("الإعدادات")}</h1>
          <p className="text-sm text-slate-400 mt-1">
            {t("قم بتحديث ملفك الشخصي وتخصيص تجربتك التعليمية")}
          </p>
        </div>

        {/* بطاقة المستخدم */}
        <div className="hidden sm:flex items-center gap-3 bg-white rounded-2xl border border-slate-100 shadow-sm px-4 py-3">
          <div className={language === "ar" ? "text-right" : "text-left"}>
            <p className="font-extrabold text-slate-800 text-sm">{user?.name || "—"}</p>
            <p className="text-[11px] text-slate-400">
              {language === "en" ? `Level 10 · XP ${(user?.points || 0).toLocaleString("en-US")}` : `المستوى العاشر · XP ${(user?.points || 0).toLocaleString("ar")}`}
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
                {t(tab.label)}
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
                {t(tab.label)}
              </button>
            );
          })}
        </div>

        {/* محتوى التبويب النشط */}
        <main className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          {/* عنوان التبويب */}
          <div className="mb-6 pb-4 border-b border-slate-100">
            <h2 className="font-extrabold text-slate-800 text-base">
              {t(TABS.find((tab) => tab.id === activeTab)?.label)}
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
