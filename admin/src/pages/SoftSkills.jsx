import { useEffect, useState } from "react";
import { Sparkles, Award } from "lucide-react";
import { api } from "../api.js";

// متابعة المهارات الناعمة — الأدمن يشوف التاسكات اللي أنشأها المدرسون (عرض فقط)
function SoftSkills() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getTasks().then((d) => setTasks(d.tasks || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const card = "bg-white rounded-2xl border border-slate-100 shadow-sm";

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="w-5 h-5 text-blue-600" />
        <h1 className="text-xl font-extrabold text-slate-800">متابعة المهارات الناعمة</h1>
      </div>
      <p className="text-sm text-slate-400 mb-5">تاسكات المهارات اللي أنشأها المدرسون للطلاب.</p>

      {loading && <p className="text-sm text-slate-400">جاري التحميل...</p>}
      {!loading && tasks.length === 0 && (
        <div className={`${card} p-8 text-center text-slate-400 text-sm`}>لا توجد تاسكات بعد.</div>
      )}

      <div className="space-y-3">
        {tasks.map((t) => (
          <div key={t._id || t.id} className={`${card} p-4 flex items-center justify-between`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">{t.title}</p>
                <p className="text-[11px] text-slate-400">{t.description || ""} • أنشأها: {t.createdBy?.name || "—"}</p>
              </div>
            </div>
            <span className="text-amber-500 text-xs font-bold">{t.points} نقطة</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SoftSkills;
