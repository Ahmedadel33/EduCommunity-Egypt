import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Star, ClipboardCheck, Calendar, FileText } from "lucide-react";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import MyAttendanceCard from "../shifts/MyAttendanceCard";

// كارت إحصائية بشكل الفيجما
function Stat({ icon: Icon, label, value, color, badge, badgeColor }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
      <div className="flex items-center justify-between">
        {badge ? <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeColor}`}>{badge}</span> : <span />}
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}><Icon className="w-4 h-4" /></div>
      </div>
      <p className="text-2xl font-extrabold mt-3 text-slate-800">{value}</p>
      <p className="text-xs text-slate-400 font-bold mt-1">{label}</p>
    </div>
  );
}

// أيام الأسبوع لرسم التفاعل (بيانات توضيحية)
const WEEK = [
  { d: "السبت", v: 35 }, { d: "الأحد", v: 55 }, { d: "الاثنين", v: 70 },
  { d: "الثلاثاء", v: 40 }, { d: "الأربعاء", v: 85 }, { d: "الخميس", v: 60 }, { d: "الجمعة", v: 90 },
];

function TeacherDashboard() {
  const { user } = useAuth();
  const { data: mats } = useQuery({ queryKey: ["materials", { limit: 100 }], queryFn: () => api.getMaterials({ limit: 100 }) });
  const { data: less } = useQuery({ queryKey: ["lessons"], queryFn: () => api.getLessons() });
  const { data: subs } = useQuery({ queryKey: ["all-submissions"], queryFn: () => api.getTaskSubmissions() });
  const { data: teachers } = useQuery({ queryKey: ["teachers"], queryFn: () => api.getTeachers() });

  const myMaterials = (mats?.materials || []).filter((m) => (typeof m.uploadedBy === "object" ? m.uploadedBy?.id : m.uploadedBy) === user?.id);
  const lessons = less?.lessons || [];
  const submissions = subs?.submissions || [];
  const pending = submissions.filter((s) => s.grade == null);
  const me = (teachers?.teachers || []).find((t) => t.id === user?.id);
  const rating = me ? Number(me.avg_rating).toFixed(1) : "—";

  const card = "bg-white rounded-2xl border border-slate-100 shadow-sm";

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-extrabold text-blue-600">نظرة عامة — المدرس</h1>
        <p className="text-xs text-slate-400 mt-1">أهلاً د. {user?.name}</p>
      </div>

      {/* الكروت */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat icon={Star} label="متوسط تقييمي" value={rating} color="bg-blue-50 text-blue-600" />
        <Stat icon={ClipboardCheck} label="تسليمات للتصحيح" value={pending.length} color="bg-amber-100 text-amber-600" badge={pending.length ? "عاجل" : ""} badgeColor="bg-rose-100 text-rose-600" />
        <Stat icon={Calendar} label="دروس قادمة" value={lessons.length} color="bg-teal-100 text-teal-600" />
        <Stat icon={FileText} label="مواد رفعتها" value={myMaterials.length} color="bg-blue-50 text-blue-600" />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="space-y-5">
          {/* وقت حضوري + تسجيل خروج (الأدمن بيبني عليه التقييم) */}
          <MyAttendanceCard />

          {/* جدول اليوم */}
          <div className={`${card} p-5`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-extrabold text-slate-800">جدول اليوم</h2>
              <Link to="/lessons" className="text-xs text-blue-600 font-bold">الكل</Link>
            </div>
            <div className="space-y-2">
              {lessons.length === 0 && <p className="text-sm text-slate-400">لا توجد دروس.</p>}
              {lessons.slice(0, 4).map((l) => (
                <div key={l.id} className="p-3 rounded-xl bg-[#F5F7FF]">
                  <p className="font-bold text-sm text-slate-800">{l.title}</p>
                  <p className="text-[11px] text-slate-400">{new Date(l.startsAt).toLocaleString("ar-EG")}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* رسم التفاعل (أعمدة بسيطة) */}
        <div className={`${card} p-5 lg:col-span-2`}>
          <h2 className="font-extrabold text-slate-800 mb-4">تفاعل الطلاب — آخر 7 أيام</h2>
          <div className="flex items-end justify-between gap-2 h-48">
            {WEEK.map((w) => (
              <div key={w.d} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full rounded-t-lg bg-blue-500" style={{ height: `${w.v}%` }} />
                <span className="text-[10px] text-slate-400">{w.d}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* الأنشطة / التسليمات */}
      <div className={`${card} p-5`}>
        <h2 className="font-extrabold text-slate-800 mb-1">الأنشطة/التسليمات</h2>
        <p className="text-xs text-slate-400 mb-4">بانتظار التقييم لمهارات الطلاب الناعمة</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-400 text-xs">
                <th className="text-right font-bold py-2">اسم الطالب</th>
                <th className="text-right font-bold py-2">المهارة</th>
                <th className="text-right font-bold py-2">تاريخ التسليم</th>
                <th className="text-right font-bold py-2">الحالة</th>
                <th className="text-right font-bold py-2">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {submissions.length === 0 && <tr><td colSpan="5" className="py-4 text-slate-400">لا توجد تسليمات بعد.</td></tr>}
              {submissions.slice(0, 5).map((s) => (
                <tr key={s.id} className="border-t border-slate-100">
                  <td className="py-3 font-bold text-slate-700">{s.student?.name}</td>
                  <td className="py-3 text-slate-500">{s.task?.title}</td>
                  <td className="py-3 text-slate-400 text-xs">{new Date(s.createdAt).toLocaleDateString("ar-EG")}</td>
                  <td className="py-3">
                    {s.grade == null
                      ? <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">قيد المراجعة</span>
                      : <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">{s.grade}</span>}
                  </td>
                  <td className="py-3">
                    <Link to="/soft-skills"><button className="bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg">تقييم الآن</button></Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default TeacherDashboard;
