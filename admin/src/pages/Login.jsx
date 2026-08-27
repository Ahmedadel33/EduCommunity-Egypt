import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield } from "lucide-react";
import { api } from "../api.js";

// تسجيل دخول الأدمن — لازم يكون الدور admin
function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@edu.eg");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await api.login({ email, password });
      // لو المستخدم مش أدمن نرفض
      if (data.user?.role !== "admin") {
        setError("هذه اللوحة للأدمن فقط");
        setLoading(false);
        return;
      }
      localStorage.setItem("admin_token", data.token);
      localStorage.setItem("admin_refresh_token", data.refreshToken);
      localStorage.setItem("admin_user", JSON.stringify(data.user));
      navigate("/");
    } catch (err) {
      setError(err.message || "بيانات الدخول غير صحيحة");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={submit} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-7 w-full max-w-sm">
        <div className="flex flex-col items-center mb-5">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mb-2">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="font-extrabold text-slate-800">لوحة تحكم الأدمن</h1>
          <p className="text-xs text-slate-400 mt-1">EduCommunity — منطقة الإدارة</p>
        </div>

        {error && <p className="text-red-600 text-sm bg-red-50 rounded-lg p-2 mb-3 text-center">{error}</p>}

        <label className="block text-sm font-bold text-slate-600 mb-1">البريد الإلكتروني</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm mb-3 outline-none focus:border-blue-500"
          placeholder="admin@edu.eg"
        />

        <label className="block text-sm font-bold text-slate-600 mb-1">كلمة المرور</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm mb-4 outline-none focus:border-blue-500"
          placeholder="••••••••"
        />

        <button
          disabled={loading}
          className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-xl text-sm disabled:opacity-60"
        >
          {loading ? "جاري الدخول..." : "دخول"}
        </button>
      </form>
    </div>
  );
}

export default Login;
