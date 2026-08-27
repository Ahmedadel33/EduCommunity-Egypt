import { useEffect, useState } from "react";
import { Clock, Star } from "lucide-react";
import { api } from "../api.js";

// نحوّل الدقائق لصيغة ساعات ودقائق
function fmt(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return (h > 0 ? h + " س " : "") + m + " د";
}

// تقييم بسيط للمدرس حسب مجموع ساعات حضوره (كل ساعة = نجمة، بحد أقصى 5)
function starsFor(mins) {
  const hours = mins / 60;
  const stars = Math.min(5, Math.max(1, Math.round(hours)));
  return stars;
}

// حضور المدرسين وحساب الوقت — أساس التقييم
function Attendance() {
  const [sessions, setSessions] = useState([]);
  const [totals, setTotals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getAttendance()
      .then((data) => {
        setSessions(data.sessions || []);
        setTotals(data.totals || []);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl">
      <div className="flex items-center gap-2 mb-1">
        <Clock className="w-5 h-5 text-blue-600" />
        <h1 className="text-xl font-extrabold text-slate-800">حضور المدرسين وحساب الوقت</h1>
      </div>
      <p className="text-sm text-slate-400 mb-5">وقت دخول كل مدرس بيتسجّل تلقائياً، ومجموع ساعاته بيدخل في تقييمه.</p>

      {loading && <p className="text-sm text-slate-400">جاري التحميل...</p>}

      {/* ملخّص التقييم لكل مدرس */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {totals.map((t) => {
          const stars = starsFor(t.minutes);
          return (
            <div key={t.name} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <p className="font-bold text-slate-800 text-sm">أ. {t.name}</p>
              <p className="text-2xl font-extrabold text-blue-600 mt-1">{fmt(t.minutes)}</p>
              <p className="text-[11px] text-slate-400">إجمالي وقت الحضور</p>
              <div className="flex items-center gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    className={"w-4 h-4 " + (n <= stars ? "text-amber-400 fill-amber-400" : "text-slate-200")}
                  />
                ))}
                <span className="text-[11px] text-slate-400 mr-1">التقييم حسب الحضور</span>
              </div>
            </div>
          );
        })}
        {!loading && totals.length === 0 && (
          <p className="text-sm text-slate-400">لا توجد بيانات حضور بعد.</p>
        )}
      </div>

      {/* جدول الجلسات */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 font-bold text-slate-700 text-sm">سجل جلسات الدخول</div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs">
            <tr>
              <th className="text-right px-4 py-2 font-bold">المدرس</th>
              <th className="text-right px-4 py-2 font-bold">وقت الدخول</th>
              <th className="text-right px-4 py-2 font-bold">وقت الخروج</th>
              <th className="text-right px-4 py-2 font-bold">المدة</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((s) => (
              <tr key={s._id} className="border-t border-slate-50">
                <td className="px-4 py-2.5 font-bold text-slate-700">أ. {s.teacher?.name}</td>
                <td className="px-4 py-2.5 text-slate-500">{new Date(s.loginAt).toLocaleString("ar-EG")}</td>
                <td className="px-4 py-2.5 text-slate-500">
                  {s.logoutAt ? new Date(s.logoutAt).toLocaleString("ar-EG") : <span className="text-green-600 font-bold">متصل الآن</span>}
                </td>
                <td className="px-4 py-2.5 text-slate-700 font-bold">{s.durationMinutes ? fmt(s.durationMinutes) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Attendance;
