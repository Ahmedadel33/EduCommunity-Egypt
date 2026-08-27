import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, FileCheck2, Clock, CalendarClock, Users, Award, Video, Trophy, Sparkles, LogOut, Shield, Menu, X } from "lucide-react";

// روابط القائمة الجانبية للأدمن
const links = [
  { to: "/", label: "لوحة التحكم", icon: LayoutDashboard },
  { to: "/materials", label: "إدارة المواد", icon: FileCheck2 },
  { to: "/lessons", label: "الدروس", icon: Video },
  { to: "/challenges", label: "التحديات", icon: Trophy },
  { to: "/soft-skills", label: "المهارات الناعمة", icon: Sparkles },
  { to: "/rewards", label: "المكافآت", icon: Award },
  { to: "/attendance", label: "حضور المدرسين", icon: Clock },
  { to: "/shifts", label: "شيفتات المناوبة", icon: CalendarClock },
  { to: "/users", label: "المستخدمون", icon: Users },
];

function AdminLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false); // القائمة على الموبايل

  function logout() {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_refresh_token");
    localStorage.removeItem("admin_user");
    navigate("/login");
  }

  const adminName = JSON.parse(localStorage.getItem("admin_user") || "{}")?.name || "الأدمن";

  return (
    <div className="min-h-screen flex">
      {/* خلفية معتّمة على الموبايل لما القائمة مفتوحة */}
      {open && <div onClick={() => setOpen(false)} className="fixed inset-0 bg-slate-900/40 z-30 lg:hidden" />}

      {/* القائمة الجانبية (يمين لأننا RTL) — drawer على الموبايل، ثابتة على الديسكتوب */}
      <aside
        className={
          "w-64 bg-white border-l border-slate-100 flex-col shrink-0 z-40 " +
          "fixed inset-y-0 right-0 lg:static lg:flex " +
          (open ? "flex" : "hidden")
        }
      >
        <div className="p-5 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center"><Shield className="w-5 h-5" /></div>
            <div>
              <p className="font-extrabold text-slate-800 text-sm">لوحة الأدمن</p>
              <p className="text-[11px] text-slate-400">EduCommunity</p>
            </div>
          </div>
          {/* زر إغلاق على الموبايل */}
          <button onClick={() => setOpen(false)} className="lg:hidden text-slate-400"><X className="w-5 h-5" /></button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {links.map((l) => {
            const active = location.pathname === l.to;
            const Icon = l.icon;
            return (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className={
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold " +
                  (active ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-50")
                }
              >
                <Icon className="w-4 h-4" /> {l.label}
              </Link>
            );
          })}
        </nav>

        <button onClick={logout} className="m-3 flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50">
          <LogOut className="w-4 h-4" /> تسجيل الخروج
        </button>
      </aside>

      {/* المحتوى */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-white/80 backdrop-blur border-b border-slate-100 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            {/* زر فتح القائمة على الموبايل */}
            <button onClick={() => setOpen(true)} className="lg:hidden text-slate-500"><Menu className="w-5 h-5" /></button>
            <span className="font-bold text-slate-700 text-sm">مرحباً، {adminName}</span>
          </div>
          <span className="text-xs text-slate-400 hidden sm:inline">منطقة الإدارة فقط</span>
        </header>
        <main className="flex-1 p-4 sm:p-6 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}

export default AdminLayout;
