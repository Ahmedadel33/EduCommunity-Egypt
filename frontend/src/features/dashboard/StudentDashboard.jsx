import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Zap, Award, Trophy, BarChart3, Video, Gift, Sparkles as SparkIcon } from "lucide-react";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { gradeLabel } from "../../lib/grades";
import OnDutyWidget from "../shifts/OnDutyWidget";

// داشبورد الطالب — بالالتزام بتصميم الفيجما (hero أزرق + كروت + مواد + دروس + widgets)
function StudentDashboard() {
  const { user } = useAuth();
  const grade = user?.grade || "sec-1";

  const { data: mats } = useQuery({ queryKey: ["materials", { grade, limit: 3 }], queryFn: () => api.getMaterials({ grade, limit: 3 }) });
  const { data: less } = useQuery({ queryKey: ["lessons", grade], queryFn: () => api.getLessons(grade) });
  const { data: tks } = useQuery({ queryKey: ["tasks"], queryFn: () => api.getTasks() });
  const { data: rws } = useQuery({ queryKey: ["rewards"], queryFn: () => api.getRewards() });
  const { data: lb } = useQuery({ queryKey: ["leaderboard", grade], queryFn: () => api.getLeaderboard(grade) });

  const courses = mats?.materials || [];
  const lessons = less?.lessons || [];
  const tasks = tks?.tasks || [];
  const rewards = rws?.rewards || [];
  const points = user?.points || 0;
  const badges = user?.badges || [];
  const board = lb?.leaderboard || [];
  const rank = board.findIndex((s) => s.id === user?.id) + 1 || "—";

  const card = "bg-white rounded-2xl border border-slate-100 shadow-sm";

  return (
    <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-5">
      {/* العمود الرئيسي (يمين) */}
      <div className="lg:col-span-2 space-y-5">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-2xl bg-blue-600 text-white p-6">
          <SparkIcon className="absolute left-6 top-6 w-24 h-24 text-white/10" />
          <h1 className="text-2xl font-extrabold">أهلاً من جديد، {user?.name?.split(" ")[0]}! 👋</h1>
          <p className="text-sm text-blue-100 mt-2 max-w-sm">أنت في المركز {rank === "—" ? "" : "#" + rank} على مستوى صفك. مستعد لتحدي اليوم؟</p>
          <Link to="/challenges"><button className="mt-4 bg-white text-blue-700 font-bold text-sm px-5 py-2.5 rounded-xl flex items-center gap-2"><Zap className="w-4 h-4" /> تحدي اليوم</button></Link>
        </div>

        {/* كروت الإحصائيات */}
        <div className="grid grid-cols-3 gap-4">
          <div className={`${card} p-4`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">شاراتي</span>
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center"><Award className="w-4 h-4" /></div>
            </div>
            <p className="text-xl font-extrabold mt-2">{badges.length}</p>
          </div>
          <div className={`${card} p-4`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">ترتيبي</span>
              <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center"><BarChart3 className="w-4 h-4" /></div>
            </div>
            <p className="text-xl font-extrabold mt-2">#{rank}</p>
          </div>
          <div className={`${card} p-4`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">نقاطي / XP</span>
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center"><Trophy className="w-4 h-4" /></div>
            </div>
            <p className="text-lg font-extrabold mt-2">{points} <span className="text-xs text-slate-400">/ 2000</span></p>
            <div className="h-1.5 rounded-full bg-slate-100 mt-2 overflow-hidden"><div className="h-full bg-blue-600" style={{ width: `${Math.min((points / 2000) * 100, 100)}%` }} /></div>
          </div>
        </div>

        {/* موادي الدراسية */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-extrabold text-slate-800">موادي الدراسية</h2>
            <Link to="/materials" className="text-sm text-blue-600 font-bold">عرض الكل</Link>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {courses.length === 0 && <p className="text-sm text-slate-400">لا توجد مواد بعد.</p>}
            {courses.map((m, i) => {
              const prog = 40 + i * 20;
              return (
                <div key={m.id} className={`${card} overflow-hidden`}>
                  <div className="h-24 bg-gradient-to-br from-blue-500 to-teal-400" />
                  <div className="p-3">
                    <p className="font-bold text-sm text-slate-800 truncate">{m.title}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{typeof m.subject === "object" ? m.subject?.name : ""}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
                      <span>{prog}%</span><span>تقدم المادة</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-100 mt-1 overflow-hidden"><div className="h-full bg-blue-600" style={{ width: `${prog}%` }} /></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* الدروس القادمة */}
        <div className={`${card} p-5`}>
          <h2 className="font-extrabold text-slate-800 mb-3">الدروس القادمة أونلاين</h2>
          <div className="space-y-2">
            {lessons.length === 0 && <p className="text-sm text-slate-400">لا توجد دروس قادمة.</p>}
            {lessons.slice(0, 3).map((l) => (
              <div key={l.id} className="flex items-center justify-between p-3 rounded-xl bg-[#F5F7FF]">
                <div>
                  <p className="font-bold text-sm text-slate-800">{l.title} - أ. {l.teacher?.name}</p>
                  <p className="text-[11px] text-slate-400">{l.subject} • {new Date(l.startsAt).toLocaleString("ar-EG")}</p>
                </div>
                <a href={l.meetingUrl} target="_blank" rel="noreferrer"><button className="bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5"><Video className="w-3.5 h-3.5" /> انضمام الآن</button></a>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* العمود الجانبي (يسار) */}
      <div className="space-y-5">
        {/* المدرس المناوب الآن — الطالب يسأل أي وقت */}
        <OnDutyWidget />

        {/* مهام المهارات */}
        <div className={`${card} p-5`}>
          <h3 className="font-extrabold text-slate-800 mb-3">مهام المهارات</h3>
          <div className="space-y-2">
            {tasks.slice(0, 3).map((t) => (
              <Link key={t.id} to="/soft-skills" className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 text-sm">
                <span className="w-4 h-4 rounded border border-slate-300 shrink-0" />
                <span className="truncate">{t.title}</span>
              </Link>
            ))}
            {tasks.length === 0 && <p className="text-sm text-slate-400">لا توجد مهام.</p>}
          </div>
          <Link to="/soft-skills"><button className="w-full mt-3 py-2 bg-[#EEF2FF] text-blue-700 text-xs font-bold rounded-xl">+ إضافة مهمة خاصة</button></Link>
        </div>

        {/* مكافآتي */}
        <div className={`${card} p-5`}>
          <h3 className="font-extrabold text-slate-800 mb-3">مكافآتي</h3>
          {rewards.length === 0 && <p className="text-sm text-slate-400">لا توجد مكافآت بعد.</p>}
          {rewards.slice(0, 3).map((r) => (
            <div key={r.id} className="flex items-center gap-2 p-2 rounded-lg bg-amber-50 text-sm mb-1.5">
              <Gift className="w-4 h-4 text-amber-500 shrink-0" /> {r.title}
            </div>
          ))}
        </div>

        {/* شات الصف */}
        <div className={`${card} p-5`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-extrabold text-slate-800">شات الصف ({gradeLabel(grade)})</h3>
            <span className="w-2 h-2 rounded-full bg-green-500" />
          </div>
          <Link to="/chat"><button className="w-full py-2 bg-blue-600 text-white text-xs font-bold rounded-xl">افتح شات الصف</button></Link>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
