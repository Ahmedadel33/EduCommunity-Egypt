import { useEffect, useState } from "react";
import { Award, Gift, Medal, Star, Plus } from "lucide-react";
import { api } from "../api.js";
import { useAdminI18n } from "../i18n.js";

// أنواع المكافآت
const TYPES = [
  { value: "badge", label: "شارة", icon: Award, color: "bg-blue-100 text-blue-600" },
  { value: "prize", label: "جائزة", icon: Gift, color: "bg-amber-100 text-amber-600" },
  { value: "honor", label: "تكريم", icon: Medal, color: "bg-purple-100 text-purple-600" },
];

function typeMeta(t) {
  return TYPES.find((x) => x.value === t) || TYPES[0];
}

// إدارة المكافآت — الأدمن يمنح شارة/جائزة/تكريم لأي مستخدم ويشوف كل الممنوح
function Rewards() {
  const { language, t } = useAdminI18n();
  const [rewards, setRewards] = useState([]);
  const [users, setUsers] = useState([]);
  const [userId, setUserId] = useState("");
  const [title, setTitle] = useState("");
  const [type, setType] = useState("badge");
  const [note, setNote] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  function load() {
    api.getRewards().then((d) => setRewards(d.rewards || [])).catch(() => {}).finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    api.getUsers().then((d) => setUsers(d.users || [])).catch(() => {});
  }, []);

  async function grant(e) {
    e.preventDefault();
    setMsg("");
    if (!userId || !title.trim()) {
      setMsg(t("اختر المستخدم واكتب عنوان المكافأة"));
      return;
    }
    try {
      await api.grantReward({ user: userId, title: title.trim(), type, note: note.trim() });
      setMsg(t("تم منح المكافأة ✅"));
      setTitle("");
      setNote("");
      setUserId("");
      load();
    } catch (err) {
      setMsg(err.message);
    }
  }

  const card = "bg-white rounded-2xl border border-slate-100 shadow-sm";
  const input = "w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500";

  return (
    <div className="max-w-5xl">
      <div className="flex items-center gap-2 mb-1">
        <Star className="w-5 h-5 text-blue-600" />
        <h1 className="text-xl font-extrabold text-slate-800">{t("إدارة الجوائز والمكافآت")}</h1>
      </div>
      <p className="text-sm text-slate-400 mb-5">{t("حفّز المتفوقين وكافئ جهودهم — امنح شارة أو جائزة أو تكريم.")}</p>

      {msg && <p className="text-sm bg-blue-50 text-blue-700 rounded-lg p-2 mb-4">{msg}</p>}

      {/* نموذج المنح */}
      <form onSubmit={grant} className={`${card} p-4 mb-6 grid sm:grid-cols-4 gap-3 items-end`}>
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">{t("المستخدم")}</label>
          <select value={userId} onChange={(e) => setUserId(e.target.value)} className={input}>
            <option value="">{t("اختر مستخدم…")}</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.name} ({t(u.role === "teacher" ? "مدرس" : u.role === "admin" ? "أدمن" : "طالب")})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">{t("العنوان")}</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={input} placeholder={t("وسام التميز")} />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">{t("النوع")}</label>
          <select value={type} onChange={(e) => setType(e.target.value)} className={input}>
            {TYPES.map((item) => <option key={item.value} value={item.value}>{t(item.label)}</option>)}
          </select>
        </div>
        <button className="bg-blue-600 text-white font-bold text-sm py-2 rounded-xl flex items-center justify-center gap-1">
          <Plus className="w-4 h-4" /> {t("امنح الآن")}
        </button>
        <div className="sm:col-span-4">
          <input value={note} onChange={(e) => setNote(e.target.value)} className={input} placeholder={t("ملاحظة (اختياري)")} />
        </div>
      </form>

      {/* قائمة المكافآت الممنوحة */}
      <div className={`${card} overflow-hidden`}>
        <div className="px-4 py-3 border-b border-slate-100 font-bold text-slate-700 text-sm">{t("أحدث المكافآت الممنوحة")}</div>
        {loading && <p className="p-4 text-sm text-slate-400">{t("جاري التحميل…")}</p>}
        {!loading && rewards.length === 0 && <p className="p-6 text-center text-sm text-slate-400">{t("لم تُمنح أي مكافآت بعد.")}</p>}
        <div className="divide-y divide-slate-50">
          {rewards.map((r) => {
            const meta = typeMeta(r.type);
            const Icon = meta.icon;
            return (
              <div key={r._id || r.id} className="flex items-center gap-3 px-4 py-3">
                <div className={"w-10 h-10 rounded-xl flex items-center justify-center " + meta.color}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-800 text-sm">{r.title}</p>
                  <p className="text-[11px] text-slate-400">
                    {r.user?.name || "—"} • {t(meta.label)}{r.note ? " • " + r.note : ""}
                  </p>
                </div>
                <span className="text-[10px] text-slate-400">{r.createdAt ? new Date(r.createdAt).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US") : ""}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Rewards;
