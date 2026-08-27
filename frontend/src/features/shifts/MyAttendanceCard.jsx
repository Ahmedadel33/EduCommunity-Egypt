import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Clock, LogOut } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../lib/api";

// نحوّل الدقائق لساعات ودقائق
function formatMinutes(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return (h > 0 ? h + " س " : "") + m + " د";
}

// كارت "وقت حضوري" للمدرس
// وقت الدخول بيتسجّل تلقائياً في الباك أول ما يعمل login،
// وزرار "تسجيل خروج" بيقفل الجلسة ويحسب المدة — والأدمن بيبني عليها التقييم.
function MyAttendanceCard() {
  const qc = useQueryClient();

  const { data } = useQuery({ queryKey: ["my-attendance"], queryFn: () => api.getMyAttendance() });
  const sessions = data?.sessions || [];
  const totalMinutes = data?.totalMinutes || 0;

  // الجلسة المفتوحة = اللي لسه مقفلتش (مفيش وقت خروج)
  const openSession = sessions.find((s) => !s.logoutAt);

  const checkout = useMutation({
    mutationFn: () => api.checkoutAttendance(),
    onSuccess: () => {
      toast.success("تم تسجيل خروجك واحتساب وقتك");
      qc.invalidateQueries({ queryKey: ["my-attendance"] });
    },
    onError: (e) => toast.error(e.message),
  });

  const card = "bg-white rounded-2xl border border-slate-100 shadow-sm";

  return (
    <div className={`${card} p-5`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-extrabold text-slate-800 flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-600" /> وقت حضوري
        </h3>
        {openSession && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">متصل الآن</span>}
      </div>

      <p className="text-2xl font-extrabold text-blue-600">{formatMinutes(totalMinutes)}</p>
      <p className="text-[11px] text-slate-400 mt-0.5">إجمالي وقتك المحتسب • {sessions.length} جلسة</p>

      {openSession && (
        <p className="text-[11px] text-slate-500 mt-2">
          جلستك الحالية بدأت: {new Date(openSession.loginAt).toLocaleTimeString("ar-EG")}
        </p>
      )}

      <button
        onClick={() => checkout.mutate()}
        disabled={!openSession || checkout.isPending}
        className="w-full mt-3 py-2 bg-[#EEF2FF] text-blue-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 disabled:opacity-50"
      >
        <LogOut className="w-3.5 h-3.5" />
        {openSession ? "تسجيل خروج واحتساب الوقت" : "لا توجد جلسة مفتوحة"}
      </button>
    </div>
  );
}

export default MyAttendanceCard;
