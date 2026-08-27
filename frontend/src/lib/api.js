import http from "./axios";

// ===== طبقة الـAPI =====
// بنستخدم نسخة axios الجاهزة (http) اللي فيها:
//   - إضافة التوكن تلقائياً لكل طلب
//   - تجديد التوكن تلقائياً لو خلص (interceptor في axios.js)
//
// الباك بيرجّع كل الردود بالشكل: { success, message, data, meta? }
// فبنعمل دالة unwrap بتطلّع الـ data (وتضيف معاها message و meta لو موجودين)
// عشان الكومبوننتس تشتغل بنفس الشكل القديم (مثلاً data.materials).

function unwrap(res) {
  const body = res.data || {};
  return { ...(body.data || {}), meta: body.meta, message: body.message };
}

// نحوّل object لـ query string ونشيل القيم الفاضية
function toQuery(params = {}) {
  const clean = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
  );
  const qs = new URLSearchParams(clean).toString();
  return qs ? "?" + qs : "";
}

export const api = {
  // ===== الحسابات =====
  login: (body) => http.post("/auth/login", body).then(unwrap),
  register: (body) => http.post("/auth/register", body).then(unwrap),
  refresh: (refreshToken) => http.post("/auth/refresh", { refreshToken }).then(unwrap),
  getMe: () => http.get("/auth/me").then(unwrap),
  updateMe: (body) => http.patch("/auth/me", body).then(unwrap),

  // ===== المواد الدراسية =====
  getSubjects: (grade) => http.get("/subjects" + toQuery({ grade })).then(unwrap),
  createSubject: (body) => http.post("/subjects", body).then(unwrap),

  // ===== المواد التعليمية =====
  getMaterials: (params = {}) => http.get("/materials" + toQuery(params)).then(unwrap),
  getMaterial: (id) => http.get("/materials/" + id).then(unwrap),
  createMaterial: (formData) => http.post("/materials", formData).then(unwrap),
  deleteMaterial: (id) => http.delete("/materials/" + id).then(unwrap),
  getMyMaterials: () => http.get("/materials/mine").then(unwrap),

  // ===== شيفتات المدرسين المناوبين =====
  getShifts: (subject) => http.get("/shifts" + toQuery({ subject })).then(unwrap),
  getShiftsNow: (subject) => http.get("/shifts/now" + toQuery({ subject })).then(unwrap),

  // ===== حضور المدرس نفسه =====
  getMyAttendance: () => http.get("/attendance/me").then(unwrap),
  checkoutAttendance: () => http.post("/attendance/checkout").then(unwrap),

  // ===== الشات (السجل — اللحظي عبر Socket) =====
  getMessages: (room) => http.get("/chat/messages" + toQuery({ room })).then(unwrap),
  sendMessage: (room, text) => http.post("/chat/messages", { room, text }).then(unwrap),
  // رفع مرفق للشات (صوت/صورة/ملف) — بيرجّع { url, name, type }
  uploadChatFile: (formData) => http.post("/chat/upload", formData).then(unwrap),

  // ===== الدروس أونلاين =====
  getLessons: (grade) => http.get("/lessons" + toQuery({ grade })).then(unwrap),
  createLesson: (body) => http.post("/lessons", body).then(unwrap),
  deleteLesson: (id) => http.delete("/lessons/" + id).then(unwrap),

  // ===== السوفت سكيلز =====
  getTasks: () => http.get("/soft-skills/tasks").then(unwrap),
  createTask: (body) => http.post("/soft-skills/tasks", body).then(unwrap),
  submitTask: (id, formData) => http.post("/soft-skills/tasks/" + id + "/submit", formData).then(unwrap),
  getTaskSubmissions: (taskId) => http.get("/soft-skills/submissions" + toQuery({ task: taskId })).then(unwrap),
  gradeSubmission: (id, body) => http.patch("/soft-skills/submissions/" + id + "/grade", body).then(unwrap),

  // ===== المكافآت =====
  getRewards: () => http.get("/rewards").then(unwrap),
  grantReward: (body) => http.post("/rewards", body).then(unwrap),

  // ===== المجتمع =====
  getPosts: () => http.get("/posts").then(unwrap),
  createPost: (formData) => http.post("/posts", formData).then(unwrap),
  likePost: (id) => http.post("/posts/" + id + "/like").then(unwrap),
  getComments: (id) => http.get("/posts/" + id + "/comments").then(unwrap),
  createComment: (id, content) => http.post("/posts/" + id + "/comments", { content }).then(unwrap),

  // ===== التحديات =====
  getChallenges: () => http.get("/challenges").then(unwrap),
  getSubmissions: () => http.get("/challenges/submissions").then(unwrap),
  submitChallenge: (id, answer) => http.post("/challenges/" + id + "/submit", { answer }).then(unwrap),

  // ===== المتصدّرون =====
  getLeaderboard: (grade) => http.get("/leaderboard" + toQuery({ grade })).then(unwrap),
  getSchools: () => http.get("/leaderboard/schools").then(unwrap),

  // ===== المدرسون =====
  getTeachers: () => http.get("/teachers").then(unwrap),
  rateTeacher: (id, rating, comment) => http.post("/teachers/" + id + "/rate", { rating, comment }).then(unwrap),

  // ===== الأدمن =====
  getAdminStats: () => http.get("/admin/stats").then(unwrap),
  getAdminUsers: () => http.get("/admin/users").then(unwrap),
  deleteUser: (id) => http.delete("/admin/users/" + id).then(unwrap),
};
