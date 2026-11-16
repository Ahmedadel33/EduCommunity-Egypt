import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Mail, Lock, Eye, EyeOff, User, School, CreditCard, ArrowLeft } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { GRADES, SUBJECTS } from "../../lib/grades";
import { useI18n } from "../../lib/i18n";

function AuthForm() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const { language, t } = useI18n();

  const [isLogin, setIsLogin] = useState(true); // بنبدّل بين الدخول والتسجيل
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // إظهار/إخفاء كلمة المرور

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [grade, setGrade] = useState("sec-1");
  const [teacherGrades, setTeacherGrades] = useState([]);
  const [subject, setSubject] = useState(SUBJECTS[0]); // تخصّص المدرس
  const [schoolCode, setSchoolCode] = useState("");
  const [nationalId, setNationalId] = useState(""); // الرقم القومي (للتحقق من هوية الطالب)

  const inputClass = "w-full rounded-xl border border-slate-200 bg-slate-50 pr-10 pl-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:bg-white";
  const labelClass = `block text-sm font-bold text-slate-600 mb-1 ${language === "ar" ? "text-right" : "text-left"}`;
  const selectClass = "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:bg-white";

  async function handleSubmit(e) {
    e.preventDefault();

    if (!email || !password) {
      toast.error(t("اكتب البريد وكلمة المرور"));
      return;
    }
    if (password.length < 6) {
      toast.error(t("كلمة المرور 6 أحرف على الأقل"));
      return;
    }
    if (!isLogin && !name) {
      toast.error(t("اكتب الاسم"));
      return;
    }
    // المدرس لازم يختار تخصّصه
    if (!isLogin && role === "teacher" && !subject) {
      toast.error(t("اختر المادة التي تدرّسها"));
      return;
    }
    if (!isLogin && role === "teacher" && teacherGrades.length === 0) {
      toast.error(t("اختر صفًا دراسيًا واحدًا على الأقل"));
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await login({ email, password });
        toast.success(t("تم تسجيل الدخول"));
      } else {
        await register({
          name,
          email,
          password,
          role,
          grade: role === "student" ? grade : undefined,
          grades: role === "teacher" ? teacherGrades : undefined,
          subject: role === "teacher" ? subject : undefined,
          schoolCode: schoolCode || undefined,
          nationalId: nationalId || undefined,
        });
        toast.success(t("تم إنشاء الحساب"));
      }
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.message || t("فشلت العملية"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div dir={language === "ar" ? "rtl" : "ltr"} className="w-full max-w-md bg-white rounded-2xl border border-slate-100 shadow-sm p-6 lg:p-8">
      {/* العنوان */}
      <div className={language === "ar" ? "text-right mb-5" : "text-left mb-5"}>
        <h2 className="text-2xl font-extrabold text-slate-800">
          {t(isLogin ? "أهلاً بك مرة أخرى" : "حساب جديد")}
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          {t(isLogin ? "اكتب بياناتك للدخول إلى حسابك." : "انضم لمجتمع التعليم المصري.")}
        </p>
      </div>

      {/* أزرار التبديل بين الدخول والتسجيل */}
      <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
        <button
          type="button"
          onClick={() => setIsLogin(true)}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${isLogin ? "bg-white text-blue-600 shadow-sm" : "text-slate-400"}`}
        >
          {t("تسجيل الدخول")}
        </button>
        <button
          type="button"
          onClick={() => setIsLogin(false)}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${!isLogin ? "bg-white text-blue-600 shadow-sm" : "text-slate-400"}`}
        >
          {t("حساب جديد")}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* الاسم — في التسجيل بس */}
        {!isLogin && (
          <div>
            <label className={labelClass}>{t("الاسم الكامل")}</label>
            <div className="relative">
              <User className={`w-4 h-4 text-slate-400 absolute ${language === "ar" ? "right-3" : "left-3"} top-1/2 -translate-y-1/2`} />
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("محمد أحمد")}
                className={`${inputClass} ${language === "ar" ? "pr-10" : "pl-10"}`}
              />
            </div>
          </div>
        )}

        {/* البريد الإلكتروني */}
        <div>
          <label className={labelClass}>{t("البريد الإلكتروني")}</label>
          <div className="relative">
            <Mail className={`w-4 h-4 text-slate-400 absolute ${language === "ar" ? "right-3" : "left-3"} top-1/2 -translate-y-1/2`} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@school.edu.eg"
              className={`${inputClass} ${language === "ar" ? "pr-10" : "pl-10"}`}
            />
          </div>
        </div>

        {/* كلمة المرور مع زر الإظهار */}
        <div>
          <label className={labelClass}>{t("كلمة المرور")}</label>
          <div className="relative">
            <Lock className={`w-4 h-4 text-slate-400 absolute ${language === "ar" ? "right-3" : "left-3"} top-1/2 -translate-y-1/2`} />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={`${inputClass} ${language === "ar" ? "pr-10 pl-10" : "pl-10 pr-10"}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={`absolute ${language === "ar" ? "left-3" : "right-3"} top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600`}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* حقول التسجيل الإضافية */}
        {!isLogin && (
          <>
            <div>
              <label className={labelClass}>{t("نوع الحساب")}</label>
              <select value={role} onChange={(e) => setRole(e.target.value)} className={selectClass}>
                <option value="student">{t("طالب")}</option>
                <option value="teacher">{t("معلم")}</option>
              </select>
            </div>

            {/* المرحلة الدراسية تظهر للطالب بس */}
            {role === "student" && (
              <div>
                <label className={labelClass}>{t("المرحلة الدراسية")}</label>
                <select value={grade} onChange={(e) => setGrade(e.target.value)} className={selectClass}>
                  {GRADES.map((g) => (
                    <option key={g.value} value={g.value}>{t(g.label)}</option>
                  ))}
                </select>
              </div>
            )}

            {/* المادة (التخصّص) تظهر للمعلم بس — بيرفع مواد في تخصّصه فقط */}
            {role === "teacher" && (
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>{t("المادة التي تدرّسها")}</label>
                  <select value={subject} onChange={(e) => setSubject(e.target.value)} className={selectClass}>
                    {SUBJECTS.map((s) => (
                      <option key={s} value={s}>{t(s)}</option>
                    ))}
                  </select>
                </div>
                <fieldset>
                  <legend className={`${labelClass} mt-4`}>{t("الصفوف التي تدرّسها")}</legend>
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
                  {teacherGrades.length > 0 && (
                    <p className="text-xs text-blue-600 mt-2">
                      {teacherGrades.length} {t("صفوف مختارة")}
                    </p>
                  )}
                </fieldset>
              </div>
            )}

            <div>
              <label className={labelClass}>{t("كود المدرسة (اختياري)")}</label>
              <div className="relative">
                <School className={`w-4 h-4 text-slate-400 absolute ${language === "ar" ? "right-3" : "left-3"} top-1/2 -translate-y-1/2`} />
                <input
                  value={schoolCode}
                  onChange={(e) => setSchoolCode(e.target.value)}
                  placeholder="SCH-2024"
                  className={`${inputClass} ${language === "ar" ? "pr-10" : "pl-10"}`}
                />
              </div>
            </div>

            {/* الرقم القومي — للتحقق من هوية الطالب */}
            <div>
              <label className={labelClass}>{t("الرقم القومي (اختياري)")}</label>
              <div className="relative">
                <CreditCard className={`w-4 h-4 text-slate-400 absolute ${language === "ar" ? "right-3" : "left-3"} top-1/2 -translate-y-1/2`} />
                <input
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value)}
                  placeholder="14 رقم"
                  className={`${inputClass} ${language === "ar" ? "pr-10" : "pl-10"}`}
                />
              </div>
            </div>
          </>
        )}

        {/* زر الإرسال */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading ? t("جاري التحميل...") : t(isLogin ? "تسجيل الدخول" : "إنشاء حساب")}
          {!loading && <ArrowLeft className="w-4 h-4" />}
        </button>
      </form>

      {/* رابط التبديل تحت الفورم */}
      <p className="text-center text-sm text-slate-400 mt-5">
        {t(isLogin ? "ليس لديك حساب؟" : "لديك حساب بالفعل؟")}{" "}
        <button
          type="button"
          onClick={() => setIsLogin(!isLogin)}
          className="font-bold text-blue-600 hover:underline"
        >
          {t(isLogin ? "سجّل الآن" : "تسجيل الدخول")}
        </button>
      </p>
    </div>
  );
}

export default AuthForm;
