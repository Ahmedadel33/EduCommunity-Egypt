import { useEffect, useState } from "react";
import { Video, Calendar, ExternalLink } from "lucide-react";
import { api } from "../api.js";
import { useAdminI18n } from "../i18n.js";

// متابعة الدروس أونلاين — الأدمن يشوف كل الدروس المجدولة (عرض فقط)
function Lessons() {
  const { language, t } = useAdminI18n();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getLessons().then((d) => setLessons(d.lessons || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const card = "bg-white rounded-2xl border border-slate-100 shadow-sm";

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-2 mb-1">
        <Video className="w-5 h-5 text-blue-600" />
        <h1 className="text-xl font-extrabold text-slate-800">{t("متابعة الدروس أونلاين")}</h1>
      </div>
      <p className="text-sm text-slate-400 mb-5">{t("كل الدروس المباشرة اللي أنشأها المدرسون.")}</p>

      {loading && <p className="text-sm text-slate-400">{t("جاري التحميل...")}</p>}
      {!loading && lessons.length === 0 && (
        <div className={`${card} p-8 text-center text-slate-400 text-sm`}>{t("لا توجد دروس مجدولة.")}</div>
      )}

      <div className="space-y-3">
        {lessons.map((l) => (
          <div key={l._id || l.id} className={`${card} p-4 flex items-center justify-between`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">{l.title}</p>
                <p className="text-[11px] text-slate-400">
                  {language === "ar" ? "أ. " : ""}{l.teacher?.name || "—"} • {t(l.subject || "")} • {l.startsAt ? new Date(l.startsAt).toLocaleString(language === "ar" ? "ar-EG" : "en-US") : ""}
                </p>
              </div>
            </div>
            {l.meetingUrl && (
              <a href={l.meetingUrl} target="_blank" rel="noreferrer" className="text-blue-600 text-xs font-bold flex items-center gap-1">
                <ExternalLink className="w-3.5 h-3.5" /> {t("الرابط")}
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Lessons;
