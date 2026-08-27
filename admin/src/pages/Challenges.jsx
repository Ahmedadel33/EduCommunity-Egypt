import { useEffect, useState } from "react";
import { Trophy, Star } from "lucide-react";
import { api } from "../api.js";

// متابعة التحديات — الأدمن يشوف كل التحديات النشطة (عرض فقط)
function Challenges() {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getChallenges().then((d) => setChallenges(d.challenges || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const card = "bg-white rounded-2xl border border-slate-100 shadow-sm";

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-2 mb-1">
        <Trophy className="w-5 h-5 text-blue-600" />
        <h1 className="text-xl font-extrabold text-slate-800">متابعة التحديات</h1>
      </div>
      <p className="text-sm text-slate-400 mb-5">التحديات النشطة على المنصة ونقاطها.</p>

      {loading && <p className="text-sm text-slate-400">جاري التحميل...</p>}
      {!loading && challenges.length === 0 && (
        <div className={`${card} p-8 text-center text-slate-400 text-sm`}>لا توجد تحديات نشطة.</div>
      )}

      <div className="grid sm:grid-cols-2 gap-3">
        {challenges.map((c) => (
          <div key={c.id || c._id} className={`${card} p-4`}>
            <div className="flex items-start justify-between">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-700">{c.subject || "عام"}</span>
              <span className="text-amber-500 text-xs font-bold flex items-center gap-1"><Star className="w-3.5 h-3.5" /> {c.points} نقطة</span>
            </div>
            <p className="font-bold text-slate-800 text-sm mt-2">{c.title}</p>
            <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{c.description}</p>
            <p className="text-[10px] text-slate-400 mt-2">ينتهي: {c.end_date ? new Date(c.end_date).toLocaleDateString("ar-EG") : "—"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Challenges;
