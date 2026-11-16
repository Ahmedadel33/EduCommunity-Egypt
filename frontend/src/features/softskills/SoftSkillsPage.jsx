import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sparkles, Plus, Upload, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { SUBJECTS } from "../../lib/grades";
import { useI18n } from "../../lib/i18n";

const card = "bg-white rounded-2xl border border-slate-100 shadow-sm";

// بطاقة تاسك للطالب
function StudentTaskCard({ task, mySub }) {
  const { language, t } = useI18n();
  const qc = useQueryClient();
  const [file, setFile] = useState(null);
  const submit = useMutation({
    mutationFn: () => { const fd = new FormData(); fd.append("file", file); return api.submitTask(task.id, fd); },
    onSuccess: () => { toast.success(t("تم تسليم البريزنتيشن")); qc.invalidateQueries({ queryKey: ["my-subs"] }); },
    onError: (e) => toast.error(e.message),
  });
  return (
    <div dir={language === "ar" ? "rtl" : "ltr"} className={`${card} p-5`}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">{task.points} {t("نقطة")}</span>
        <h3 className="font-bold text-slate-800">{task.title}</h3>
      </div>
      {task.description && <p className="text-sm text-slate-400 mt-1 text-right">{task.description}</p>}
      {mySub ? (
        <div className="mt-3 flex items-center justify-end gap-2 text-sm text-emerald-600">
          <CheckCircle className="w-4 h-4" />
          {mySub.grade != null ? `${t("تم التصحيح — درجتك:")} ${mySub.grade}` : t("تم التسليم — بانتظار التصحيح")}
        </div>
      ) : (
        <div className="flex items-center gap-2 mt-3">
          <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="text-xs flex-1" />
          <button disabled={!file || submit.isPending} onClick={() => submit.mutate()} className="bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1"><Upload className="w-3.5 h-3.5" /> {t("سلّم")}</button>
        </div>
      )}
    </div>
  );
}

// صف تسليم للمدرس (تصحيح)
function SubRow({ sub }) {
  const { language, t } = useI18n();
  const qc = useQueryClient();
  const [grade, setGrade] = useState(sub.grade ?? "");
  const g = useMutation({
    mutationFn: () => api.gradeSubmission(sub.id, { grade: Number(grade) }),
    onSuccess: () => { toast.success(t("تم حفظ الدرجة")); qc.invalidateQueries({ queryKey: ["all-subs"] }); },
  });
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F5F7FF] flex-wrap">
      <div className={`flex-1 ${language === "ar" ? "text-right" : "text-left"}`}><p className="font-bold text-sm">{sub.student?.name}</p><p className="text-xs text-slate-400">{sub.task?.title}</p></div>
      <a href={(import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1").replace(/\/api\/v1\/?$/, "") + sub.fileUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 font-bold">{t("فتح الملف")}</a>
      <input type="number" value={grade} onChange={(e) => setGrade(e.target.value)} placeholder={t("درجة")} className="w-16 bg-white border border-slate-200 rounded-lg px-2 py-1 text-sm" />
      <button disabled={g.isPending} onClick={() => g.mutate()} className="bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg">{t("حفظ")}</button>
    </div>
  );
}

