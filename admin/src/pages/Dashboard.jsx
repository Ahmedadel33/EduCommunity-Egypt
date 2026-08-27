import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, GraduationCap, FileCheck2, CalendarClock, BookOpen, UserPlus, Clock, ArrowLeft } from "lucide-react";
import { api } from "../api.js";

// أسماء الشهور بالعربي (نستخدمها في رسم النمو)
const MONTHS = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

// ألوان أعمدة "أكثر المواد محتوى"
const BAR_COLORS = ["bg-blue-600", "bg-teal-500", "bg-amber-500", "bg-rose-500", "bg-purple-500"];

// لوحة تحكم الأدمن — نظرة تحليلية (كل الأرقام محسوبة من بيانات حقيقية)
function Dashboard() {
  const [users, setUsers] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [pending, setPending] = useState([]);
  const [shifts, setShifts] = useState([]);

  useEffect(() => {
    api.getUsers().then((d) => setUsers(d.users || [])).catch(() => {});
    api.getMaterials().then((d) => setMaterials(d.materials || [])).catch(() => {});
    api.getPendingMaterials().then((d) => setPending(d.materials || [])).catch(() => {});
    api.getShifts().then((d) => setShifts(d.shifts || [])).catch(() => {});
  }, []);

  // ===== الأرقام الأساسية =====
  const students = users.filter((u) => u.role === "student");
  const teachers = users.filter((u) => u.role === "teacher");

  const now = new Date();
  const onDuty = shifts.filter((s) => new Date(s.startsAt) <= now && new Date(s.endsAt) >= now);

  // ===== نمو المستخدمين: نعدّ التسجيلات في آخر 6 شهور =====
  const growth = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const count = users.filter((u) => {
      const c = new Date(u.created_at);
      return c.getFullYear() === d.getFullYear() && c.getMonth() === d.getMonth();
    }).length;
    growth.push({ label: MONTHS[d.getMonth()], count });
  }
  const maxGrowth = Math.max(...growth.map((g) => g.count), 1);

  // ===== أكثر المواد محتوى: نعدّ المواد التعليمية لكل مادة دراسية =====
  const subjectCounts = {};
  materials.forEach((m) => {
    const name = m.subject?.name || "غير محدّد";
    subjectCounts[name] = (subjectCounts[name] || 0) + 1;
  });
  const topSubjects = Object.entries(subjectCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  const maxSubject = Math.max(...topSubjects.map((s) => s.count), 1);

  // ===== أحدث التسجيلات: آخر 5 مستخدمين =====
  const recent = [...users]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  // ===== سجل النشاط: بنجمّع أحداث حقيقية (تسجيلات + مواد مرفوعة) =====
  const activity = [
    ...users.map((u) => ({
      text: `انضم ${u.name} كـ${u.role === "teacher" ? "مدرس" : u.role === "admin" ? "أدمن" : "طالب"}`,
      at: u.created_at,
      icon: UserPlus,
      color: "bg-teal-100 text-teal-600",
    })),
    ...materials.map((m) => ({
      text: `تم اعتماد مادة "${m.title}"`,
      at: m.createdAt,
      icon: BookOpen,
      color: "bg-blue-100 text-blue-600",
    })),
    ...pending.map((m) => ({
      text: `مادة "${m.title}" بانتظار الموافقة`,
      at: m.createdAt,
      icon: FileCheck2,
      color: "bg-amber-100 text-amber-600",
    })),
  ]
    .filter((a) => a.at)
    .sort((a, b) => new Date(b.at) - new Date(a.at))
    .slice(0, 6);

  const card = "bg-white rounded-2xl border border-slate-100 shadow-sm";

  const kpis = [
    { label: "الطلاب", value: students.length, icon: GraduationCap, color: "bg-teal-100 text-teal-600" },
    { label: "المدرسون", value: teachers.length, icon: Users, color: "bg-blue-100 text-blue-600" },
    { label: "مواد بانتظار الموافقة", value: pending.length, icon: FileCheck2, color: "bg-amber-100 text-amber-600", to: "/materials" },
    { label: "مدرسون مناوبون الآن", value: onDuty.length, icon: CalendarClock, color: "bg-purple-100 text-purple-600", to: "/shifts" },
  ];

  return (
    <div className="max-w-6xl">
      {/* الهيدر */}
      <div className="flex items-start justify-between flex-wrap gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">نظرة تحليلية</h1>
          <p className="text-sm text-slate-400">كل الأرقام محسوبة من قاعدة البيانات مباشرة.</p>
        </div>
        <span className="text-[11px] text-slate-400 font-bold flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> متصل بالخادم
        </span>
      </div>

      {/* كروت الأرقام */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {kpis.map((c) => {
          const Icon = c.icon;
          const inner = (
            <div className={`${card} p-4 h-full`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">{c.label}</span>
                <div className={"w-8 h-8 rounded-lg flex items-center justify-center " + c.color}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-extrabold mt-2 text-slate-800">{c.value}</p>
            </div>
          );
          return c.to ? <Link key={c.label} to={c.to}>{inner}</Link> : <div key={c.label}>{inner}</div>;
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-5 mb-5">
        {/* نمو المستخدمين — أعمدة بسيطة */}
        <div className={`${card} p-5 lg:col-span-2`}>
          <h2 className="font-extrabold text-slate-800">نمو المستخدمين</h2>
          <p className="text-xs text-slate-400 mb-4">عدد التسجيلات في آخر 6 شهور</p>
          <div className="flex items-end justify-between gap-3 h-44">
            {growth.map((g) => (
              <div key={g.label} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] font-bold text-slate-500">{g.count}</span>
                <div
                  className="w-full rounded-t-lg bg-blue-600"
                  style={{ height: `${(g.count / maxGrowth) * 100}%`, minHeight: g.count ? "4px" : "2px", opacity: g.count ? 1 : 0.15 }}
                />
                <span className="text-[10px] text-slate-400">{g.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* أكثر المواد محتوى */}
        <div className={`${card} p-5`}>
          <h2 className="font-extrabold text-slate-800">أكثر المواد محتوى</h2>
          <p className="text-xs text-slate-400 mb-4">عدد المواد التعليمية لكل مادة</p>
          {topSubjects.length === 0 && <p className="text-sm text-slate-400">لا توجد مواد بعد.</p>}
          {topSubjects.map((s, i) => (
            <div key={s.name} className="mb-3">
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-slate-500">{s.count}</span>
                <span className="text-slate-600">{s.name}</span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div className={"h-full " + BAR_COLORS[i % BAR_COLORS.length]} style={{ width: `${(s.count / maxSubject) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* أحدث التسجيلات */}
        <div className={`${card} lg:col-span-2 overflow-hidden`}>
          <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100">
            <div>
              <h2 className="font-extrabold text-slate-800">أحدث التسجيلات</h2>
              <p className="text-xs text-slate-400">آخر الحسابات المنضمّة</p>
            </div>
            <Link to="/users" className="text-xs text-blue-600 font-bold">عرض الكل</Link>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs">
              <tr>
                <th className="text-right px-5 py-2 font-bold">المستخدم</th>
                <th className="text-right px-5 py-2 font-bold">الدور</th>
                <th className="text-right px-5 py-2 font-bold">تاريخ الانضمام</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((u) => (
                <tr key={u.id} className="border-t border-slate-50">
                  <td className="px-5 py-2.5">
                    <p className="font-bold text-slate-700">{u.name}</p>
                    <p className="text-[11px] text-slate-400">{u.email}</p>
                  </td>
                  <td className="px-5 py-2.5">
                    <span className={"text-[11px] font-bold px-2 py-0.5 rounded-full " + (u.role === "teacher" ? "bg-blue-100 text-blue-700" : u.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-teal-100 text-teal-700")}>
                      {u.role === "teacher" ? "مدرس" : u.role === "admin" ? "أدمن" : "طالب"}
                    </span>
                  </td>
                  <td className="px-5 py-2.5 text-slate-500 text-xs">{new Date(u.created_at).toLocaleDateString("ar-EG")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* سجل النشاط */}
        <div className={`${card} p-5`}>
          <h2 className="font-extrabold text-slate-800">سجل النشاط</h2>
          <p className="text-xs text-slate-400 mb-4">أحدث الأحداث في المنصة</p>
          {activity.length === 0 && <p className="text-sm text-slate-400">لا يوجد نشاط بعد.</p>}
          <div className="space-y-3">
            {activity.map((a, i) => {
              const Icon = a.icon;
              return (
                <div key={i} className="flex items-start gap-2">
                  <div className={"w-7 h-7 rounded-lg flex items-center justify-center shrink-0 " + a.color}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-700 leading-snug">{a.text}</p>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Clock className="w-2.5 h-2.5" /> {new Date(a.at).toLocaleString("ar-EG")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* روابط سريعة للمهام */}
      <div className="grid sm:grid-cols-3 gap-4 mt-5">
        <Link to="/materials" className={`${card} p-5 hover:border-blue-200`}>
          <FileCheck2 className="w-6 h-6 text-blue-600 mb-2" />
          <p className="font-bold text-slate-800 text-sm">موافقة المواد</p>
          <p className="text-[11px] text-slate-400 mt-1">راجع مواد المدرسين قبل نشرها للطلاب</p>
          <span className="text-xs text-blue-600 font-bold flex items-center gap-1 mt-3">فتح <ArrowLeft className="w-3 h-3" /></span>
        </Link>
        <Link to="/attendance" className={`${card} p-5 hover:border-blue-200`}>
          <Clock className="w-6 h-6 text-blue-600 mb-2" />
          <p className="font-bold text-slate-800 text-sm">حضور المدرسين</p>
          <p className="text-[11px] text-slate-400 mt-1">وقت الدخول ومجموع الساعات والتقييم</p>
          <span className="text-xs text-blue-600 font-bold flex items-center gap-1 mt-3">فتح <ArrowLeft className="w-3 h-3" /></span>
        </Link>
        <Link to="/shifts" className={`${card} p-5 hover:border-blue-200`}>
          <CalendarClock className="w-6 h-6 text-blue-600 mb-2" />
          <p className="font-bold text-slate-800 text-sm">شيفتات المناوبة</p>
          <p className="text-[11px] text-slate-400 mt-1">عيّن مدرس مناوب لكل مادة في كل وقت</p>
          <span className="text-xs text-blue-600 font-bold flex items-center gap-1 mt-3">فتح <ArrowLeft className="w-3 h-3" /></span>
        </Link>
      </div>
    </div>
  );
}

export default Dashboard;
