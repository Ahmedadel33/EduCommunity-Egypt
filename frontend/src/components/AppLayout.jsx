import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home, BookOpen, Video, Trophy, Sparkles, Award, MessageSquare,
  BarChart3, Users, Network, User, Settings, HelpCircle, LogOut,
  Search, Menu, X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

// الشل المشترك (سايدبار يمين + توب بار) — بالالتزام بتصميم الفيجما
const AppLayout = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(""); // نص البحث في التوب-بار
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // لما يضغط Enter في البحث نوديه لصفحة المواد بنفس الكلمة
  function submitSearch(e) {
    e.preventDefault();
    if (!search.trim()) return;
    navigate("/materials?search=" + encodeURIComponent(search.trim()));
  }

  // التطبيق ده للطلاب والمدرسين — الأدمن ليه تطبيق منفصل
  const home = user?.role === "teacher" ? "/teacher" : "/student";

  // القائمة تختلف حسب الدور (زي الفيجما)
  let nav = [{ to: home, label: "الرئيسية", icon: Home }];
  if (user?.role === "teacher") {
    nav.push(
      { to: "/materials", label: "المواد", icon: BookOpen },
      { to: "/lessons", label: "الدروس أونلاين", icon: Video },
      { to: "/challenges", label: "المسابقات", icon: Trophy },
      { to: "/soft-skills", label: "المهارات الناعمة", icon: Sparkles },
      { to: "/chat", label: "الشات", icon: MessageSquare },
      { to: "/feed", label: "المجتمع", icon: Users },
      { to: "/profile", label: "ملفي", icon: User },
    );
  } else {
    nav.push(
      { to: "/materials", label: "المواد", icon: BookOpen },
      { to: "/lessons", label: "الدروس أونلاين", icon: Video },
      { to: "/challenges", label: "المسابقات", icon: Trophy },
      { to: "/soft-skills", label: "المهارات الناعمة", icon: Sparkles },
      { to: "/rewards", label: "المكافآت", icon: Award },
      { to: "/chat", label: "الشات", icon: MessageSquare },
      { to: "/leaderboard", label: "المتصدرون", icon: BarChart3 },
      { to: "/teachers", label: "المدرسون", icon: Network },
      { to: "/feed", label: "المجتمع", icon: Users },
    );
  }

  const roleLabel = user?.role === "teacher" ? "معلم" : user?.role === "admin" ? "مدير النظام" : "طالب";

  const NavLink = ({ to, label, icon: Icon }) => {
    const active = location.pathname === to;
    return (
      <Link
        to={to}
        onClick={() => setOpen(false)}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${
          active ? "bg-[#EEF2FF] text-blue-700" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
        }`}
      >
        <Icon className="w-[18px] h-[18px] shrink-0" />
        <span>{label}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen flex bg-[#F5F7FF] text-[#0F172A]" dir="rtl">
      {/* السايدبار (يمين) */}
      <aside className={`fixed inset-y-0 right-0 z-40 w-64 bg-white border-l border-slate-200 p-5 flex-col justify-between overflow-y-auto lg:static lg:flex ${open ? "flex" : "hidden"}`}>
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-lg font-extrabold text-blue-600">EduCommunity</span>
            <button className="lg:hidden text-slate-400" onClick={() => setOpen(false)}><X className="w-5 h-5" /></button>
          </div>

          {/* كارت المستخدم */}
          <div className="p-3 bg-[#F5F7FF] rounded-2xl">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                {user ? user.name.charAt(0) : "ز"}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">{user ? user.name : "زائر"}</p>
                <p className="text-[10px] text-slate-400 font-bold">
                  {roleLabel}{user?.role === "student" ? ` • ${user.points || 0} XP` : ""}
                </p>
              </div>
            </div>
          </div>

          <nav className="space-y-1">
            {nav.map((n) => <NavLink key={n.to} {...n} />)}
          </nav>
        </div>

        <div className="space-y-1 pt-4 border-t border-slate-100 mt-4">
          <NavLink to="/settings" label="الإعدادات" icon={Settings} />
          <NavLink to="/help" label="المساعدة" icon={HelpCircle} />
          {user && (
            <button
              onClick={() => { logout(); navigate("/"); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-rose-500 hover:bg-rose-50 transition-all"
            >
              <LogOut className="w-[18px] h-[18px] shrink-0" />
              <span>تسجيل الخروج</span>
            </button>
          )}
        </div>
      </aside>

      {/* overlay للموبايل */}
      {open && <div className="fixed inset-0 bg-black/30 z-30 lg:hidden" onClick={() => setOpen(false)} />}

      {/* المحتوى */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* التوب بار (glassmorphic) */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 lg:px-6 py-3 flex items-center gap-3">
          <button className="lg:hidden p-2 text-slate-500" onClick={() => setOpen(true)}><Menu className="w-5 h-5" /></button>
          <form onSubmit={submitSearch} className="flex-1 max-w-lg relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث عن مادة تعليمية... (اضغط Enter)"
              className="w-full bg-[#F1F5F9] rounded-xl pr-9 pl-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </form>
          <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
            {user ? user.name.charAt(0) : "ز"}
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
};

export default AppLayout;
