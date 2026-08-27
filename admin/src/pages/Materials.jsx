import { useEffect, useState } from "react";
import { FileCheck2, Check, Trash2, FileText, Upload, Plus, X, Search, ExternalLink } from "lucide-react";
import { api } from "../api.js";

const GRADES = [
  { value: "sec-1", label: "الأول الثانوي" },
  { value: "sec-2", label: "الثاني الثانوي" },
  { value: "sec-3", label: "الثالث الثانوي" },
];
const TYPES = [
  { value: "pdf", label: "ملف PDF" },
  { value: "video", label: "فيديو" },
  { value: "graphic", label: "جرافيك توضيحي" },
];
const TABS = [
  { value: "all", label: "الكل" },
  { value: "approved", label: "المعتمدة" },
  { value: "pending", label: "بانتظار الموافقة" },
];

// إدارة المواد — الأدمن يشوف كل المحتوى المرفوع (قبل وبعد الموافقة)،
// يبحث ويفلتر بالمادة أو المدرس، يوافق/يرفض، ويرفع مواد الوزارة.
function Materials() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  // فلاتر العرض
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [teacherFilter, setTeacherFilter] = useState("");

  // قوائم الفلترة
  const [allSubjects, setAllSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);

  // نموذج رفع مادة الوزارة
  const [showUpload, setShowUpload] = useState(false);
  const [title, setTitle] = useState("");
  const [grade, setGrade] = useState("sec-1");
  const [subject, setSubject] = useState("");
  const [type, setType] = useState("pdf");
  const [fileUrl, setFileUrl] = useState("");
  const [file, setFile] = useState(null);
  const [uploadSubjects, setUploadSubjects] = useState([]);

  // نجيب كل المواد حسب الفلاتر
  async function load() {
    setLoading(true);
    try {
      const data = await api.getAllMaterials({ status, search, subject: subjectFilter, teacher: teacherFilter });
      setMaterials(data.materials || []);
    } catch (e) {
      setMsg(e.message);
    }
    setLoading(false);
  }

  // نعيد التحميل مع كل تغيير في الفلاتر (مع debounce بسيط للبحث)
  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [status, search, subjectFilter, teacherFilter]);

  // قوائم الفلترة: كل المواد الدراسية + المدرسون
  useEffect(() => {
    api.getSubjects().then((d) => setAllSubjects(d.subjects || [])).catch(() => {});
    api.getUsers().then((d) => setTeachers((d.users || []).filter((u) => u.role === "teacher"))).catch(() => {});
  }, []);

  // مواد الصف المختار (لنموذج الرفع)
  useEffect(() => {
    if (!showUpload) return;
    api.getSubjects(grade).then((d) => setUploadSubjects(d.subjects || [])).catch(() => {});
  }, [grade, showUpload]);

  async function approve(id) {
    await api.approveMaterial(id);
    setMsg("تمت الموافقة على المادة ✅");
    load();
  }
  async function reject(id) {
    await api.deleteMaterial(id);
    setMsg("تم حذف المادة");
    load();
  }

  async function uploadMinistry(e) {
    e.preventDefault();
    setMsg("");
    if (!title.trim() || !subject) { setMsg("اكتب العنوان واختر المادة"); return; }
    if (!file && !fileUrl.trim()) { setMsg("ارفع ملفاً أو أدخل رابطاً"); return; }
    try {
      const fd = new FormData();
      fd.append("title", title.trim());
      fd.append("subject", subject);
      fd.append("grade", grade);
      fd.append("type", type);
      if (file) fd.append("file", file); else fd.append("fileUrl", fileUrl.trim());
      const res = await api.createMaterial(fd);
      setMsg(res.message || "تم رفع مادة الوزارة (معتمدة فوراً) ✅");
      setTitle(""); setSubject(""); setFileUrl(""); setFile(null); setShowUpload(false);
      load();
    } catch (err) { setMsg(err.message); }
  }

  const card = "bg-white rounded-2xl border border-slate-100 shadow-sm";
  const input = "w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500";

  return (
    <div className="max-w-5xl">
      <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
        <div>
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl font-extrabold text-slate-800">إدارة المواد التعليمية</h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">شوف كل المحتوى المرفوع (قبل وبعد الموافقة) · ابحث وفلتر بالمادة أو المدرس · وارفع مواد الوزارة.</p>
        </div>
        <button onClick={() => setShowUpload((s) => !s)} className="bg-blue-600 text-white text-sm font-bold px-4 py-2.5 rounded-xl flex items-center gap-2">
          {showUpload ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />} {showUpload ? "إغلاق" : "رفع مادة وزارة"}
        </button>
      </div>

      {msg && <p className="text-sm bg-blue-50 text-blue-700 rounded-lg p-2 mb-3">{msg}</p>}

      {/* نموذج رفع مادة الوزارة */}
      {showUpload && (
        <form onSubmit={uploadMinistry} className={`${card} p-4 mb-4`}>
          <p className="font-extrabold text-slate-800 mb-3 flex items-center gap-2"><Upload className="w-4 h-4 text-blue-600" /> رفع مادة الوزارة الرسمية</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-500 mb-1">العنوان</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} className={input} placeholder="مثال: منهج الفيزياء الرسمي" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">الصف</label>
              <select value={grade} onChange={(e) => { setGrade(e.target.value); setSubject(""); }} className={input}>
                {GRADES.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">المادة</label>
              <select value={subject} onChange={(e) => setSubject(e.target.value)} className={input}>
                <option value="">{uploadSubjects.length ? "اختر المادة" : "لا توجد مواد لهذا الصف"}</option>
                {uploadSubjects.map((s) => <option key={s.id || s._id} value={s.id || s._id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">النوع</label>
              <select value={type} onChange={(e) => setType(e.target.value)} className={input}>
                {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">رفع ملف</label>
              <input type="file" accept=".pdf,image/*,video/mp4,video/webm" onChange={(e) => setFile(e.target.files?.[0] || null)} className={input} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-500 mb-1">أو رابط خارجي</label>
              <input value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} className={input} placeholder="https://..." />
            </div>
          </div>
          <button className="mt-4 bg-teal-500 text-white text-sm font-bold px-5 py-2.5 rounded-xl flex items-center gap-2"><Upload className="w-4 h-4" /> رفع (معتمدة فوراً)</button>
        </form>
      )}

      {/* شريط الفلاتر */}
      <div className={`${card} p-3 mb-4 flex flex-wrap items-center gap-2`}>
        {/* تبويبات الحالة */}
        <div className="flex bg-slate-50 rounded-xl p-1">
          {TABS.map((t) => (
            <button key={t.value} onClick={() => setStatus(t.value)}
              className={"px-3 py-1.5 text-xs font-bold rounded-lg " + (status === t.value ? "bg-blue-600 text-white" : "text-slate-500")}>
              {t.label}
            </button>
          ))}
        </div>
        {/* بحث */}
        <div className="relative flex-1 min-w-[160px]">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="بحث بالعنوان..." className={input + " pr-9"} />
        </div>
        {/* فلترة بالمادة */}
        <select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)} className="border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none">
          <option value="">كل المواد</option>
          {allSubjects.map((s) => <option key={s.id || s._id} value={s.id || s._id}>{s.name} ({s.grade})</option>)}
        </select>
        {/* فلترة بالمدرس */}
        <select value={teacherFilter} onChange={(e) => setTeacherFilter(e.target.value)} className="border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none">
          <option value="">كل المدرسين</option>
          {teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>

      {/* النتائج */}
      {loading && <p className="text-sm text-slate-400">جاري التحميل...</p>}
      {!loading && materials.length === 0 && (
        <div className={`${card} p-8 text-center text-slate-400 text-sm`}>لا توجد مواد مطابقة.</div>
      )}
      <p className="text-xs text-slate-400 mb-2">{materials.length} مادة</p>

      <div className="space-y-3">
        {materials.map((m) => (
          <div key={m._id || m.id} className={`${card} p-4 flex items-center justify-between gap-3`}>
            <div className="flex items-center gap-3 min-w-0">
              <div className={"w-10 h-10 rounded-xl flex items-center justify-center " + (m.source === "ministry" ? "bg-blue-100 text-blue-600" : "bg-amber-100 text-amber-600")}>
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-slate-800 text-sm truncate">{m.title}</p>
                  {m.status === "pending"
                    ? <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">بانتظار الموافقة</span>
                    : <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-700">معتمدة</span>}
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">{m.source === "ministry" ? "وزارة" : "مدرس"}</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {m.subject?.name || "—"} • {m.type} • {m.uploadedBy?.name ? "رفعها: " + m.uploadedBy.name : "الوزارة"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {m.fileUrl && (
                <a href={m.fileUrl.startsWith("http") ? m.fileUrl : "http://localhost:5000" + m.fileUrl} target="_blank" rel="noreferrer"
                  className="text-slate-500 text-xs font-bold px-2 py-2 rounded-lg bg-slate-50 flex items-center gap-1"><ExternalLink className="w-3.5 h-3.5" /> عرض</a>
              )}
              {m.status === "pending" && (
                <button onClick={() => approve(m._id || m.id)} className="bg-teal-500 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1"><Check className="w-4 h-4" /> موافقة</button>
              )}
              <button onClick={() => reject(m._id || m.id)} className="bg-red-50 text-red-600 text-xs font-bold px-2 py-2 rounded-xl"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Materials;
