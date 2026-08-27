import { useState, useEffect } from "react";
import { Trophy, Clock, CheckCircle, ChevronLeft, Send, X } from "lucide-react";
import { toast } from "sonner";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

// ألوان المواد الدراسية — بالالتزام بتصميم الفيجما
const SUBJECT_COLORS = {
  "الفيزياء": "bg-blue-100 text-blue-600",
  "اللغة العربية": "bg-teal-100 text-teal-600",
  "الرياضيات": "bg-indigo-100 text-indigo-600",
  "الأحياء": "bg-rose-100 text-rose-600",
};

// شاشة التحديات الأسبوعية — الطالب بيحل التحدي ويكسب نقاط
function Challenges() {
  const { user, refreshUser } = useAuth();
  const [challenges, setChallenges] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChallenge, setSelectedChallenge] = useState(null); // التحدي المفتوح في المودال
  const [answerText, setAnswerText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // نجيب التحديات + حلول الطالب (لو مسجّل دخول)
  const loadData = async () => {
    try {
      const chRes = await api.getChallenges();
      let subRes = { submissions: [] };
      if (user) {
        subRes = await api.getSubmissions();
      }
      setChallenges(chRes.challenges);
      setSubmissions(subRes.submissions);
    } catch (e) {
      toast.error(e.message || "فشل تحميل البيانات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // إرسال إجابة التحدي
  const handleSubmitAnswer = async () => {
    if (!selectedChallenge) return;
    if (!answerText.trim()) {
      toast.error("يرجى كتابة الإجابة أولاً");
      return;
    }
    setIsSubmitting(true);
    try {
      await api.submitChallenge(selectedChallenge.id, answerText);
      toast.success("تم إرسال إجابتك بنجاح! لقد حصلت على النقاط.");
      setSelectedChallenge(null);
      setAnswerText("");
      await refreshUser();
      await loadData();
    } catch (e) {
      toast.error(e.message || "فشل إرسال الإجابة");
    } finally {
      setIsSubmitting(false);
    }
  };

  // التحدي متحلّ لو موجود في حلول الطالب
  const isChallengeCompleted = (challengeId) => {
    return submissions.some((s) => s.challengeId === challengeId);
  };

  const completedCount = submissions.length;
  const activeCount = challenges.filter((c) => !isChallengeCompleted(c.id)).length;

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("ar-EG", { day: "numeric", month: "long" });
  };

  const card = "bg-white rounded-2xl border border-slate-100 shadow-sm";

  const stats = [
    { label: "مكتملة", value: completedCount, icon: CheckCircle, color: "bg-teal-100 text-teal-600" },
    { label: "قيد التنفيذ", value: activeCount, icon: Clock, color: "bg-blue-100 text-blue-600" },
    { label: "نقاطك الحالية", value: user?.points || 0, icon: Trophy, color: "bg-amber-100 text-amber-600" },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* الهيدر */}
      <div className="text-right">
        <h1 className="text-xl font-extrabold text-slate-800">التحديات الأسبوعية</h1>
        <p className="text-xs text-slate-400 mt-1">أكمل التحديات المدرسية لكسب النقاط والشارات</p>
      </div>

      {/* كروت الإحصائيات */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className={`${card} p-4`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">{stat.label}</span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xl font-extrabold text-slate-800 mt-2">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* قائمة التحديات */}
      {loading && <p className="text-sm text-slate-400 text-center py-10">جاري تحميل التحديات...</p>}

      {!loading && challenges.length === 0 && (
        <p className="text-sm text-slate-400 text-center py-10 bg-[#F5F7FF] rounded-2xl">لا توجد تحديات نشطة حالياً.</p>
      )}

      {!loading && challenges.map((ch) => {
        const completed = isChallengeCompleted(ch.id);
        return (
          <div key={ch.id} className={`${card} p-5`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 text-right">
                {/* البادچات: المادة + الحالة */}
                <div className="flex items-center justify-end gap-2 mb-2">
                  <span className={`rounded-full text-[10px] font-bold px-2 py-0.5 ${completed ? "bg-teal-100 text-teal-700" : "bg-[#EEF2FF] text-blue-700"}`}>
                    {completed ? "مكتمل" : `ينتهي في ${formatDate(ch.end_date)}`}
                  </span>
                  <span className={`rounded-full text-[10px] font-bold px-2 py-0.5 ${SUBJECT_COLORS[ch.subject] || "bg-slate-100 text-slate-600"}`}>
                    {ch.subject}
                  </span>
                </div>

                <h3 className="font-extrabold text-slate-800">{ch.title}</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{ch.description}</p>

                <div className="flex items-center justify-end gap-3 mt-3 text-[11px] font-bold text-slate-400">
                  <span>المرحلة: {ch.grade}</span>
                  <span className="flex items-center gap-1 text-amber-500">
                    <Trophy className="w-3.5 h-3.5" /> {ch.points} نقطة
                  </span>
                </div>
              </div>

              {/* زرار الحل — لو متحلّ نعرض حالة بدون زرار */}
              {completed ? (
                <span className="shrink-0 flex items-center gap-1 rounded-xl bg-teal-50 text-teal-600 text-xs font-bold px-3 py-2">
                  تم الحل <CheckCircle className="w-4 h-4" />
                </span>
              ) : (
                <button
                  onClick={() => {
                    if (!user) {
                      toast.error("يرجى تسجيل الدخول لبدء التحدي");
                      return;
                    }
                    setSelectedChallenge(ch);
                  }}
                  className="shrink-0 flex items-center gap-1 rounded-xl bg-blue-600 text-white text-xs font-bold px-4 py-2"
                >
                  ابدأ <ChevronLeft className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        );
      })}

      {/* مودال حل التحدي */}
      {selectedChallenge && (
        <div
          onClick={() => setSelectedChallenge(null)}
          className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4"
        >
          {/* الكارت — بنوقف الضغطة عشان المودال ما يقفلش */}
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl border border-slate-100 shadow-sm w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setSelectedChallenge(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
              <h3 className="font-extrabold text-slate-800">حل التحدي</h3>
            </div>

            <div className="text-right">
              <span className={`rounded-full text-[10px] font-bold px-2 py-0.5 ${SUBJECT_COLORS[selectedChallenge.subject] || "bg-slate-100 text-slate-600"}`}>
                {selectedChallenge.subject}
              </span>
              <h4 className="font-bold text-slate-800 mt-2">{selectedChallenge.title}</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{selectedChallenge.description}</p>
              <p className="flex items-center justify-end gap-1 text-[11px] font-bold text-amber-500 mt-2">
                <Trophy className="w-3.5 h-3.5" /> {selectedChallenge.points} نقطة
              </p>
            </div>

            <div className="text-right">
              <label className="text-xs font-bold text-slate-600">إجابتك</label>
              <textarea
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                placeholder="اكتب إجابتك بالتفصيل هنا..."
                rows={4}
                className="w-full mt-1.5 bg-[#F5F7FF] border border-slate-200 rounded-xl p-3 text-sm text-slate-800 outline-none focus:border-blue-400"
              />
            </div>

            <button
              onClick={handleSubmitAnswer}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 text-white text-xs font-bold py-3 disabled:opacity-60"
            >
              {isSubmitting ? "جاري الإرسال..." : "إرسال الحل"} <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Challenges;
