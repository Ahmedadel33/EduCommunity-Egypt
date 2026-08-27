import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Video, Plus, Trash2, Clock, Eye, Bookmark, Radio, Users, Zap, BookOpen, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { GRADES, gradeLabel } from "../../lib/grades";

const card = "bg-white rounded-2xl border border-slate-100 shadow-sm";
const TABS = [{ v: "live", l: "المباشرة الآن" }, { v: "schedule", l: "الجدول الدراسي" }, { v: "recorded", l: "الدروس المسجلة" }];

// عدّاد تنازلي لموعد الدرس
function useCountdown(target) {
  const [left, setLeft] = useState("");
  useEffect(() => {
    if (!target) return;
    const tick = () => {
      const diff = new Date(target).getTime() - Date.now();
      if (diff <= 0) { setLeft("مباشر الآن"); return; }
      const h = Math.floor(diff / 3.6e6), m = Math.floor((diff % 3.6e6) / 6e4), s = Math.floor((diff % 6e4) / 1000);
      setLeft(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);
  return left;
}

function LessonsPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const canManage = user?.role === "teacher" || user?.role === "admin";
  const allowedGrades = user?.role === "teacher"
    ? (user.grades?.length ? user.grades : user.grade ? [user.grade] : [])
    : GRADES.map((g) => g.value);

  const [grade, setGrade] = useState(allowedGrades[0] || "sec-1");
  const [tab, setTab] = useState("live");
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [startsAt, setStartsAt] = useState("");

  useEffect(() => {
    if (!allowedGrades.includes(grade)) setGrade(allowedGrades[0] || "sec-1");
  }, [allowedGrades, grade]);

  const { data } = useQuery({ queryKey: ["lessons", grade], queryFn: () => api.getLessons(grade) });
  const lessons = data?.lessons || [];
  const featured = lessons[0];
  const countdown = useCountdown(featured?.startsAt);

  const create = useMutation({
    mutationFn: () => api.createLesson({ title, grade, subject, startsAt }),
    onSuccess: () => { toast.success("تم إنشاء الدرس"); setTitle(""); setSubject(""); setStartsAt(""); setShowForm(false); qc.invalidateQueries({ queryKey: ["lessons", grade] }); },
    onError: (e) => toast.error(e.message),
  });
  const del = useMutation({ mutationFn: (id) => api.deleteLesson(id), onSuccess: () => qc.invalidateQueries({ queryKey: ["lessons", grade] }) });

  // معلمون متصلون (مشتقّون من دروس الصف)
  const onlineTeachers = [...new Map(lessons.filter((l) => l.teacher).map((l) => [l.teacher._id || l.teacher.name, l.teacher])).values()].slice(0, 3);

  return (
    <div className="max-w-6xl mx-auto grid lg:grid-cols-4 gap-5" dir="rtl">
      {/* ===== المحتوى الرئيسي ===== */}
      <div className="lg:col-span-3 space-y-5">
        {/* هيدر */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800">الدروس أونلاين</h1>
            <p className="text-sm text-slate-400 mt-0.5">احضر الدروس المباشرة وتابع جدولك الدراسي.</p>
          </div>
          <div className="flex items-center gap-2">
            <select value={grade} onChange={(e) => setGrade(e.target.value)} className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none">
              {GRADES.filter((g) => allowedGrades.includes(g.value)).map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
            </select>
            {canManage && <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white text-sm font-bold px-4 py-2 rounded-xl flex items-center gap-1.5"><Plus className="w-4 h-4" /> جدولة درس</button>}
          </div>
        </div>

        {/* نموذج إنشاء درس */}
        {canManage && showForm && (
          <div className={`${card} p-4 grid md:grid-cols-3 gap-3`}>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="عنوان الدرس" className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none" />
            <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="المادة" className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none" />
            <input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none" />
            <button onClick={() => { if (!title || !startsAt) return toast.error("اكتب العنوان والموعد"); create.mutate(); }} disabled={create.isPending} className="md:col-span-3 bg-blue-600 text-white text-sm font-bold py-2 rounded-xl">حفظ الدرس</button>
          </div>
        )}

        {/* هيرو: الدرس المميّز + عدّاد */}
        {featured && (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-l from-blue-700 to-blue-500 text-white p-6">
            <span className="inline-flex items-center gap-1 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-full"><Radio className="w-3 h-3" /> مباشر الآن</span>
            <h2 className="text-2xl font-extrabold mt-3">{featured.title}</h2>
            <p className="text-sm text-blue-100 mt-1">انضم الآن إلى الأستاذ {featured.teacher?.name} في جلسة تفاعلية لمراجعة أهم نقاط المنهج.</p>
            <div className="flex items-center gap-4 mt-4 flex-wrap">
              <a href={featured.meetingUrl} target="_blank" rel="noreferrer"><button className="bg-white text-blue-700 font-bold text-sm px-5 py-2.5 rounded-xl flex items-center gap-2"><Video className="w-4 h-4" /> انضم للدرس الآن</button></a>
              <span className="font-mono font-extrabold text-lg tracking-widest">{countdown}</span>
            </div>
          </div>
        )}

        {/* التبويبات */}
        <div className="flex gap-2 border-b border-slate-100">
          {TABS.map((t) => (
            <button key={t.v} onClick={() => setTab(t.v)} className={`px-4 py-2 text-sm font-bold border-b-2 -mb-px transition ${tab === t.v ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400 hover:text-slate-600"}`}>{t.l}</button>
          ))}
        </div>

        {/* المحتوى حسب التبويب */}
        {tab === "recorded" ? (
          <div className={`${card} p-10 text-center`}>
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm text-slate-400 mt-2">الدروس المسجّلة ستظهر هنا بعد انتهاء البث المباشر.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {lessons.length === 0 && <p className="text-sm text-slate-400 text-center py-10">لا توجد دروس لهذا الصف.</p>}
            {lessons.map((l, i) => (
              <div key={l.id} className={`${card} p-4 flex items-center gap-4`}>
                <div className="w-28 h-20 rounded-xl bg-gradient-to-br from-blue-500 to-teal-400 shrink-0 hidden sm:flex items-center justify-center relative">
                  <Video className="w-7 h-7 text-white/80" />
                  <Bookmark className="absolute top-1.5 right-1.5 w-4 h-4 text-white/70" />
                </div>
                <div className="flex-1 min-w-0 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">{l.subject || "عام"}</span>
                    <span className="text-[10px] text-slate-400">{gradeLabel(l.grade)}</span>
                  </div>
                  <p className="font-bold text-slate-800 mt-1 truncate">{l.title} — {l.teacher?.name}</p>
                  <div className="flex items-center justify-end gap-3 text-[11px] text-slate-400 mt-1">
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {(i + 1) * 320} مشاهدة</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(l.startsAt).toLocaleString("ar-EG", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <a href={l.meetingUrl} target="_blank" rel="noreferrer"><button className="bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 w-full justify-center"><Video className="w-3.5 h-3.5" /> {canManage ? "بدء البث" : "انضمام"}</button></a>
                  {canManage && <button onClick={() => del.mutate(l.id)} className="border border-slate-200 text-slate-500 text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 justify-center"><Trash2 className="w-3.5 h-3.5" /> حذف</button>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ===== العمود الجانبي ===== */}
      <div className="space-y-5">
        {/* إحصائيات التعلم */}
        <div className={`${card} p-5`}>
          <h3 className="font-extrabold text-slate-800 mb-4">إحصائيات التعلم</h3>
          <div className="space-y-3">
            {[
              { icon: Zap, label: "نقاط الخبرة (XP)", val: (user?.points || 0).toLocaleString("ar"), color: "text-amber-600 bg-amber-100" },
              { icon: Clock, label: "ساعات المذاكرة", val: "12.5", color: "text-blue-600 bg-blue-100" },
              { icon: CheckCircle, label: "الدروس المكتملة", val: "24", color: "text-teal-600 bg-teal-100" },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${s.color}`}><Icon className="w-4 h-4" /></div>
                  <span className="flex-1 text-xs text-slate-500">{s.label}</span>
                  <span className="font-extrabold text-slate-800">{s.val}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* المعلمون المتصلون */}
        <div className={`${card} p-5`}>
          <h3 className="font-extrabold text-slate-800 mb-3">المعلمون المتصلون</h3>
          <div className="space-y-2">
            {onlineTeachers.length === 0 && <p className="text-xs text-slate-400">لا يوجد.</p>}
            {onlineTeachers.map((t, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="relative"><div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">{t.name?.charAt(0)}</div><span className="absolute bottom-0 left-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white" /></div>
                <div className="flex-1 min-w-0"><p className="text-xs font-bold text-slate-800 truncate">{t.name}</p><p className="text-[10px] text-slate-400">متصل الآن</p></div>
              </div>
            ))}
          </div>
        </div>

        {/* مجتمع الدفعة */}
        <div className="rounded-2xl bg-blue-600 text-white p-5">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center"><Users className="w-5 h-5" /></div>
          <p className="font-extrabold mt-3">مجتمع الدفعة</p>
          <p className="text-xs text-blue-100 mt-1">انضم لآلاف الطلاب يتبادلون الخبرات يومياً.</p>
        </div>
      </div>
    </div>
  );
}

export default LessonsPage;
