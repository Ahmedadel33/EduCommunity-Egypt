import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, Bug, GraduationCap, CreditCard, UserCog,
  ChevronDown, MessageSquare, Mail, Users, LifeBuoy,
} from "lucide-react";

// ===== شاشة المساعدة والدعم — مطابقة لتصميم الفيجما =====
const card = "bg-white rounded-2xl border border-slate-100 shadow-sm";

// فئات الدعم (4 كروت)
const CATEGORIES = [
  { icon: Bug,           title: "الدعم التقني",        desc: "مشاكل في الموقع، التطبيق، أو البث المباشر.", color: "bg-rose-100 text-rose-600" },
  { icon: GraduationCap, title: "الدروس والمحتوى",     desc: "الوصول للمواد، الاختبارات، والشهادات.",       color: "bg-amber-100 text-amber-600" },
  { icon: CreditCard,    title: "الاشتراكات والدفع",   desc: "طرق الدفع، الفواتير، واسترداد الأموال.",      color: "bg-teal-100 text-teal-600" },
  { icon: UserCog,       title: "إدارة الحساب",        desc: "تغيير البيانات، الأمان، والخصوصية.",          color: "bg-blue-100 text-blue-600" },
];

// الأسئلة الشائعة (accordion)
const FAQS = [
  { q: "كيف يمكنني تفعيل حسابي الممتاز؟", a: "من صفحة الإعدادات ← الحساب، أو بالضغط على زر «ترقية الحساب» في القائمة الجانبية، واتبع خطوات الاشتراك." },
  { q: "هل يمكنني تحميل الدروس لمشاهدتها بدون إنترنت؟", a: "الدروس المباشرة تُبث عبر الإنترنت، أما الدروس المسجّلة فيمكن مشاهدتها في أي وقت من تبويب «الدروس المسجلة»." },
  { q: "كيف أحصل على شهادة إتمام المساق؟", a: "بعد إكمال جميع دروس المساق واجتياز اختباراته، تصدر الشهادة تلقائياً وتظهر في صفحة المهارات الناعمة ← شهاداتي." },
  { q: "ماذا أفعل إذا واجهت مشكلة في البث المباشر؟", a: "تأكد من اتصالك بالإنترنت وأعد تحميل الصفحة. إذا استمرت المشكلة تواصل مع الدعم التقني عبر الشات المباشر." },
];

function FaqItem({ q, a, open, onToggle }) {
  return (
    <div className={`${card} overflow-hidden`}>
      <button onClick={onToggle} className="w-full flex items-center justify-between gap-3 p-4 text-right">
        <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
        <span className="font-bold text-slate-800 text-sm flex-1">{q}</span>
      </button>
      {open && <p className="px-4 pb-4 text-sm text-slate-500 text-right leading-relaxed">{a}</p>}
    </div>
  );
}

function Help() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [openFaq, setOpenFaq] = useState(0);

  function runSearch(e) {
    e.preventDefault();
    // البحث يوجّه للمواد بنفس الكلمة (زي التوب-بار)
    navigate("/materials" + (query.trim() ? `?search=${encodeURIComponent(query.trim())}` : ""));
  }

  return (
    <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-5" dir="rtl">
      {/* المحتوى الرئيسي */}
      <div className="lg:col-span-2 space-y-5">
        {/* Hero + بحث */}
        <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 p-6 sm:p-8 text-center">
          <h1 className="text-2xl font-extrabold text-slate-800">كيف يمكننا مساعدتك؟</h1>
          <form onSubmit={runSearch} className="relative mt-5 max-w-xl mx-auto">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث عن المشكلات، الأسئلة، أو الدروس..."
              className="w-full bg-white border border-slate-200 rounded-xl pr-12 pl-24 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-200 shadow-sm"
            />
            <button type="submit" className="absolute left-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white text-sm font-bold px-4 py-2 rounded-lg">بحث</button>
          </form>
          <div className="flex items-center justify-center gap-2 flex-wrap mt-4 text-xs text-slate-500">
            <span className="text-slate-400">عمليات بحث شائعة:</span>
            {["نسيان كلمة المرور", "تحميل الشهادات", "الدفع والاشتراك"].map((s) => (
              <button key={s} onClick={() => setQuery(s)} className="text-blue-600 font-bold hover:underline">{s}</button>
            ))}
          </div>
        </div>

        {/* استكشف حسب الفئة */}
        <div>
          <h2 className="font-extrabold text-slate-800 mb-3">استكشف حسب الفئة</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {CATEGORIES.map((c) => {
              const Icon = c.icon;
              return (
                <div key={c.title} className={`${card} p-5 hover:border-blue-200 transition cursor-pointer`}>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${c.color}`}><Icon className="w-6 h-6" /></div>
                  <p className="font-extrabold text-slate-800 mt-3">{c.title}</p>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{c.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* الأسئلة الشائعة */}
        <div>
          <h2 className="font-extrabold text-slate-800 mb-3">الأسئلة الشائعة</h2>
          <div className="space-y-3">
            {FAQS.map((f, i) => (
              <FaqItem key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? -1 : i)} />
            ))}
          </div>
        </div>
      </div>

      {/* العمود الجانبي */}
      <div className="space-y-5">
        <div className="rounded-2xl bg-blue-600 text-white p-6">
          <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center"><LifeBuoy className="w-5 h-5" /></div>
          <p className="font-extrabold mt-3">ما زلت بحاجة للمساعدة؟</p>
          <p className="text-xs text-blue-100 mt-1 leading-relaxed">فريق الدعم لدينا متاح 24/7 للإجابة على استفساراتكم وحل مشاكلكم التقنية.</p>
          <button onClick={() => navigate("/chat")} className="w-full mt-4 bg-white text-blue-700 font-bold text-sm py-2.5 rounded-xl flex items-center justify-center gap-2"><MessageSquare className="w-4 h-4" /> تواصل عبر الشات المباشر</button>
          <a href="mailto:support@educommunity.eg"><button className="w-full mt-2 bg-blue-500/40 border border-white/30 text-white font-bold text-sm py-2.5 rounded-xl flex items-center justify-center gap-2"><Mail className="w-4 h-4" /> أرسل بريد إلكتروني</button></a>
        </div>

        <div className="rounded-2xl bg-teal-500 text-white p-6">
          <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center"><Users className="w-5 h-5" /></div>
          <p className="font-extrabold mt-3">اسأل المجتمع</p>
          <p className="text-xs text-teal-50 mt-1 leading-relaxed">انضم إلى آلاف الطلاب والمعلمين في مجتمعنا وشارك أسئلتك.</p>
          <button onClick={() => navigate("/feed")} className="w-full mt-4 bg-white text-teal-700 font-bold text-sm py-2.5 rounded-xl">انتقل إلى المنتدى</button>
        </div>
      </div>
    </div>
  );
}

export default Help;
