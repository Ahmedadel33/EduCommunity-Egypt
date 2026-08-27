import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Star, Search, MessageSquare, ThumbsUp, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

const card = "bg-white rounded-2xl border border-slate-100 shadow-sm";

function StarRating({ rating, interactive = false, onChange }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const color = star <= rating ? "text-amber-400 fill-amber-400" : "text-slate-200";
        if (!interactive) return <Star key={star} className={`w-3.5 h-3.5 ${color}`} />;
        return (
          <button key={star} type="button" onClick={() => onChange(star)} className="cursor-pointer transition-transform hover:scale-110">
            <Star className={`w-5 h-5 ${color}`} />
          </button>
        );
      })}
    </div>
  );
}

// ===== نخبة المعلمين — مطابقة لتصميم الفيجما (grid + sidebar + تقييم) =====
function TeacherRating() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("all");
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [commentText, setCommentText] = useState("");

  const { data, isLoading, error } = useQuery({ queryKey: ["teachers"], queryFn: () => api.getTeachers() });
  const teachers = data?.teachers || [];

  const subjects = useMemo(() => [...new Set(teachers.map((t) => t.subject).filter(Boolean))], [teachers]);
  const topRated = useMemo(() => [...teachers].sort((a, b) => b.avg_rating - a.avg_rating).slice(0, 4), [teachers]);

  const rate = useMutation({
    mutationFn: (vars) => api.rateTeacher(vars.id, vars.rating, vars.comment),
    onSuccess: () => {
      toast.success("تم تسجيل تقييمك بنجاح!");
      setSelectedTeacher(null); setUserRating(0); setCommentText("");
      qc.invalidateQueries({ queryKey: ["teachers"] });
    },
    onError: (e) => toast.error(e.message || "فشل إرسال التقييم"),
  });

  function submitRating(id) {
    if (user?.role !== "student") return toast.error("التقييم متاح للطلاب فقط");
    if (userRating < 1) return toast.error("اختر عدد النجوم");
    rate.mutate({ id, rating: userRating, comment: commentText });
  }

  const filtered = teachers.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) &&
    (subject === "all" || t.subject === subject)
  );

  return (
    <div className="max-w-6xl mx-auto grid lg:grid-cols-4 gap-5" dir="rtl">
      {/* ===== العمود الجانبي ===== */}
      <div className="space-y-4">
        <div className={`${card} p-4`}>
          <p className="font-extrabold text-slate-800 text-sm mb-3 flex items-center gap-1"><TrendingUp className="w-4 h-4 text-blue-600" /> الأكثر تقييماً هذا الشهر</p>
          <div className="space-y-2">
            {topRated.map((t) => (
              <div key={t.id} className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">{t.name.charAt(0)}</div>
                <div className="flex-1 min-w-0"><p className="text-xs font-bold text-slate-800 truncate">{t.name}</p><p className="text-[10px] text-slate-400">{t.subject || "—"}</p></div>
                <span className="flex items-center gap-0.5 text-[11px] font-extrabold text-amber-500"><Star className="w-3 h-3 fill-current" /> {Number(t.avg_rating).toFixed(1)}</span>
              </div>
            ))}
            {topRated.length === 0 && <p className="text-xs text-slate-400">—</p>}
          </div>
        </div>
        <div className="rounded-2xl bg-blue-600 text-white p-5">
          <p className="font-extrabold">هل تحتاج لمساعدة؟</p>
          <p className="text-xs text-blue-100 mt-1 leading-relaxed">تواصل مع المستشار الأكاديمي لاختيار المعلم الأنسب لك.</p>
          <button onClick={() => navigate("/chat")} className="w-full mt-3 bg-white text-blue-700 font-bold text-xs py-2.5 rounded-xl">تحدّث معنا</button>
        </div>
      </div>

      {/* ===== المحتوى الرئيسي ===== */}
      <div className="lg:col-span-3 space-y-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">نخبة المعلمين</h1>
          <p className="text-sm text-slate-400 mt-1">استكشف وتواصل مع أفضل المعلمين في مختلف التخصصات الأكاديمية.</p>
        </div>

        {/* الفلاتر */}
        <div className={`${card} p-3 flex items-center gap-2 flex-wrap`}>
          <div className="relative flex-1 min-w-[160px]">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث عن معلم أو مادة..." className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-9 pl-3 py-2 text-xs outline-none focus:border-blue-400" />
          </div>
          <select value={subject} onChange={(e) => setSubject(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none">
            <option value="all">كل المواد</option>
            {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {isLoading && <p className="text-sm text-slate-400 text-center py-10">جاري تحميل المعلمين...</p>}
        {error && <p className="text-sm text-rose-500 text-center py-10">{error.message}</p>}
        {!isLoading && filtered.length === 0 && <p className="text-sm text-slate-400 text-center py-10 bg-slate-50 rounded-2xl">لا يوجد معلمون مطابقون.</p>}

        {/* شبكة المعلمين */}
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((teacher) => (
            <div key={teacher.id} className={`${card} p-5 flex flex-col`}>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-2xl font-extrabold text-white">{teacher.name.charAt(0)}</div>
                <h3 className="font-bold text-slate-800 mt-2">{teacher.name}</h3>
                {teacher.subject && <span className="mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{teacher.subject}</span>}
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="font-extrabold text-slate-800 text-sm">{Number(teacher.avg_rating).toFixed(1)}</span>
                  <StarRating rating={Math.round(Number(teacher.avg_rating))} />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">{teacher.ratings_count} تقييم</p>
              </div>

              {selectedTeacher === teacher.id ? (
                <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-center"><StarRating rating={userRating} interactive onChange={setUserRating} /></div>
                  <textarea value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="ملاحظاتك..." rows="2" className="w-full bg-slate-50 rounded-xl p-2 text-xs outline-none resize-none" />
                  <div className="flex gap-2">
                    <button onClick={() => setSelectedTeacher(null)} className="flex-1 py-1.5 rounded-lg bg-slate-50 text-slate-500 text-xs font-bold">إلغاء</button>
                    <button onClick={() => submitRating(teacher.id)} disabled={rate.isPending} className="flex-1 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold disabled:opacity-50">{rate.isPending ? "..." : "إرسال"}</button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2 mt-4">
                  <button onClick={() => navigate(`/chat?teacher=${teacher.id}`)} className="flex-1 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold flex items-center justify-center gap-1"><MessageSquare className="w-3.5 h-3.5" /> مراسلة</button>
                  {user?.role === "student" && (
                    <button onClick={() => { setSelectedTeacher(teacher.id); setUserRating(0); setCommentText(""); }} className="flex-1 py-2 rounded-xl bg-slate-50 text-blue-600 text-xs font-bold flex items-center justify-center gap-1"><ThumbsUp className="w-3.5 h-3.5" /> قيّم</button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TeacherRating;
