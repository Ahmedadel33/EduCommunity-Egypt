import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// لوحة الأدمن — تطبيق منفصل عن تطبيق الطلاب/المدرسين
// بتشتغل على بورت 5200 وبتكلّم نفس الباك إند على 5000
export default defineConfig({
  base: "/",
  plugins: [react()],
  server: {
    port: 5200,
    strictPort: true,
    proxy: {
      "/api": { target: "http://localhost:5000", changeOrigin: true },
    },
  },
});
