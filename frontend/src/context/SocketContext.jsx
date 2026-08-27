import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

// ===== SocketContext =====
// بيدير اتصال Socket.IO واحد لكل التطبيق.
// ليه في context؟ عشان نفتح اتصال واحد بس (مش اتصال لكل صفحة)
// وأي كومبوننت يقدر يستخدمه.

const SocketContext = createContext(null);
const SOCKET_URL = "http://localhost:5000";

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // مفيش مستخدم = مفيش اتصال (الشات للمسجّلين بس)
    if (!user) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    // نفتح الاتصال ونبعت التوكن في الـ handshake عشان الباك يتأكد منّا
    const s = io(SOCKET_URL, { auth: { token } });

    s.on("connect", () => console.log("⚡ اتصال الشات جاهز"));
    s.on("connect_error", (err) => console.log("خطأ اتصال الشات:", err.message));

    setSocket(s);

    // نقفل الاتصال لما المستخدم يخرج أو الكومبوننت يتشال
    return () => s.disconnect();
  }, [user]);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
}

// hook بسيط عشان أي كومبوننت يجيب الـ socket
export function useSocket() {
  return useContext(SocketContext);
}
