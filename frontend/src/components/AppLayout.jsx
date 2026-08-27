import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, BookOpen, Video, Trophy, Sparkles, Award, MessageSquare, BarChart3, Users, Network, User, Settings, HelpCircle, LogOut, Search, Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { resolveMediaUrl } from "../lib/media";
import { useI18n } from "../lib/i18n";

const AppLayout = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t, language } = useI18n();
  const avatarPosition = user?.avatarPosition || { x: 50, y: 50 };
  const home = user?.role === "teacher" ? "/teacher" : "/student";
  const common = [
    ["/materials", "materials", BookOpen], ["/lessons", "lessons", Video],
    ["/challenges", "challenges", Trophy], ["/soft-skills", "softSkills", Sparkles],
    ["/chat", "chat", MessageSquare], ["/feed", "community", Users],
  ];
  const nav = [{ to: home, label: t("home"), icon: Home }, ...common.map(([to, key, icon]) => ({ to, label: t(key), icon }))];
  if (user?.role === "student") nav.splice(5, 0, { to: "/rewards", label: t("rewards"), icon: Award }, { to: "/leaderboard", label: t("leaderboard"), icon: BarChart3 }, { to: "/teachers", label: t("teachers"), icon: Network });
  if (user?.role === "teacher") nav.push({ to: "/profile", label: t("profile"), icon: User });
  const roleLabel = user?.role === "teacher" ? t("teacher") : user?.role === "admin" ? t("admin") : t("student");
  const avatar = user?.avatarUrl ? <img src={resolveMediaUrl(user.avatarUrl)} alt="" className="w-full h-full object-cover" style={{ objectPosition: `${avatarPosition.x}% ${avatarPosition.y}%` }} /> : user ? user.name.charAt(0) : "ز";
  const NavLink = ({ to, label, icon: Icon }) => <Link to={to} onClick={() => setOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${location.pathname === to ? "bg-[#EEF2FF] text-blue-700" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"}`}><Icon className="w-[18px] h-[18px] shrink-0" /><span>{label}</span></Link>;
  function submitSearch(e) { e.preventDefault(); if (search.trim()) navigate("/materials?search=" + encodeURIComponent(search.trim())); }

  return <div className="min-h-screen flex bg-[#F5F7FF] text-[#0F172A]" dir={language === "ar" ? "rtl" : "ltr"}>
    <aside className={`fixed inset-y-0 right-0 z-40 w-64 bg-white border-l border-slate-200 p-5 flex-col justify-between overflow-y-auto lg:static lg:flex ${open ? "flex" : "hidden"}`}>
      <div className="space-y-5"><div className="flex items-center justify-between"><span className="text-lg font-extrabold text-blue-600">EduCommunity</span><button className="lg:hidden text-slate-400" onClick={() => setOpen(false)}><X className="w-5 h-5" /></button></div>
        <div className="p-3 bg-[#F5F7FF] rounded-2xl"><div className="flex items-center gap-2.5"><div className="w-9 h-9 rounded-full overflow-hidden bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">{avatar}</div><div className="min-w-0"><p className="text-sm font-bold text-slate-800 truncate">{user ? user.name : t("visitor")}</p><p className="text-[10px] text-slate-400 font-bold">{roleLabel}{user?.role === "student" ? ` • ${user.points || 0} XP` : ""}</p></div></div></div>
        <nav className="space-y-1">{nav.map((item) => <NavLink key={item.to} {...item} />)}</nav>
      </div>
      <div className="space-y-1 pt-4 border-t border-slate-100 mt-4"><NavLink to="/settings" label={t("settings")} icon={Settings} /><NavLink to="/help" label={t("help")} icon={HelpCircle} />{user && <button onClick={() => { logout(); navigate("/"); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-rose-500 hover:bg-rose-50"><LogOut className="w-[18px] h-[18px]" /><span>{t("logout")}</span></button>}</div>
    </aside>
    {open && <div className="fixed inset-0 bg-black/30 z-30 lg:hidden" onClick={() => setOpen(false)} />}
    <div className="flex-1 flex flex-col min-w-0"><header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 lg:px-6 py-3 flex items-center gap-3"><button className="lg:hidden p-2 text-slate-500" onClick={() => setOpen(true)}><Menu className="w-5 h-5" /></button><form onSubmit={submitSearch} className="flex-1 max-w-lg relative"><Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("search")} className="w-full bg-[#F1F5F9] rounded-xl pr-9 pl-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" /></form><div className="w-9 h-9 rounded-full overflow-hidden bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">{avatar}</div></header><main className="flex-1 p-4 lg:p-6">{children}</main></div>
  </div>;
};

export default AppLayout;
