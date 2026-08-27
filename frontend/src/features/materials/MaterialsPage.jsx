import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FileText, Video, Image as ImageIcon, Eye, Trash2, BarChart2, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { GRADES, MATERIAL_TYPES, gradeLabel } from "../../lib/grades";
import { resolveFileUrl, subjectName, uploaderId } from "./utils";
import UploadMaterialDialog from "./UploadMaterialDialog";

const TYPE_META = {
  pdf: { icon: FileText, color: "bg-blue-100 text-blue-600" },
  video: { icon: Video, color: "bg-teal-100 text-teal-600" },
  graphic: { icon: ImageIcon, color: "bg-amber-100 text-amber-600" },
};
const ALL = "all";

// شاشة المواد التعليمية — بالالتزام بتصميم الفيجما
function MaterialsPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const canManage = user?.role === "teacher" || user?.role === "admin";
  const isStudent = user?.role === "student";
  const allowedGrades = user?.role === "teacher"
    ? (user.grades?.length ? user.grades : user.grade ? [user.grade] : [])
    : isStudent
      ? [user.grade]
    : GRADES.map((g) => g.value);

  const [searchParams] = useSearchParams(); // البحث الجاي من التوب-بار (?search=)
  const [grade, setGrade] = useState(user?.grade || allowedGrades[0] || "sec-1");
  const [type, setType] = useState(ALL);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [mineOnly, setMineOnly] = useState(false); // المدرس يشوف موادّه هو بكل الحالات

  // لو اتغيّر البحث في الرابط (بحث جديد من التوب-بار) نحدّث خانة البحث
  useEffect(() => {
    const q = searchParams.get("search");
    if (q) { setSearch(q); setMineOnly(false); }
  }, [searchParams]);

  useEffect(() => {
    if (!allowedGrades.includes(grade)) setGrade(allowedGrades[0] || "sec-1");
  }, [allowedGrades, grade]);

  const params = useMemo(() => ({ grade, type: type === ALL ? undefined : type, search: search || undefined, limit: 12 }), [grade, type, search]);

  // لو ضغط "موادي" نجيب مواده بكل الحالات، غير كده نجيب المواد المعتمدة
  const { data } = useQuery({
    queryKey: mineOnly ? ["my-materials"] : ["materials", params],
    queryFn: () => (mineOnly ? api.getMyMaterials() : api.getMaterials(params)),
  });
  const materials = data?.materials || [];

  const del = useMutation({
    mutationFn: (id) => api.deleteMaterial(id),
    onSuccess: () => { toast.success("تم الحذف"); qc.invalidateQueries({ queryKey: ["materials"] }); qc.invalidateQueries({ queryKey: ["my-materials"] }); },
    onError: (e) => toast.error(e.message),
  });

  const card = "bg-white rounded-2xl border border-slate-100 shadow-sm";

  return (
    <div className="max-w-6xl mx-auto grid lg:grid-cols-4 gap-5">
      {/* العمود الجانبي (إحصائيات) — للمدرس/الأدمن */}
      {canManage && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-blue-600 text-white p-5">
            <p className="text-sm font-bold text-blue-100 text-left">إحصائيات الأداء العام</p>
            <div className="flex items-center justify-between mt-3">
              <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center"><Eye className="w-4 h-4" /></div>
              <div className="text-right"><p className="text-xs text-blue-100">إجمالي المواد</p><p className="text-2xl font-extrabold">{materials.length}</p></div>
            </div>
            <div className="flex items-center justify-between mt-3">
              <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center"><BarChart2 className="w-4 h-4" /></div>
              <div className="text-right"><p className="text-xs text-blue-100">متوسط الإتمام</p><p className="text-2xl font-extrabold">78%</p></div>
            </div>
          </div>
          <div className={`${card} p-4`}>
            <p className="font-extrabold text-slate-800 text-sm mb-3 flex items-center justify-end gap-1">أكثر المواد تفاعلاً <TrendingUp className="w-4 h-4 text-blue-600" /></p>
            {[{ n: "الرياضيات", p: 92 }, { n: "اللغة العربية", p: 88 }].map((x) => (
              <div key={x.n} className="mb-2">
                <div className="flex justify-between text-xs font-bold"><span className="text-blue-600">{x.p}%</span><span className="text-slate-600">{x.n}</span></div>
                <div className="h-1.5 rounded-full bg-slate-100 mt-1 overflow-hidden"><div className="h-full bg-blue-600" style={{ width: `${x.p}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* العمود الجانبي للطالب — مطابق للفيجما (توصيات + إحصائيات + هدف الأسبوع) */}
      {!canManage && (
        <div className="space-y-4">
          <div className={`${card} p-4`}>
            <p className="font-extrabold text-slate-800 text-sm mb-3 flex items-center justify-end gap-1">التوصيات لك <span className="text-blue-600">✨</span></p>
            {[{ n: "علم النفس", d: "30 درس · المستوى المتقدم" }, { n: "اللغة الفرنسية", d: "25 درس · مبتدئ" }].map((r) => (
              <div key={r.n} className="mb-2 p-2 rounded-xl bg-slate-50">
                <p className="text-xs font-bold text-slate-800 text-right">{r.n}</p>
                <p className="text-[10px] text-slate-400 text-right">{r.d}</p>
                <button className="text-[10px] text-blue-600 font-bold mt-1">استكشف المادة ←</button>
              </div>
            ))}
          </div>
          <div className="rounded-2xl bg-blue-600 text-white p-4">
            <p className="text-sm font-bold text-blue-100 text-right">إحصائيات سريعة</p>
            <div className="flex items-center justify-between mt-2 text-xs"><span className="font-extrabold">65%</span><span className="text-blue-100">متوسط الإنجاز</span></div>
            <div className="h-1.5 rounded-full bg-white/20 mt-1 overflow-hidden"><div className="h-full bg-white" style={{ width: "65%" }} /></div>
            <div className="grid grid-cols-2 gap-2 mt-3">
              <div className="bg-white/10 rounded-xl p-2 text-center"><p className="text-lg font-extrabold">42</p><p className="text-[10px] text-blue-100">درس مكتمل</p></div>
              <div className="bg-white/10 rounded-xl p-2 text-center"><p className="text-lg font-extrabold">14.5 س</p><p className="text-[10px] text-blue-100">ساعات المذاكرة</p></div>
            </div>
          </div>
          <div className={`${card} p-4`}>
            <p className="font-extrabold text-slate-800 text-sm text-right flex items-center justify-end gap-1">هدف الأسبوع 🏆</p>
            <p className="text-xs text-slate-400 text-right mt-1">باقي لك 3 مواد لإنهاء الخطة الأسبوعية بنجاح.</p>
          </div>
        </div>
      )}

      {/* المحتوى الرئيسي */}
      <div className="lg:col-span-3 space-y-4">
        {/* الهيدر */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="text-right">
            <h1 className="text-xl font-extrabold text-slate-800">المواد التعليمية</h1>
            <p className="text-xs text-slate-400">{materials.length} مادة • {gradeLabel(grade)}</p>
          </div>
          {canManage && <UploadMaterialDialog defaultGrade={grade} allowedGrades={allowedGrades} />}
        </div>

        {/* الفلاتر (تبويبات النوع + الصف + بحث) */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            {[{ v: ALL, l: "الكل" }, ...MATERIAL_TYPES.map((t) => ({ v: t.value, l: t.label }))].map((t) => (
              <button key={t.v} onClick={() => { setType(t.v); setMineOnly(false); }} className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${type === t.v && !mineOnly ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-500 border-slate-200 hover:border-blue-300"}`}>{t.l}</button>
            ))}
            {/* المدرس/الأدمن يقدر يشوف موادّه هو (حتى اللي لسه بانتظار الموافقة) */}
            {canManage && (
              <button onClick={() => setMineOnly(true)} className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${mineOnly ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-500 border-slate-200 hover:border-blue-300"}`}>موادي</button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!isStudent && (
              <select value={grade} onChange={(e) => setGrade(e.target.value)} className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold outline-none">
                {GRADES.filter((g) => allowedGrades.includes(g.value)).map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
              </select>
            )}
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="بحث عن مادة..." className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs outline-none w-36" />
          </div>
        </div>

        {/* كروت المواد */}
        <div className="grid sm:grid-cols-2 gap-4">
          {materials.length === 0 && <p className="text-sm text-slate-400 col-span-2 text-center py-10">لا توجد مواد مطابقة.</p>}
          {materials.map((m) => {
            const meta = TYPE_META[m.type] || TYPE_META.pdf;
            const Icon = meta.icon;
            const mine = user?.role === "admin" || uploaderId(m) === user?.id;
            return (
              <div key={m.id} className={`${card} p-4`}>
                <div className="flex items-start justify-between">
                  <span className="text-slate-300">⋮</span>
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${meta.color}`}><Icon className="w-5 h-5" /></div>
                </div>
                <div className="text-right mt-2">
                  <p className="font-bold text-slate-800">{m.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{gradeLabel(m.grade)} • {subjectName(m)}</p>
                  {/* حالة المادة: مواد المدرس بتستنى موافقة الأدمن */}
                  {m.status === "pending" && (
                    <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">بانتظار موافقة الأدمن</span>
                  )}
                  {mineOnly && m.status === "approved" && (
                    <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-700">معتمدة ✓</span>
                  )}
                </div>
                <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-slate-100">
                  <a href={resolveFileUrl(m.fileUrl)} target="_blank" rel="noreferrer"><button className="px-3 py-1.5 rounded-lg bg-slate-50 text-slate-500 text-xs flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> عرض</button></a>
                  {canManage && mine && (
                    <button onClick={() => del.mutate(m.id)} className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-500 text-xs flex items-center gap-1"><Trash2 className="w-3.5 h-3.5" /> حذف</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default MaterialsPage;
