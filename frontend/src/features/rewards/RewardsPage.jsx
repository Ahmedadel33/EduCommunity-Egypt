import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  Trophy, Medal, Star, Award, Lock, Clock, TrendingUp,
  Crown, Zap, Users, GraduationCap, Presentation, BadgeCheck,
} from "lucide-react";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

// ===== المكافآت والشارات (عرض الطالب) — مطابق لتصميم الفيجما =====
const card = "bg-white rounded-2xl border border-slate-100 shadow-sm";

// كتالوج الشارات: المكتسبة تتحدّد من user.badges، والباقي مقفول
const LOCKED_BADGES = [
  { name: "مبتكر حلول",  icon: Zap,   req: "مطلوب: فوز بمسابقة" },
  { name: "المفكر الخلّاق", icon: Star, req: "مطلوب: 50 مشاركة" },
];

// متجر المكافآت (استبدال XP)
const STORE = [
  { title: "ندوة حصرية مع خبراء", desc: "وصول مباشر لندوة تفاعلية مع كبار المتخصصين في مجالك.", cost: 1500, icon: Presentation },
  { title: "إطار ملف شخصي مميز",  desc: "ميّز ملفك بإطار متوهّج وحصري لصورتك الشخصية.",        cost: 250,  icon: Crown },
  { title: "شهادة رقمية معتمدة",  desc: "وثّق مهاراتك بشهادة رقمية قابلة للمشاركة على LinkedIn.", cost: 500, icon: BadgeCheck },
];

