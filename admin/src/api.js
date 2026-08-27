import axios from "axios";

// ===== إعداد axios لتطبيق الأدمن =====
// نفس فكرة تطبيق الطلاب: نسخة واحدة فيها إضافة التوكن + التجديد التلقائي.
// الفرق الوحيد: التوكن هنا اسمه admin_token (مختلف عشان الأدمن والطالب
// ينفع يكونوا مفتوحين في نفس المتصفّح من غير ما يتلخبطوا).

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";
const http = axios.create({ baseURL: BASE_URL });

// (1) نحطّ التوكن تلقائياً في كل طلب
http.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token");
  if (token) config.headers.Authorization = "Bearer " + token;
  return config;
});

// (2) التجديد التلقائي لو الـ access token خلص
http.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    // نخلّي الرسالة هي رسالة الباك العربية
    if (error.response?.data?.message) error.message = error.response.data.message;

    if (error.response?.status !== 401 || original?._retried) {
      return Promise.reject(error);
    }

    const refreshToken = localStorage.getItem("admin_refresh_token");
    if (!refreshToken) return Promise.reject(error);

    original._retried = true;
    try {
      const res = await axios.post(BASE_URL + "/auth/refresh", { refreshToken });
      const { token, refreshToken: newRefresh } = res.data.data;
      localStorage.setItem("admin_token", token);
      localStorage.setItem("admin_refresh_token", newRefresh);
      original.headers.Authorization = "Bearer " + token;
      return http(original);
    } catch (e) {
      // الجلسة خلصت → رجوع لصفحة الدخول
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_refresh_token");
      window.location.href = "/login";
      return Promise.reject(e);
    }
  }
);

// الباك بيرجّع { success, message, data } — بنطلّع الـ data
function unwrap(res) {
  const body = res.data || {};
  return { ...(body.data || {}), meta: body.meta, message: body.message };
}

export const api = {
  login: (body) => http.post("/auth/login", body).then(unwrap),

  // إحصائيات ومستخدمين
  getStats: () => http.get("/admin/stats").then(unwrap),
  getUsers: () => http.get("/admin/users").then(unwrap),
  deleteUser: (id) => http.delete("/admin/users/" + id).then(unwrap),

  // المواد المعتمدة (لإحصائيات أكثر المواد محتوى)
  getMaterials: () => http.get("/materials?limit=100").then(unwrap),

  // كل المواد (معتمدة + منتظرة) بفلترة وبحث — للأدمن
  // params: { status, subject, teacher, search, grade, type }
  getAllMaterials: (params = {}) => {
    const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ""));
    const qs = new URLSearchParams(clean).toString();
    return http.get("/materials/all" + (qs ? "?" + qs : "")).then(unwrap);
  },

  // موافقة مواد المدرسين
  getPendingMaterials: () => http.get("/materials/pending").then(unwrap),
  approveMaterial: (id) => http.patch("/materials/" + id + "/approve").then(unwrap),
  deleteMaterial: (id) => http.delete("/materials/" + id).then(unwrap),

  // رفع مادة وزارة رسمية (الأدمن → معتمدة فوراً)
  getSubjects: (grade) => http.get("/subjects" + (grade ? "?grade=" + encodeURIComponent(grade) : "")).then(unwrap),
  createMaterial: (formData) => http.post("/materials", formData).then(unwrap),

  // إدارة المكافآت (منح شارة/جائزة/تكريم + عرض الكل)
  getRewards: () => http.get("/rewards").then(unwrap),
  grantReward: (body) => http.post("/rewards", body).then(unwrap),

  // متابعة (oversight) — الأدمن يشوف الدروس والتحديات والمهارات
  getLessons: () => http.get("/lessons").then(unwrap),
  getChallenges: () => http.get("/challenges").then(unwrap),
  getPendingChallenges: () => http.get("/challenges/pending").then(unwrap),
  approveChallenge: (id) => http.patch("/challenges/" + id + "/approve").then(unwrap),
  rejectChallenge: (id) => http.patch("/challenges/" + id + "/reject").then(unwrap),
  getTasks: () => http.get("/soft-skills/tasks").then(unwrap),

  // حضور المدرسين وحساب الوقت (للتقييم)
  getAttendance: () => http.get("/attendance").then(unwrap),

  // شيفتات المناوبة
  getShifts: () => http.get("/shifts").then(unwrap),
  createShift: (body) => http.post("/shifts", body).then(unwrap),
  deleteShift: (id) => http.delete("/shifts/" + id).then(unwrap),
};
