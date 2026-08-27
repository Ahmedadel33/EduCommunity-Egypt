import { useEffect, useState } from "react";
import { Users as UsersIcon, Trash2 } from "lucide-react";
import { api } from "../api.js";

// ألوان صغيرة لكل دور
const roleBadge = {
  admin: "bg-purple-100 text-purple-700",
  teacher: "bg-blue-100 text-blue-700",
  student: "bg-teal-100 text-teal-700",
};
const roleLabel = { admin: "أدمن", teacher: "مدرس", student: "طالب" };

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    api.getUsers().then((data) => {
      setUsers(data.users || []);
      setLoading(false);
    });
  }

  useEffect(() => {
    load();
  }, []);

  async function remove(id) {
    await api.deleteUser(id);
    load();
  }

  return (
    <div className="max-w-5xl">
      <div className="flex items-center gap-2 mb-1">
        <UsersIcon className="w-5 h-5 text-blue-600" />
        <h1 className="text-xl font-extrabold text-slate-800">المستخدمون</h1>
      </div>
      <p className="text-sm text-slate-400 mb-5">كل الطلاب والمدرسين المسجّلين في المنصة.</p>

      {loading && <p className="text-sm text-slate-400">جاري التحميل...</p>}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs">
            <tr>
              <th className="text-right px-4 py-2 font-bold">الاسم</th>
              <th className="text-right px-4 py-2 font-bold">البريد</th>
              <th className="text-right px-4 py-2 font-bold">الدور</th>
              <th className="text-right px-4 py-2 font-bold">النقاط</th>
              <th className="text-right px-4 py-2 font-bold"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-slate-50">
                <td className="px-4 py-2.5 font-bold text-slate-700">{u.name}</td>
                <td className="px-4 py-2.5 text-slate-500">{u.email}</td>
                <td className="px-4 py-2.5">
                  <span className={"text-[11px] font-bold px-2 py-0.5 rounded-full " + (roleBadge[u.role] || "bg-slate-100 text-slate-600")}>
                    {roleLabel[u.role] || u.role}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-slate-700">{u.points ?? 0}</td>
                <td className="px-4 py-2.5 text-left">
                  {u.role !== "admin" && (
                    <button onClick={() => remove(u.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Users;
