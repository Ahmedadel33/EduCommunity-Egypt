const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";
const BACKEND_ORIGIN = API_BASE_URL.startsWith("/")
  ? API_BASE_URL.replace(/\/$/, "")
  : API_BASE_URL.replace(/\/api(?:\/v1)?\/?$/, "");

export function resolveMediaUrl(url) {
  if (!url) return "";
  return url.startsWith("http") ? url : `${BACKEND_ORIGIN}${url}`;
}