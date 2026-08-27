import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { GRADES, MATERIAL_TYPES } from "../../lib/grades";

// نافذة إضافة مادة تعليمية — بالالتزام بتصميم الفيجما
const UploadMaterialDialog = ({ defaultGrade }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [grade, setGrade] = useState(defaultGrade || "sec-1");
  const [subject, setSubject] = useState("");
  const [type, setType] = useState("pdf");
  const [isNextGrade, setIsNextGrade] = useState(false);
  const [file, setFile] = useState(null);
  const [fileUrl, setFileUrl] = useState("");

  // مواد الصف المختار — بتتجاب بس لما النافذة تكون مفتوحة
  const { data: subjectsData } = useQuery({
    queryKey: ["subjects", grade],
    queryFn: () => api.getSubjects(grade),
    enabled: open,
  });
  // المدرس يرفع في تخصّصه بس — فنعرض له مادته فقط من قائمة الصف.
  // الأدمن بيرفع مواد الوزارة في أي مادة.
  const allSubjects = subjectsData?.subjects || [];
  const subjects = user?.role === "teacher"
    ? allSubjects.filter((s) => s.name === user.subject)
    : allSubjects;

  // تفريغ الفورم بعد النجاح
  const reset = () => {
    setTitle("");
    setDescription("");
    setSubject("");
    setType("pdf");
    setIsNextGrade(false);
    setFile(null);
    setFileUrl("");
  };

  const mutation = useMutation({
    mutationFn: (formData) => api.createMaterial(formData),
    onSuccess: (data) => {
      // السيرفر بيقولنا: مادة الأدمن معتمدة فوراً، ومادة المدرس بانتظار الموافقة
      toast.success(data?.message || "تمت إضافة المادة بنجاح");
      queryClient.invalidateQueries({ queryKey: ["materials"] });
      queryClient.invalidateQueries({ queryKey: ["my-materials"] });
      reset();
      setOpen(false);
    },
    onError: (err) => toast.error(err.message || "فشل رفع المادة"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !subject || !grade) {
      toast.error("برجاء ملء العنوان والصف والمادة");
      return;
    }
    if (!file && !fileUrl) {
      toast.error("ارفع ملفاً أو أدخل رابطاً");
      return;
    }
    const fd = new FormData();
    fd.append("title", title);
    fd.append("description", description);
    fd.append("subject", subject);
    fd.append("grade", grade);
    fd.append("type", type);
    fd.append("isNextGrade", String(isNextGrade));
    if (file) fd.append("file", file);
    else if (fileUrl) fd.append("fileUrl", fileUrl);
    mutation.mutate(fd);
  };

  const input = "w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500";
  const label = "block text-xs font-bold text-slate-600 mb-1.5 text-right";

  return (
    <>
      {/* زرار فتح النافذة */}
      <button
        onClick={() => setOpen(true)}
        className="bg-blue-600 text-white rounded-xl text-xs font-bold px-4 py-2.5 flex items-center gap-2"
      >
        <Plus className="w-4 h-4" /> إضافة مادة
      </button>

      {open && (
        // الخلفية — الضغط عليها بيقفل النافذة
        <div onClick={() => setOpen(false)} className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          {/* الكارت — stopPropagation عشان الضغط جواه ميقفلش */}
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-5">
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
              <h2 className="font-extrabold text-slate-800">إضافة مادة تعليمية</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className={label}>العنوان</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثال: ملخص قوانين نيوتن" className={input} />
              </div>

              <div>
                <label className={label}>الوصف (اختياري)</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className={input} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={label}>الصف</label>
                  {/* تغيير الصف بيصفّر المادة عشان المواد بتختلف من صف لصف */}
                  <select
                    value={grade}
                    onChange={(e) => {
                      setGrade(e.target.value);
                      setSubject("");
                    }}
                    className={input}
                  >
                    {GRADES.map((g) => (
                      <option key={g.value} value={g.value}>{g.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={label}>المادة</label>
                  <select value={subject} onChange={(e) => setSubject(e.target.value)} disabled={!subjects.length} className={`${input} disabled:bg-slate-50 disabled:text-slate-400`}>
                    <option value="">{subjects.length ? "اختر المادة" : "لا توجد مواد لهذا الصف"}</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className={label}>نوع المحتوى</label>
                <select value={type} onChange={(e) => setType(e.target.value)} className={input}>
                  {MATERIAL_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={label}>رفع ملف (PDF / صورة / فيديو)</label>
                <input
                  type="file"
                  accept=".pdf,image/*,video/mp4,video/webm"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className={`${input} file:mr-2 file:rounded-lg file:border-0 file:bg-[#EEF2FF] file:px-3 file:py-1 file:text-xs file:font-bold file:text-blue-700`}
                />
              </div>

              <div>
                <label className={label}>أو رابط خارجي (مثل رابط فيديو يوتيوب embed)</label>
                <input value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} placeholder="https://..." className={input} />
              </div>

              {/* مادة الصف التالي — checkbox عادي بدل الـ Switch */}
              <label className="flex items-center justify-between rounded-xl bg-[#F5F7FF] p-3 cursor-pointer">
                <input type="checkbox" checked={isNextGrade} onChange={(e) => setIsNextGrade(e.target.checked)} className="w-4 h-4 accent-blue-600" />
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-600">مادة الصف التالي</p>
                  <p className="text-[11px] text-slate-400">للتحضير في الإجازة</p>
                </div>
              </label>

              <button
                type="submit"
                disabled={mutation.isPending}
                className="w-full bg-blue-600 text-white rounded-xl text-xs font-bold py-3 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                {mutation.isPending ? "جارٍ الرفع..." : "رفع المادة"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default UploadMaterialDialog;