function SoftSkillsPage() {
  const { user } = useAuth();
  const { language, t } = useI18n();
  const qc = useQueryClient();
  const canManage = user?.role === "teacher" || user?.role === "admin";
  const isStudent = user?.role === "student";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [points, setPoints] = useState(10);
  const [subject, setSubject] = useState(user?.subject || SUBJECTS[0]);

  const { data: tData } = useQuery({ queryKey: ["tasks"], queryFn: () => api.getTasks() });
  const tasks = tData?.tasks || [];
  const { data: myS } = useQuery({ queryKey: ["my-subs"], queryFn: () => api.getTaskSubmissions(), enabled: isStudent });
  const myByTask = {}; (myS?.submissions || []).forEach((s) => { myByTask[s.task?.id || s.task] = s; });
  const { data: allS } = useQuery({ queryKey: ["all-subs"], queryFn: () => api.getTaskSubmissions(), enabled: canManage });

  const create = useMutation({
    mutationFn: () => api.createTask({ title, description, points, subject }),
    onSuccess: () => { toast.success(t("تم إنشاء التاسك")); setTitle(""); setDescription(""); setPoints(10); qc.invalidateQueries({ queryKey: ["tasks"] }); },
    onError: (e) => toast.error(e.message),
  });

  // إحصائيات: عدد المهارات المكتملة (تسليمات مصحّحة) للطالب
  const completed = isStudent ? Object.values(myByTask).filter((s) => s?.grade != null).length : 0;
  const certificates = isStudent ? Object.values(myByTask).filter((s) => s?.grade != null).slice(0, 3) : [];

  return (
    <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-5" dir={language === "ar" ? "rtl" : "ltr"}>
      {/* ===== المحتوى الرئيسي ===== */}
      <div className="lg:col-span-2 space-y-5">
        {/* هيرو */}
        <div className="rounded-2xl bg-gradient-to-l from-blue-700 to-blue-500 text-white p-6">
          <h1 className="text-2xl font-extrabold">{t("طوّر مهاراتك لمستقبل أفضل")}</h1>
          <p className="text-sm text-blue-100 mt-2 max-w-lg leading-relaxed">{t("اكتشف قوة المهارات الناعمة في تحويل مسارك المهني والأكاديمي. نركّز على تمكينك من خلال تطوير التواصل، القيادة، وإدارة الوقت لضمان تميّزك في سوق العمل الحديث.")}</p>
        </div>

        {/* إضافة تاسك (للمدرس/الأدمن) */}
        {canManage && (
          <div className={`${card} p-5`}>
            <p className="font-extrabold text-slate-800 mb-3 flex items-center gap-2"><Plus className="w-4 h-4" /> {t("إضافة تاسك جديد")}</p>
            <div className="grid gap-3">
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("عنوان التاسك")} className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none" />
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t("الوصف")} rows={2} className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none" />
              <input type="number" value={points} onChange={(e) => setPoints(Number(e.target.value))} className="w-28 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none" />
              <select value={subject} onChange={(e) => setSubject(e.target.value)} disabled={user?.role === "teacher"} className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none disabled:text-slate-500">
                {SUBJECTS.map((item) => <option key={item} value={item}>{t(item)}</option>)}
              </select>
            </div>
            <button disabled={create.isPending} onClick={() => { if (!title) return toast.error(t("اكتب العنوان")); create.mutate(); }} className="mt-3 bg-blue-600 text-white text-sm font-bold px-5 py-2 rounded-xl">{t("حفظ التاسك")}</button>
          </div>
        )}

        {/* استكشف المهارات (التاسكات) */}
        <div>
          <h2 className="font-extrabold text-slate-800 mb-3">{t("استكشف المهارات الأساسية")}</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {tasks.length === 0 && <p className="text-sm text-slate-400">{t("لا توجد مهارات بعد.")}</p>}
            {tasks.map((task) => isStudent
              ? <StudentTaskCard key={task.id} task={task} mySub={myByTask[task.id]} />
              : <div key={task.id} className={`${card} p-5`}><div className="flex items-center justify-between"><span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">{task.points} {t("نقطة")}</span><h3 className="font-bold text-slate-800">{task.title}</h3></div><p className="text-xs text-blue-600 font-bold mt-2 text-right">{t(task.subject)}</p>{task.description && <p className="text-sm text-slate-400 mt-1 text-right">{task.description}</p>}</div>
            )}
          </div>
        </div>

        {/* التسليمات للتصحيح (للمدرس/الأدمن) */}
        {canManage && (
          <div>
            <h2 className="font-extrabold text-slate-800 mb-3">{t("التسليمات للتصحيح")}</h2>
            <div className="space-y-2">
              {(allS?.submissions || []).length === 0 && <p className="text-sm text-slate-400">{t("لا توجد تسليمات بعد.")}</p>}
              {(allS?.submissions || []).map((s) => <SubRow key={s.id} sub={s} />)}
            </div>
          </div>
        )}
      </div>

      {/* ===== العمود الجانبي ===== */}
      <div className="space-y-5">
        {/* إحصائيات المهارات */}
        <div className="rounded-2xl bg-blue-600 text-white p-5">
          <div className="flex items-center gap-2 mb-3"><Sparkles className="w-5 h-5" /><p className="font-extrabold">{t("إحصائيات المهارات")}</p></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/10 rounded-xl p-3 text-center"><p className="text-2xl font-extrabold">{completed || 12}</p><p className="text-[10px] text-blue-100">{t("مهارة مكتملة")}</p></div>
            <div className="bg-white/10 rounded-xl p-3 text-center"><p className="text-2xl font-extrabold">{tasks.length}</p><p className="text-[10px] text-blue-100">{t("مهارة متاحة")}</p></div>
          </div>
        </div>

        {/* شهاداتي */}
        <div className={`${card} p-5`}>
          <h3 className="font-extrabold text-slate-800 mb-3">{t("شهاداتي")}</h3>
          <div className="space-y-2">
            {certificates.length === 0 && <p className="text-xs text-slate-400">{t("أكمل المهارات لتحصل على شهاداتك هنا.")}</p>}
            {certificates.map((s, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded-xl bg-amber-50">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center"><CheckCircle className="w-4 h-4" /></div>
                <p className="text-xs font-bold text-slate-800 flex-1 truncate">{s.task?.title || t("مهارة")}</p>
                <span className="text-[10px] text-emerald-600 font-bold">{s.grade}/100</span>
              </div>
            ))}
          </div>
        </div>

        {/* دورة مقترحة */}
        <div className="rounded-2xl bg-teal-600 text-white p-5">
          <p className="text-[11px] text-teal-100 font-bold">{t("دورة مقترحة لك اليوم")}</p>
          <p className="font-extrabold mt-1">{t("كيف تفكّر كمخطّط محترف؟")}</p>
          <p className="text-xs text-teal-50 mt-1 leading-relaxed">{t("تعلّم تحليل المواقف المعقّدة واتخاذ القرارات المبنية على بيانات ورؤية بعيدة المدى.")}</p>
        </div>
      </div>
    </div>
  );
}

export default SoftSkillsPage;
