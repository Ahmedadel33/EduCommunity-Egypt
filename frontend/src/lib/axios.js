import axios from "axios";

// ===== إعداد axios =====
// بننشئ نسخة axios واحدة بعنوان الباك، وبنركّب عليها "interceptors"
// (اعتراضات) تشتغل تلقائياً مع كل طلب ورد.

const BASE_URL = "http://localhost:5000/api/v1";

const http = axios.create({ baseURL: BASE_URL });

// ===== (1) اعتراض الطلبات: نحطّ التوكن تلقائياً =====
// بدل ما نكتب header في كل طلب، بنحطّه هنا مرة واحدة لكل الطلبات.
http.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // الـ access token
  if (token) config.headers.Authorization = "Bearer " + token;
  return config;
});

// ===== (2) اعتراض الردود: التجديد التلقائي =====
// الـ access token بيخلص بعد 15 دقيقة. لما ده يحصل، الباك بيرجّع 401.
// بدل ما نطلع المستخدم برّه، بنجدّد التوكن بالـ refresh token في الخلفية
// ونعيد الطلب اللي فشل — كل ده من غير ما المستخدم يحسّ بحاجة.

let isRefreshing = false;   // بنجدّد دلوقتي؟ (عشان مانجدّدش 100 مرة مع بعض)
let waitingQueue = [];      // الطلبات اللي مستنية التوكن الجديد

// لما التجديد ينجح، بنكمّل كل الطلبات المستنية
function onRefreshed(newToken) {
  waitingQueue.forEach((cb) => cb(newToken));
  waitingQueue = [];
}

http.interceptors.response.use(
  (response) => response, // الرد تمام، عدّيه زي ما هو
  async (error) => {
    const originalRequest = error.config;

    // نخلّي error.message هي رسالة الباك العربية بدل رسالة axios الإنجليزية
    // عشان الكومبوننتس تعمل toast.error(e.message) وتطلع رسالة مفهومة
    if (error.response?.data?.message) {
      error.message = error.response.data.message;
    }

    // لو مش 401، أو الطلب ده اتعاد تجديده قبل كده → مفيش تجديد
    if (error.response?.status !== 401 || originalRequest?._retried) {
      return Promise.reject(error);
    }

    const refreshToken = localStorage.getItem("refreshToken");
    // مفيش refresh token → المستخدم لازم يسجّل دخول من جديد
    if (!refreshToken) {
      localStorage.removeItem("token");
      return Promise.reject(error);
    }

    originalRequest._retried = true; // نعلّم الطلب إننا حاولنا نجدّد له مرة

    // لو فيه تجديد شغّال بالفعل، نستنّى التوكن الجديد بدل ما نجدّد تاني
    if (isRefreshing) {
      return new Promise((resolve) => {
        waitingQueue.push((newToken) => {
          originalRequest.headers.Authorization = "Bearer " + newToken;
          resolve(http(originalRequest));
        });
      });
    }

    isRefreshing = true;
    try {
      // نطلب access token جديد بالـ refresh token
      // (بنستخدم axios عادي مش http عشان مانخشّش في نفس الـ interceptor)
      const res = await axios.post(BASE_URL + "/auth/refresh", { refreshToken });
      const { token, refreshToken: newRefresh } = res.data.data;

      localStorage.setItem("token", token);
      localStorage.setItem("refreshToken", newRefresh);

      onRefreshed(token);                       // نكمّل الطلبات المستنية
      originalRequest.headers.Authorization = "Bearer " + token;
      return http(originalRequest);             // نعيد الطلب الأصلي
    } catch (refreshError) {
      // التجديد نفسه فشل → الجلسة خلصت فعلاً
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      window.location.href = "/auth";           // نوديه لصفحة الدخول
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default http;