function RewardsPage() {
  const { user } = useAuth();
  const grade = user?.grade || "sec-1";
  const points = user?.points || 0;
  const badges = user?.badges || [];

  const { data: lb } = useQuery({ queryKey: ["leaderboard", grade], queryFn: () => api.getLeaderboard(grade) });
  const { data: rw } = useQuery({ queryKey: ["rewards"], queryFn: () => api.getRewards() });

  const board = lb?.leaderboard || [];
  const myIndex = board.findIndex((s) => s.id === user?.id);
  const rank = myIndex >= 0 ? myIndex + 1 : "—";
  // أقرب المتنافسين حواليّ في الترتيب
  const around = myIndex >= 0 ? board.slice(Math.max(0, myIndex - 2), myIndex + 2) : board.slice(0, 4);
  const rewards = rw?.rewards || [];

  function redeem(item) {
    if (points < item.cost) return toast.error("نقاطك غير كافية لهذه المكافأة");
    toast.success(`تم استبدال «${item.title}» ✅`);
  }

  return (
    <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-5" dir="rtl">
      {/* ===== العمود الرئيسي ===== */}
      <div className="lg:col-span-2 space-y-5">
        {/* الهيدر + إحصائيات */}
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">المكافآت والشارات</h1>
          <p className="text-sm text-slate-400 mt-1">أكمِل إنجازاتك وحوّل نقاط خبرتك إلى مكافآت حصرية.</p>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: Trophy, val: `#${rank}`, label: "الترتيب بالمدرسة", color: "bg-amber-100 text-amber-600" },
            { icon: Medal, val: badges.length, label: "شارة مكتملة", color: "bg-teal-100 text-teal-600" },
            { icon: Star, val: points.toLocaleString("ar"), label: "إجمالي XP", color: "bg-blue-100 text-blue-600" },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className={`${card} p-4 text-center`}>
                <div className={`w-11 h-11 rounded-xl mx-auto flex items-center justify-center ${s.color}`}><Icon className="w-5 h-5" /></div>
                <p className="text-2xl font-extrabold text-slate-800 mt-2">{s.val}</p>
                <p className="text-[11px] text-slate-400">{s.label}</p>
              </div>
            );
          })}
        </div>

        {/* شاراتي التعليمية */}
        <div className={`${card} p-5`}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-blue-600 font-bold">عرض الكل</span>
            <h2 className="font-extrabold text-slate-800">شاراتي التعليمية</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* المكتسبة */}
            {badges.map((b, i) => (
              <div key={i} className="rounded-xl border border-slate-100 p-3 text-center bg-white">
                <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center bg-gradient-to-br from-amber-400 to-orange-500 text-white"><Award className="w-6 h-6" /></div>
                <p className="text-xs font-bold text-slate-800 mt-2 truncate">{b}</p>
                <p className="text-[10px] text-teal-600 mt-0.5">تم الحصول عليها</p>
              </div>
            ))}
            {/* المقفولة */}
            {LOCKED_BADGES.map((b) => {
              const Icon = b.icon;
              return (
                <div key={b.name} className="rounded-xl border border-dashed border-slate-200 p-3 text-center bg-slate-50/60">
                  <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center bg-slate-200 text-slate-400 relative">
                    <Icon className="w-6 h-6" />
                    <span className="absolute -bottom-1 -left-1 w-5 h-5 rounded-full bg-slate-400 text-white flex items-center justify-center"><Lock className="w-3 h-3" /></span>
                  </div>
                  <p className="text-xs font-bold text-slate-500 mt-2 truncate">{b.name}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{b.req}</p>
                </div>
              );
            })}
            {badges.length === 0 && <p className="col-span-full text-sm text-slate-400 text-center py-2">لسه مفيش شارات — أكمل التحديات واكسبها!</p>}
          </div>
        </div>

        {/* متجر المكافآت */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="flex items-center gap-1 text-sm font-extrabold text-amber-600"><Star className="w-4 h-4 fill-current" /> {points.toLocaleString("ar")} XP</span>
            <h2 className="font-extrabold text-slate-800">متجر المكافآت</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {STORE.map((item) => {
              const Icon = item.icon;
              const affordable = points >= item.cost;
              return (
                <div key={item.title} className={`${card} overflow-hidden flex flex-col`}>
                  <div className="h-24 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center relative">
                    <Icon className="w-10 h-10 text-white/90" />
                    <span className="absolute bottom-2 right-2 bg-white/90 text-slate-800 text-[11px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1"><Star className="w-3 h-3 text-amber-500 fill-current" /> {item.cost} XP</span>
                  </div>
                  <div className="p-3 flex-1 flex flex-col">
                    <p className="font-bold text-sm text-slate-800">{item.title}</p>
                    <p className="text-[11px] text-slate-400 mt-1 flex-1 leading-relaxed">{item.desc}</p>
                    <button
                      onClick={() => redeem(item)}
                      disabled={!affordable}
                      className={`mt-3 w-full py-2 rounded-xl text-xs font-bold ${affordable ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}
                    >
                      {affordable ? "استبدال الآن" : "نقاط غير كافية"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ===== العمود الجانبي ===== */}
      <div className="space-y-5">
        {/* أحدث الإنجازات */}
        <div className={`${card} p-5`}>
          <h3 className="font-extrabold text-slate-800 mb-4">أحدث الإنجازات</h3>
          <div className="space-y-4">
            {(rewards.length ? rewards.slice(0, 3).map((r) => ({ title: `تم الحصول على «${r.title}»`, desc: r.note || "مكافأة على تميّزك" }))
              : [
                { title: 'تم الحصول على شارة "الطائر المبكر"', desc: "دخول 5 أيام متتالية قبل 8 صباحاً" },
                { title: "الوصول للمستوى 5", desc: "الحصول على 1000 نقطة خبرة" },
                { title: 'تم الحصول على شارة "مشارك نشط"', desc: "المساهمة بـ 20 تعليقاً مفيداً" },
              ]
            ).map((a, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0"><Award className="w-4 h-4" /></div>
                <div><p className="text-sm font-bold text-slate-800 leading-snug">{a.title}</p><p className="text-[11px] text-slate-400 mt-0.5">{a.desc}</p></div>
              </div>
            ))}
          </div>
        </div>

        {/* ترتيبك بالمدرسة */}
        <div className={`${card} p-5`}>
          <h3 className="font-extrabold text-slate-800 mb-4">ترتيبك بالمدرسة</h3>
          <div className="space-y-2">
            {around.length === 0 && <p className="text-sm text-slate-400">لا يوجد ترتيب بعد.</p>}
            {around.map((s) => {
              const idx = board.findIndex((x) => x.id === s.id);
              const me = s.id === user?.id;
              return (
                <div key={s.id} className={`flex items-center gap-3 p-2 rounded-xl ${me ? "bg-blue-50 border border-blue-100" : ""}`}>
                  <span className="text-xs font-extrabold text-slate-400 w-5">{idx + 1}</span>
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">{s.name?.charAt(0)}</div>
                  <p className="flex-1 text-sm font-bold text-slate-800 truncate">{s.name} {me && <span className="text-[10px] text-blue-600">(أنت)</span>}</p>
                  <span className="text-xs font-extrabold text-amber-600">{s.points} XP</span>
                </div>
              );
            })}
          </div>
          <Link to="/leaderboard"><button className="w-full mt-3 py-2 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50">مشاهدة القائمة كاملة</button></Link>
        </div>

        {/* تحدي المجموعات */}
        <div className="rounded-2xl bg-teal-600 text-white p-5">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center"><Users className="w-5 h-5" /></div>
          <p className="font-extrabold mt-3">تحدي المجموعات</p>
          <p className="text-xs text-teal-50 mt-1 leading-relaxed">ساعد فريقك في حل المسابقة الأسبوعية للحصول على 300 نقطة إضافية.</p>
          <Link to="/challenges"><button className="w-full mt-3 bg-white text-teal-700 font-bold text-xs py-2.5 rounded-xl">انضم للفريق</button></Link>
        </div>
      </div>
    </div>
  );
}

export default RewardsPage;
