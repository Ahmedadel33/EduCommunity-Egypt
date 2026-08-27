import { useEffect, useState } from "react";
import { CalendarClock, Plus, Trash2 } from "lucide-react";
import { api } from "../api.js";

// شيفتات المناوبة — الأدمن يعيّن مدرس مناوب لمادة في وقت معيّن
function Shifts() {
  const [shifts, setShifts] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [teacher, setTeacher] = useState("");
  const [subject, setSubject] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [msg, setMsg] = useState("");

  async function load() {
    const data = await api.getShifts();
    setShifts(data.shifts || []);
  }

  useEffect(() => {
    load();
    // نجيب المدرسين عشان نختار منهم
    api.getUsers().then((data) => {
      const list = (data.users || []).filter((u) => u.role === "teacher");
      setTeachers(list);
      if (list[0]) setTeacher(list[0].id);
    });
  }, []);

  function isNow(s) {
    const now = new Date();
    return new Date(s.startsAt) <= now && new Date(s.endsAt) >= now;
  }

  async function add(e) {
    e.preventDefault();
    setMsg("");
    if (!teacher || !subject || !startsAt || !endsAt) {
      setMsg("لازم تملأ كل الحقول");
      return;
    }
    try {
      await api.createShift({ teacher, subject, startsAt, endsAt });
      setMsg("تم إضافة الشيفت ✅");
      setSubject("");
      setStartsAt("");
      setEndsAt("");
      load();
    } catch (err) {
      setMsg(err.message);
    }
  }

  async function remove(id) {
    await api.deleteShift(id);
    load();
  }

  const input = "w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500";

  return (
    <div className="max-w-5xl">
      <div className="flex items-center gap-2 mb-1">
        <CalendarClock className="w-5 h-5 text-blue-600" />
        <h1 className="text-xl font-extrabold text-slate-800">شيفتات المناوبة</h1>
      </div>
      <p className="text-sm text-slate-400 mb-5">عيّن مدرس مناوب لكل مادة عشان الطالب يلاقي حد يسأله في أي وقت.</p>

      {msg && <p className="text-sm bg-blue-50 text-blue-700 rounded-lg p-2 mb-4">{msg}</p>}

      {/* نموذج إضافة شيفت */}
      <form onSubmit={add} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-6 grid sm:grid-cols-5 gap-3 items-end">
        <div className="sm:col-span-1">
          <label className="block text-xs font-bold text-slate-500 mb-1">المدرس</label>
          <select value={teacher} onChange={(e) => setTeacher(e.target.value)} className={input}>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">المادة</label>
          <input value={subject} onChange={(e) => setSubject(e.target.value)} className={input} placeholder="الفيزياء" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">من</label>
          <input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} className={input} />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">إلى</label>
          <input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} className={input} />
        </div>
        <button className="bg-blue-600 text-white font-bold text-sm py-2 rounded-xl flex items-center justify-center gap-1">
          <Plus className="w-4 h-4" /> إضافة
        </button>
      </form>

      {/* قائمة الشيفتات */}
      <div className="space-y-3">
        {shifts.length === 0 && <p className="text-sm text-slate-400">لا توجد شيفتات بعد.</p>}
        {shifts.map((s) => (
          <div key={s._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-bold text-slate-800 text-sm">أ. {s.teacher?.name}</p>
                {isNow(s) && <span className="text-[10px] bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full">مناوب الآن</span>}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {s.subject} • {new Date(s.startsAt).toLocaleString("ar-EG")} ← {new Date(s.endsAt).toLocaleTimeString("ar-EG")}
              </p>
            </div>
            <button onClick={() => remove(s._id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Shifts;
