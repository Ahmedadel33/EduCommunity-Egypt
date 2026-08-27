import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Headphones, MessageCircle } from "lucide-react";
import { api } from "../../lib/api";

// ودجت "المدرس المناوب الآن" — الطالب يشوف مين متاح دلوقتي ويقدر يسأله
// بنعمل refetch كل دقيقة عشان الشيفتات بتتغير مع الوقت
function OnDutyWidget() {
  const { data } = useQuery({
    queryKey: ["shifts-now"],
    queryFn: () => api.getShiftsNow(),
    refetchInterval: 60000,
  });
  const shifts = data?.shifts || [];

  const card = "bg-white rounded-2xl border border-slate-100 shadow-sm";

  return (
    <div className={`${card} p-5`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-extrabold text-slate-800 flex items-center gap-2">
          <Headphones className="w-4 h-4 text-teal-500" /> المدرس المناوب الآن
        </h3>
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
      </div>

      {shifts.length === 0 && (
        <p className="text-sm text-slate-400">لا يوجد مدرس مناوب حالياً. جرّب لاحقاً.</p>
      )}

      <div className="space-y-2">
        {shifts.map((s) => (
          <div key={s.id} className="flex items-center justify-between p-2.5 rounded-xl bg-[#F5F7FF]">
            <div>
              <p className="font-bold text-sm text-slate-800">أ. {s.teacher?.name}</p>
              <p className="text-[11px] text-slate-400">{s.subject} • متاح للأسئلة الآن</p>
            </div>
            <Link to="/chat">
              <button className="bg-teal-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1">
                <MessageCircle className="w-3.5 h-3.5" /> اسأل
              </button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default OnDutyWidget;
