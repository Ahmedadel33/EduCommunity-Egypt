import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Crown, Trophy, Medal, Award } from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { gradeLabel } from "../lib/grades";

// ===== لوحة الصدارة — مطابقة لتصميم الفيجما (podium + فلاتر + جدول + شريطك) =====
const card = "bg-white rounded-2xl border border-slate-100 shadow-sm";
const TIMES = [{ v: "all", l: "كل الأوقات" }, { v: "month", l: "شهري" }, { v: "week", l: "أسبوعي" }];

function Leaderboard() {
  const { user } = useAuth();
  const [time, setTime] = useState("all");
  const [scope, setScope] = useState("egypt"); // egypt = كل مصر · mine = صفّي

  // النطاق فلتر حقيقي: كل مصر = كل الطلاب · صفّي = طلاب صفي فقط
  const gradeParam = scope === "mine" ? (user?.grade || "sec-1") : undefined;
  const { data } = useQuery({
    queryKey: ["leaderboard", scope, gradeParam],
    queryFn: () => api.getLeaderboard(gradeParam),
  });
  const list = data?.leaderboard || [];

  const top3 = list.slice(0, 3);
  const rest = list.slice(3);
  const myIndex = list.findIndex((s) => s.id === user?.id);
  const myRank = myIndex >= 0 ? myIndex + 1 : "—";
  const nextGap = myIndex > 0 ? (list[myIndex - 1].points - (user?.points || 0)) : 0;

  // ترتيب المنصّة: الفضّي(2) ثم الذهبي(1) ثم البرونزي(3)
  const podiumOrder = [top3[1], top3[0], top3[2]];
  const podiumStyle = [
    { h: "h-24", ring: "ring-slate-300", badge: "bg-slate-300", icon: Medal, place: 2, xpColor: "text-slate-500" },
    { h: "h-32", ring: "ring-amber-400", badge: "bg-amber-400", icon: Crown, place: 1, xpColor: "text-amber-600" },
    { h: "h-20", ring: "ring-orange-400", badge: "bg-orange-400", icon: Award, place: 3, xpColor: "text-orange-600" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-24" dir="rtl">
      {/* الهيدر + الفلاتر */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">لوحة الصدارة</h1>
          <p className="text-sm text-slate-400 mt-1">تنافس مع زملائك وكن من النخبة.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-slate-100 rounded-xl p-1">
            {[{ v: "egypt", l: "كل مصر" }, { v: "mine", l: "صفّي" }].map((s) => (
              <button key={s.v} onClick={() => setScope(s.v)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${scope === s.v ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"}`}>{s.l}</button>
            ))}
          </div>
          <div className="flex bg-slate-100 rounded-xl p-1">
            {TIMES.map((t) => (
              <button key={t.v} onClick={() => setTime(t.v)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${time === t.v ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"}`}>{t.l}</button>
            ))}
          </div>
        </div>
      </div>

      {/* المنصّة (Podium) */}
      {top3.length > 0 && (
        <div className="grid grid-cols-3 gap-3 items-end pt-4">
          {podiumOrder.map((s, i) => {
            if (!s) return <div key={i} />;
            const st = podiumStyle[i];
            const Icon = st.icon;
            const me = s.id === user?.id;
            return (
              <div key={s.id} className="flex flex-col items-center">
                <div className="relative">
                  <div className={`w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-extrabold ring-4 ${st.ring}`}>{s.name?.charAt(0)}</div>
                  <span className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full ${st.badge} text-white flex items-center justify-center text-[11px] font-extrabold border-2 border-white`}>{st.place}</span>
                </div>
                <p className="text-sm font-extrabold text-slate-800 mt-3 text-center truncate max-w-full">{s.name}{me && " (أنت)"}</p>
                <p className={`text-sm font-extrabold ${st.xpColor}`}>{s.points} XP</p>
                <div className={`w-full ${st.h} mt-2 rounded-t-2xl flex items-start justify-center pt-3 ${st.place === 1 ? "bg-amber-400" : st.place === 2 ? "bg-slate-300" : "bg-orange-400"}`}>
                  <Icon className="w-7 h-7 text-white/90" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* الجدول */}
      <div className={`${card} overflow-hidden`}>
        <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-slate-50 text-[11px] font-bold text-slate-400">
          <span className="col-span-2">الترتيب</span>
          <span className="col-span-6">الطالب</span>
          <span className="col-span-2 text-center">الصف</span>
          <span className="col-span-2 text-left">XP</span>
        </div>
        {list.length === 0 && <p className="text-sm text-slate-400 text-center py-10">لا يوجد طلاب.</p>}
        {rest.map((s, i) => {
          const me = s.id === user?.id;
          return (
            <div key={s.id} className={`grid grid-cols-12 gap-2 items-center px-4 py-3 border-t border-slate-50 ${me ? "bg-blue-50/50" : ""}`}>
              <span className="col-span-2 font-extrabold text-slate-500 text-sm">#{i + 4}</span>
              <div className="col-span-6 flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">{s.name?.charAt(0)}</div>
                <span className="font-bold text-slate-800 text-sm truncate">{s.name}{me && <span className="text-[10px] text-blue-600"> (أنت)</span>}</span>
              </div>
              <span className="col-span-2 text-center text-[11px] text-slate-400">{gradeLabel(s.grade)}</span>
              <span className="col-span-2 text-left font-extrabold text-amber-600 text-sm">{s.points}</span>
            </div>
          );
        })}
      </div>

      {/* شريطك الثابت أسفل الشاشة */}
      {myIndex >= 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[min(92%,760px)] bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-600/30 px-4 py-3 flex items-center gap-3 z-20">
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-extrabold text-sm">#{myRank}</div>
          <div className="w-9 h-9 rounded-full bg-white/90 text-blue-700 flex items-center justify-center text-xs font-extrabold">{user?.name?.charAt(0)}</div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm truncate">أنت ({user?.name})</p>
            <p className="text-[11px] text-blue-100">{nextGap > 0 ? `تحتاج ${nextGap} XP للمركز التالي!` : "أنت في الصدارة! 🎉"}</p>
          </div>
          <span className="font-extrabold text-sm whitespace-nowrap">{(user?.points || 0).toLocaleString("ar")} XP</span>
        </div>
      )}
    </div>
  );
}

export default Leaderboard;
